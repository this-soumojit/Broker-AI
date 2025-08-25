import { Request, Response, NextFunction } from "express";

import { Sale, SalePayment } from "../../models";
import { throwCustomError } from "../../utils/error";

const createV1 = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { saleId } = req.params;

    const { amount, paymentMethod, referenceNumber, notes } = req.body;

    const saleRecord = await Sale.findByPk(saleId);

    if (!saleRecord) {
      return throwCustomError(404, "Sale not found");
    }

    const salePaymentRecord = await SalePayment.create({
      amount,
      paymentMethod,
      referenceNumber,
      notes,
      saleId,
    });

    if (!salePaymentRecord) {
      return throwCustomError(500, "Failed to create sale payment");
    }

    res.status(201).json({
      message: "Sale payment created successfully",
      data: salePaymentRecord.dataValues,
    });
  } catch (error) {
    next(error);
  }
};

export { createV1 };
