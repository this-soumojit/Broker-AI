import { Request, Response, NextFunction } from "express";

import { GoodsReturn } from "../../models";
import { throwCustomError } from "../../utils/error";

const updateV1 = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { goodsReturnId } = req.params;

    const { notes } = req.body;

    const goodsReturnRecord = await GoodsReturn.findByPk(goodsReturnId, {
      attributes: {
        exclude: ["saleId"],
      },
    });

    if (!goodsReturnRecord) {
      return throwCustomError(404, "Goods return not found");
    }

    if (Object.prototype.hasOwnProperty.call(req.body, "notes")) {
      goodsReturnRecord.dataValues.notes = notes;
    }

    await goodsReturnRecord.save();

    res.status(200).json({
      message: "Goods return updated successfully",
      data: goodsReturnRecord.dataValues,
    });
  } catch (error) {
    next(error);
  }
};

export { updateV1 };
