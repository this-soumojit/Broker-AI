import { Request, Response, NextFunction } from "express";

import { Product } from "../../models";
import { throwCustomError } from "../../utils/error";

const getByIdV1 = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { productId } = req.params;

    const productRecord = await Product.findByPk(productId, {
      attributes: {
        exclude: ["saleId"],
      },
    });

    if (!productRecord) {
      return throwCustomError(404, "Product not found");
    }

    res.status(200).json({
      message: "Product retrieved successfully",
      data: productRecord.dataValues,
    });
  } catch (error) {
    next(error);
  }
};

export { getByIdV1 };
