import { Request, Response, NextFunction } from "express";
import { Sale, Client } from "../../models";
import { throwCustomError } from "../../utils/error";
import { Op } from "sequelize";

const getSalesV1 = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { userId, clientId } = req.params;
    const { page = 1, limit = 10 } = req.query;

    if (!userId) {
      return throwCustomError(400, "User ID is required");
    }

    if (!clientId) {
      return throwCustomError(400, "Client ID is required");
    }

    // Verify client exists and belongs to user
    const client = await Client.findOne({
      where: { id: clientId, userId },
    });

    if (!client) {
      return throwCustomError(404, "Client not found");
    }

    // Calculate offset for pagination
    const offset = (Number(page) - 1) * Number(limit);

    // Get sales where client is buyer or seller
    const { rows: sales, count: totalSales } = await Sale.findAndCountAll({
      where: {
        [Op.or]: [{ buyerId: clientId }, { sellerId: clientId }],
      },
      order: [["createdAt", "DESC"]],
      limit: Number(limit),
      offset: offset,
      include: [
        {
          model: Client,
          as: "buyer",
          attributes: ["id", "name", "email", "phone"],
        },
        {
          model: Client,
          as: "seller",
          attributes: ["id", "name", "email", "phone"],
        },
      ],
    });

    // Calculate summary statistics
    const allSales = await Sale.findAll({
      where: {
        [Op.or]: [{ buyerId: clientId }, { sellerId: clientId }],
      },
      attributes: ["invoiceNetAmount", "invoiceDate", "createdAt"],
    });

    const totalOrders = allSales.length;
    const totalSalesAmount = allSales.reduce(
      (sum, sale) => sum + ((sale.get("invoiceNetAmount") as number) || 0),
      0,
    );
    const lastPurchaseDate = allSales.length > 0 ? allSales[0]?.get("invoiceDate") : null;

    const summary = {
      totalOrders,
      totalSales: totalSalesAmount,
      lastPurchaseDate,
    };

    res.status(200).json({
      data: {
        sales,
        summary,
        pagination: {
          page: Number(page),
          limit: Number(limit),
          total: totalSales,
          pages: Math.ceil(totalSales / Number(limit)),
        },
      },
    });
  } catch (error) {
    next(error);
  }
};

export { getSalesV1 };
