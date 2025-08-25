import { Request, Response, NextFunction } from "express";

import { SaleCommission } from "../../models";
import { throwCustomError } from "../../utils/error";

const deleteV1 = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { saleCommissionId } = req.params;

    const saleCommissionRecord = await SaleCommission.findByPk(saleCommissionId);

    if (!saleCommissionRecord) {
      return throwCustomError(404, "Sale commission not found");
    }

    await saleCommissionRecord.destroy();

    res.status(204).send();
  } catch (error) {
    next(error);
  }
};

export { deleteV1 };
