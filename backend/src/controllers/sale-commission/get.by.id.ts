import { Request, Response, NextFunction } from "express";

import { SaleCommission } from "../../models";
import { throwCustomError } from "../../utils/error";

const getByIdV1 = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { saleCommissionId } = req.params;

    const saleCommissionRecord = await SaleCommission.findByPk(saleCommissionId, {
      attributes: {
        exclude: ["salePaymentId"],
      },
    });

    if (!saleCommissionRecord) {
      return throwCustomError(404, "Sale commission not found");
    }

    res.status(200).json({
      message: "Sale commission retrieved successfully",
      data: saleCommissionRecord.dataValues,
    });
  } catch (error) {
    next(error);
  }
};

export { getByIdV1 };
