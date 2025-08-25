import { Request, Response, NextFunction } from "express";

import { GoodsReturn } from "../../models";
import { throwCustomError } from "../../utils/error";

const createV1 = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { saleId } = req.params;

    const { notes } = req.body;

    const goodsReturnRecord = await GoodsReturn.create({
      notes,
      saleId,
    });

    if (!goodsReturnRecord) {
      return throwCustomError(500, "Failed to create goods return");
    }

    res.status(201).json({
      message: "Goods return created successfully",
      data: goodsReturnRecord.dataValues,
    });
  } catch (error) {
    next(error);
  }
};

export { createV1 };
