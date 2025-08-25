import { Request, Response, NextFunction } from "express";
import { Op } from "sequelize";

import { Client, Sale } from "../../models";

const getV1 = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { q } = req.query;
    const { bookId } = req.params;

    const where: Record<string | symbol, unknown> = {
      bookId,
    };

    if (q) {
      const searchConditions: any[] = [
        { lorryReceiptNumber: { [Op.iLike]: `%${q}%` } },
        { caseNumber: { [Op.iLike]: `%${q}%` } },
        { transportName: { [Op.iLike]: `%${q}%` } },
        { transportNumber: { [Op.iLike]: `%${q}%` } },
        { eWayBillNumber: { [Op.iLike]: `%${q}%` } },
        { challanNumber: { [Op.iLike]: `%${q}%` } },
        { invoiceNumber: { [Op.iLike]: `%${q}%` } },
        { notes: { [Op.iLike]: `%${q}%` } },
      ];

      const clientIds = await Client.findAll({
        where: {
          name: {
            [Op.iLike]: `%${q}%`,
          },
        },
        attributes: ["id"],
      });

      if (clientIds.length > 0) {
        searchConditions.push(
          { buyerId: { [Op.in]: clientIds.map((client) => client.dataValues.id) } },
          { sellerId: { [Op.in]: clientIds.map((client) => client.dataValues.id) } }
        );
      }

      where[Op.or] = searchConditions;
    }

    const saleRecords = await Sale.findAll({
      where,
      attributes: {
        exclude: ["bookId"],
      },
      include: [
        {
          model: Client,
          as: "buyer",
          attributes: ["id", "name", "phone", "address", "gstin", "pan", "email"],
        },
        {
          model: Client,
          as: "seller",
          attributes: ["id", "name", "phone", "address", "gstin", "pan", "email"],
        },
      ],
    });

    res.status(200).json({
      message: "Sales retrieved successfully",
      data: saleRecords.map((record) => record.dataValues),
    });
  } catch (error) {
    next(error);
  }
};

export { getV1 };
