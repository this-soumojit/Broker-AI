import { Request, Response, NextFunction } from "express";

import { GoodsReturn } from "../../models";
import { throwCustomError } from "../../utils/error";

const getByIdV1 = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { goodsReturnId } = req.params;

    const goodsReturnRecord = await GoodsReturn.findByPk(goodsReturnId, {
      attributes: {
        exclude: ["saleId"],
      },
    });

    if (!goodsReturnRecord) {
      return throwCustomError(404, "Goods return not found");
    }

    res.status(200).json({
      message: "Goods return retrieved successfully",
      data: goodsReturnRecord.dataValues,
    });
  } catch (error) {
    next(error);
  }
};

export { getByIdV1 };
