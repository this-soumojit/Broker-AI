import { Request, Response, NextFunction } from "express";

import { GoodsReturnProduct } from "../../models";
import { throwCustomError } from "../../utils/error";

const deleteV1 = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { goodsReturnProductId } = req.params;

    const goodsReturnProductRecord = await GoodsReturnProduct.findByPk(goodsReturnProductId);

    if (!goodsReturnProductRecord) {
      return throwCustomError(404, "Goods return product not found");
    }

    await goodsReturnProductRecord.destroy();

    res.status(204).send();
  } catch (error) {
    next(error);
  }
};

export { deleteV1 };
