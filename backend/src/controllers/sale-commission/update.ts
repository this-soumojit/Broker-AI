import { Request, Response, NextFunction } from "express";

import { SaleCommission } from "../../models";
import { throwCustomError } from "../../utils/error";

const updateV1 = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { saleCommissionId } = req.params;

    const { amount, paymentMethod, referenceNumber, notes } = req.body;

    const saleCommissionRecord = await SaleCommission.findByPk(saleCommissionId, {
      attributes: {
        exclude: ["salePaymentId"],
      },
    });

    if (!saleCommissionRecord) {
      return throwCustomError(404, "Sale commission not found");
    }

    if (Object.prototype.hasOwnProperty.call(req.body, "amount")) {
      saleCommissionRecord.dataValues.amount = amount;
    }

    if (Object.prototype.hasOwnProperty.call(req.body, "paymentMethod")) {
      saleCommissionRecord.dataValues.paymentMethod = paymentMethod;
    }

    if (Object.prototype.hasOwnProperty.call(req.body, "referenceNumber")) {
      saleCommissionRecord.dataValues.referenceNumber = referenceNumber;
    }

    if (Object.prototype.hasOwnProperty.call(req.body, "notes")) {
      saleCommissionRecord.dataValues.notes = notes;
    }

    await saleCommissionRecord.save();

    res.status(200).json({
      message: "Sale commission updated successfully",
      data: saleCommissionRecord.dataValues,
    });
  } catch (error) {
    next(error);
  }
};

export { updateV1 };
