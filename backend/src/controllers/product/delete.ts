import { Request, Response, NextFunction } from "express";

import { Product } from "../../models";
import { throwCustomError } from "../../utils/error";

const deleteV1 = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { productId } = req.params;

    const productRecord = await Product.findByPk(productId);

    if (!productRecord) {
      return throwCustomError(404, "Product not found");
    }

    await productRecord.destroy();

    res.status(204).send();
  } catch (error) {
    next(error);
  }
};

export { deleteV1 };
