import { Request, Response, NextFunction } from "express";

import { Sale, SalePayment } from "../../models";

const getV1 = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { saleId } = req.params;

    const salePaymentRecords = await SalePayment.findAll({
      where: { saleId },
      attributes: {
        exclude: ["saleId"],
      },
      include: [
        {
          model: Sale,
          as: "Sale",
          attributes: ["invoiceNumber"],
        },
      ],
    });

    res.status(200).json({
      message: "Sale payments retrieved successfully",
      data: salePaymentRecords.map((record) => record.dataValues),
    });
  } catch (error) {
    next(error);
  }
};

export { getV1 };
