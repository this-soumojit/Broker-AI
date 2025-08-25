import { Request, Response, NextFunction } from "express";

import { SalePayment } from "../../models";
import { throwCustomError } from "../../utils/error";

const deleteV1 = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { salePaymentId } = req.params;

    const salePaymentRecord = await SalePayment.findByPk(salePaymentId);

    if (!salePaymentRecord) {
      return throwCustomError(404, "Sale payment not found");
    }

    await salePaymentRecord.destroy();

    res.status(204).send();
  } catch (error) {
    next(error);
  }
};

export { deleteV1 };
