import { Request, Response, NextFunction } from "express";

import { Sale, Client } from "../../models";
import { throwCustomError } from "../../utils/error";
import { Op, col } from "sequelize";

const getByIdV1 = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { saleId } = req.params;

    const saleRecord = await Sale.findOne({
      where: { id: saleId },
      include: [
        {
          model: Client,
          as: "buyer",
          where: { id: { [Op.eq]: col("Sale.buyerId") } },
          attributes: ["id", "name", "phone", "address", "gstin", 'pan', 'email'],
          required: false,
        },
        {
          model: Client,
          as: "seller",
          where: { id: { [Op.eq]: col("Sale.sellerId") } },
          attributes: ["id", "name", "phone", "address", "gstin", "pan", 'email'],
          required: false,
        },
      ],
    });

    if (!saleRecord) {
      return throwCustomError(404, "Sale not found");
    }

    res.status(200).json({
      message: "Sale retrieved successfully",
      data: saleRecord.dataValues,
    });
  } catch (error) {
    next(error);
  }
};

export { getByIdV1 };
