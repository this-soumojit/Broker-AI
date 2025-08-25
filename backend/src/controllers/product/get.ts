import { Request, Response, NextFunction } from "express";

import { Product } from "../../models";

const getV1 = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { saleId } = req.params;

    const productRecords = await Product.findAll({
      where: { saleId },
      attributes: {
        exclude: ["saleId"],
      },
      order: [["createdAt", "DESC"]],
    });

    res.status(200).json({
      message: "Products retrieved successfully",
      data: productRecords.map((record) => record.dataValues),
    });
  } catch (error) {
    next(error);
  }
};

export { getV1 };
