import { Request, Response, NextFunction } from "express";

import { GoodsReturnProduct, Product } from "../../models";

const getV1 = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { goodsReturnId } = req.params;

    const goodsReturnProductRecords = await GoodsReturnProduct.findAll({
      where: { goodsReturnId },
      attributes: { exclude: ["goodsReturnId"] },
      include: [
        {
          model: Product,
          as: "Product", // Ensure this matches the association alias in your model definition
          attributes: ["name", "quantity", "unit", "rate", "gstRate", "discountRate", "notes"],
        },
      ],
      order: [["createdAt", "DESC"]],
    });

    res.status(200).json({
      message: "Goods return products retrieved successfully",
      data: goodsReturnProductRecords.map((record) => record.dataValues),
    });
  } catch (error) {
    next(error);
  }
};

export { getV1 };
