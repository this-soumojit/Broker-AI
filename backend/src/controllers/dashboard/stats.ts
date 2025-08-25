import { Request, Response, NextFunction } from "express";
import { Op } from "sequelize";
import { Sale, Client, SalePayment, SaleCommission } from "../../models";

const getDashboardStatsV1 = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { userId, bookId } = req.params;

    // Get total clients
    const totalClients = await Client.count({
      where: { userId },
    });

    // Get all sales for the book
    const sales = await Sale.findAll({
      where: { bookId },
      include: [
        {
          model: Client,
          as: "buyer",
          attributes: ["id", "name"],
        },
        {
          model: Client,
          as: "seller", 
          attributes: ["id", "name"],
        }
      ],
    });

    // Calculate total sales amount
    const totalSales = sales.reduce((sum, sale) => sum + (sale.dataValues.invoiceNetAmount || 0), 0);

    // For purchases, we'll calculate from seller perspective (when user's client is the buyer)
    // This is a simplified approach - you might want to create separate purchase entities
    const userClientIds = await Client.findAll({
      where: { userId },
      attributes: ["id"],
    }).then(clients => clients.map(c => c.dataValues.id));

    const purchases = sales.filter(sale => 
      userClientIds.includes(sale.dataValues.buyerId)
    );
    const totalPurchases = purchases.reduce((sum, sale) => sum + (sale.dataValues.invoiceNetAmount || 0), 0);

    // Get all sale payments
    const saleIds = sales.map(sale => sale.dataValues.id);
    const salePayments = await SalePayment.findAll({
      where: {
        saleId: { [Op.in]: saleIds }
      }
    });

    // Get all sale commissions
    const paymentIds = salePayments.map(payment => payment.dataValues.id);
    const saleCommissions = await SaleCommission.findAll({
      where: {
        salePaymentId: { [Op.in]: paymentIds }
      }
    });

    const totalCommission = saleCommissions.reduce((sum, commission) => sum + (commission.dataValues.amount || 0), 0);
    const totalPayments = salePayments.reduce((sum, payment) => sum + (payment.dataValues.amount || 0), 0);

    // Calculate due amounts
    const totalAmountDue = totalSales - totalPayments;
    const totalCommissionDue = sales.reduce((sum, sale) => {
      const commissionAmount = (sale.dataValues.invoiceNetAmount || 0) * (sale.dataValues.commissionRate || 0) / 100;
      return sum + commissionAmount;
    }, 0) - totalCommission;

    // Generate monthly data for the last 12 months
    const monthlyData = [];
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const currentDate = new Date();
    
    for (let i = 11; i >= 0; i--) {
      const monthDate = new Date(currentDate.getFullYear(), currentDate.getMonth() - i, 1);
      const nextMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() - i + 1, 1);
      
      const monthlySales = sales.filter(sale => {
        const saleDate = new Date(sale.dataValues.invoiceDate);
        return saleDate >= monthDate && saleDate < nextMonth;
      });

      const monthlyPurchases = purchases.filter(sale => {
        const saleDate = new Date(sale.dataValues.invoiceDate);
        return saleDate >= monthDate && saleDate < nextMonth;
      });

      monthlyData.push({
        month: months[monthDate.getMonth()],
        sales: monthlySales.reduce((sum, sale) => sum + (sale.dataValues.invoiceNetAmount || 0), 0),
        purchases: monthlyPurchases.reduce((sum, sale) => sum + (sale.dataValues.invoiceNetAmount || 0), 0),
      });
    }

    // Get latest due invoices (due within next 30 days)
    const thirtyDaysFromNow = new Date();
    thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 30);
    
    const latestDueInvoices = sales
      .filter(sale => {
        if (!sale.dataValues.invoiceDate || !sale.dataValues.invoiceDueDays) return false;
        const dueDate = new Date(sale.dataValues.invoiceDate);
        dueDate.setDate(dueDate.getDate() + sale.dataValues.invoiceDueDays);
        return dueDate <= thirtyDaysFromNow && sale.dataValues.status !== 'PAID';
      })
      .sort((a, b) => {
        const dueDateA = new Date(a.dataValues.invoiceDate);
        dueDateA.setDate(dueDateA.getDate() + a.dataValues.invoiceDueDays);
        const dueDateB = new Date(b.dataValues.invoiceDate);
        dueDateB.setDate(dueDateB.getDate() + b.dataValues.invoiceDueDays);
        return dueDateA.getTime() - dueDateB.getTime();
      })
      .slice(0, 5)
      .map(sale => {
        const dueDate = new Date(sale.dataValues.invoiceDate);
        dueDate.setDate(dueDate.getDate() + sale.dataValues.invoiceDueDays);
        return {
          id: sale.dataValues.id,
          invoiceNumber: sale.dataValues.invoiceNumber,
          invoiceDate: sale.dataValues.invoiceDate,
          buyer: sale.dataValues.buyer,
          seller: sale.dataValues.seller,
          invoiceNetAmount: sale.dataValues.invoiceNetAmount,
          status: sale.dataValues.status,
          dueDate: dueDate.toISOString(),
        };
      });

    // Get latest overdue invoices (overdue within last 15 days)
    const fifteenDaysAgo = new Date();
    fifteenDaysAgo.setDate(fifteenDaysAgo.getDate() - 15);
    
    const latestOverdueInvoices = sales
      .filter(sale => {
        if (!sale.dataValues.invoiceDate || !sale.dataValues.invoiceDueDays) return false;
        const dueDate = new Date(sale.dataValues.invoiceDate);
        dueDate.setDate(dueDate.getDate() + sale.dataValues.invoiceDueDays);
        return dueDate >= fifteenDaysAgo && dueDate < new Date() && sale.dataValues.status === 'OVERDUE';
      })
      .sort((a, b) => {
        const dueDateA = new Date(a.dataValues.invoiceDate);
        dueDateA.setDate(dueDateA.getDate() + a.dataValues.invoiceDueDays);
        const dueDateB = new Date(b.dataValues.invoiceDate);
        dueDateB.setDate(dueDateB.getDate() + b.dataValues.invoiceDueDays);
        return dueDateB.getTime() - dueDateA.getTime();
      })
      .slice(0, 5)
      .map(sale => {
        const dueDate = new Date(sale.dataValues.invoiceDate);
        dueDate.setDate(dueDate.getDate() + sale.dataValues.invoiceDueDays);
        return {
          id: sale.dataValues.id,
          invoiceNumber: sale.dataValues.invoiceNumber,
          invoiceDate: sale.dataValues.invoiceDate,
          buyer: sale.dataValues.buyer,
          seller: sale.dataValues.seller,
          invoiceNetAmount: sale.dataValues.invoiceNetAmount,
          status: sale.dataValues.status,
          dueDate: dueDate.toISOString(),
        };
      });

    const dashboardData = {
      stats: {
        totalClients,
        totalSales: Math.round(totalSales * 100) / 100,
        totalPurchases: Math.round(totalPurchases * 100) / 100,
        totalCommission: Math.round(totalCommission * 100) / 100,
        totalAmountDue: Math.round(Math.max(0, totalAmountDue) * 100) / 100,
        totalCommissionDue: Math.round(Math.max(0, totalCommissionDue) * 100) / 100,
      },
      monthlyData,
      latestDueInvoices,
      latestOverdueInvoices,
    };

    res.status(200).json({
      message: "Dashboard data retrieved successfully",
      data: dashboardData,
    });
  } catch (error) {
    next(error);
  }
};

export { getDashboardStatsV1 };
