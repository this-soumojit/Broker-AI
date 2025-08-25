import { Request, Response, NextFunction } from "express";

import { SalePayment } from "../../models";
import { throwCustomError } from "../../utils/error";

const updateV1 = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { salePaymentId } = req.params;

    const { amount, paymentMethod, referenceNumber, notes } = req.body;

    const salePaymentRecord = await SalePayment.findByPk(salePaymentId, {
      attributes: {
        exclude: ["saleId"],
      },
    });

    if (!salePaymentRecord) {
      return throwCustomError(404, "Sale payment not found");
    }

    if (Object.prototype.hasOwnProperty.call(req.body, "amount")) {
      salePaymentRecord.dataValues.amount = amount;
    }

    if (Object.prototype.hasOwnProperty.call(req.body, "paymentMethod")) {
      salePaymentRecord.dataValues.paymentMethod = paymentMethod;
    }

    if (Object.prototype.hasOwnProperty.call(req.body, "referenceNumber")) {
      salePaymentRecord.dataValues.referenceNumber = referenceNumber;
    }

    if (Object.prototype.hasOwnProperty.call(req.body, "notes")) {
      salePaymentRecord.dataValues.notes = notes;
    }

    await salePaymentRecord.save();

    res.status(200).json({
      message: "Sale payment updated successfully",
      data: salePaymentRecord.dataValues,
    });
  } catch (error) {
    next(error);
  }
};

export { updateV1 };
