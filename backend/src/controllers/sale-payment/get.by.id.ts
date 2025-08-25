import { Request, Response, NextFunction } from "express";

import { SalePayment } from "../../models";
import { throwCustomError } from "../../utils/error";

const getByIdV1 = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { salePaymentId } = req.params;

    const salePaymentRecord = await SalePayment.findByPk(salePaymentId, {
      attributes: {
        exclude: ["saleId"],
      },
    });

    if (!salePaymentRecord) {
      return throwCustomError(404, "Sale payment not found");
    }

    res.status(200).json({
      message: "Sale payment retrieved successfully",
      data: salePaymentRecord.dataValues,
    });
  } catch (error) {
    next(error);
  }
};

export { getByIdV1 };
