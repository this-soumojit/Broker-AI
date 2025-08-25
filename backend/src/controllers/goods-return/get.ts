import { Request, Response, NextFunction } from "express";

import { GoodsReturn } from "../../models";

const getV1 = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { saleId } = req.params;

    const goodsReturnRecords = await GoodsReturn.findAll({
      where: { saleId },
      attributes: {
        exclude: ["saleId"],
      },
    });

    res.status(200).json({
      message: "Goods returns retrieved successfully",
      data: goodsReturnRecords.map((record) => record.dataValues),
    });
  } catch (error) {
    next(error);
  }
};

export { getV1 };
