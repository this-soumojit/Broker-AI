import { Request, Response, NextFunction } from "express";

import { Sale } from "../../models";
import { throwCustomError } from "../../utils/error";

const deleteV1 = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { saleId } = req.params;

    const saleRecord = await Sale.findByPk(saleId);

    if (!saleRecord) {
      return throwCustomError(404, "Sale not found");
    }

    await saleRecord.destroy();

    res.status(204).send();
  } catch (error) {
    next(error);
  }
};

export { deleteV1 };
