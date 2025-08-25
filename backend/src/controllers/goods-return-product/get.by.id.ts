import { Request, Response, NextFunction } from "express";

import { GoodsReturnProduct } from "../../models";
import { throwCustomError } from "../../utils/error";

const getByIdV1 = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { goodsReturnProductId } = req.params;

    const goodsReturnProductRecord = await GoodsReturnProduct.findByPk(goodsReturnProductId, {
      attributes: {
        exclude: ["goodsReturnId"],
      },
    });

    if (!goodsReturnProductRecord) {
      return throwCustomError(404, "Goods return product not found");
    }

    res.status(200).json({
      message: "Goods return product retrieved successfully",
      data: goodsReturnProductRecord.dataValues,
    });
  } catch (error) {
    next(error);
  }
};

export { getByIdV1 };
