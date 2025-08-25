import { Request, Response, NextFunction } from "express";

import { Sale, SaleCommission } from "../../models";

const getV1 = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { salePaymentId } = req.params;

    const saleCommissionRecords = await SaleCommission.findAll({
      where: { salePaymentId },
      attributes: {
        exclude: ["salePaymentId"],
      }
    });

    res.status(200).json({
      message: "Sale commissions retrieved successfully",
      data: saleCommissionRecords.map((record) => record.dataValues),
    });
  } catch (error) {
    next(error);
  }
};

export { getV1 };
