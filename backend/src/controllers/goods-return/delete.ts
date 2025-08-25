import { Request, Response, NextFunction } from "express";

import { GoodsReturn } from "../../models";
import { throwCustomError } from "../../utils/error";

const deleteV1 = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { goodsReturnId } = req.params;

    const goodsReturnRecord = await GoodsReturn.findByPk(goodsReturnId);

    if (!goodsReturnRecord) {
      return throwCustomError(404, "Goods return not found");
    }

    await goodsReturnRecord.destroy();

    res.status(204).send();
  } catch (error) {
    next(error);
  }
};

export { deleteV1 };
