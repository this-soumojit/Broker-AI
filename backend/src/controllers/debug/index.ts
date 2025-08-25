import { Request, Response, NextFunction } from "express";
import { Sale, Client } from "../../models";
import { logger } from "../../utils/logger";
import { Op } from "sequelize";

/**
 * Debug endpoint to check what sales exist in database
 */
const debugSalesV1 = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    logger.info("Debug: Checking all sales in database...");

    // Get all sales regardless of status
    const allSales = await Sale.findAll({
      limit: 20, // Limit to first 20 for debugging
      include: [
        {
          model: Client,
          as: "buyer",
          required: false,
        },
        {
          model: Client,
          as: "seller",
          required: false,
        },
      ],
    });

    logger.info(`Debug: Found ${allSales.length} total sales`);

    const salesData = allSales.map((sale) => {
      const saleData = sale.dataValues;
      const saleWithIncludes = sale as any;

      return {
        id: saleData.id,
        invoiceNumber: saleData.invoiceNumber,
        invoiceDate: saleData.invoiceDate,
        invoiceDueDays: saleData.invoiceDueDays,
        status: saleData.status,
        buyer: saleWithIncludes.buyer
          ? {
              id: saleWithIncludes.buyer.dataValues.id,
              name: saleWithIncludes.buyer.dataValues.name,
              userId: saleWithIncludes.buyer.dataValues.userId,
            }
          : null,
        seller: saleWithIncludes.seller
          ? {
              id: saleWithIncludes.seller.dataValues.id,
              name: saleWithIncludes.seller.dataValues.name,
              userId: saleWithIncludes.seller.dataValues.userId,
            }
          : null,
      };
    });

    // Check specifically for PENDING sales
    const pendingSales = await Sale.findAll({
      where: {
        status: "PENDING",
      },
      include: [
        {
          model: Client,
          as: "buyer",
          required: false,
        },
        {
          model: Client,
          as: "seller",
          required: false,
        },
      ],
    });

    logger.info(`Debug: Found ${pendingSales.length} PENDING sales`);

    res.status(200).json({
      message: "Debug information retrieved",
      data: {
        totalSales: allSales.length,
        pendingSalesCount: pendingSales.length,
        sampleSales: salesData,
        pendingStatuses: pendingSales.map((s) => s.dataValues.status),
        uniqueStatuses: [...new Set(allSales.map((s) => s.dataValues.status))],
      },
    });
  } catch (error) {
    logger.error("Error in debugSalesV1:", error);
    next(error);
  }
};

export { debugSalesV1 };
