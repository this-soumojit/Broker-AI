import { Request, Response, NextFunction } from "express";

import { SaleCommission, SalePayment } from "../../models";
import { throwCustomError } from "../../utils/error";

const createV1 = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { salePaymentId } = req.params;

    const { amount, paymentMethod, referenceNumber, notes } = req.body;

    const salePaymentRecord = await SalePayment.findByPk(salePaymentId);

    if (!salePaymentRecord) {
      return throwCustomError(404, "Sale payment not found");
    }

    const saleCommissionRecord = await SaleCommission.create({
      amount,
      paymentMethod,
      referenceNumber,
      notes,
      salePaymentId,
    });

    if (!saleCommissionRecord) {
      return throwCustomError(500, "Failed to create sale commission");
    }

    res.status(201).json({
      message: "Sale commission created successfully",
      data: saleCommissionRecord.dataValues,
    });
  } catch (error) {
    next(error);
  }
};

export { createV1 };
