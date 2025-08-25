import { Request, Response, NextFunction } from "express";

import { sequelize } from "../../config/db";
import { GoodsReturn, GoodsReturnProduct, Product } from "../../models";
import { roundNumber } from "../../utils";
import { throwCustomError } from "../../utils/error";

const createV1 = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  const transaction = await sequelize.transaction();

  try {
    const { goodsReturnId } = req.params;

    const goodsReturnRecord = await GoodsReturn.findByPk(goodsReturnId, {
      transaction,
    });

    if (!goodsReturnRecord) {
      return throwCustomError(404, "Goods return not found");
    }

    const { productId, quantity } = req.body;

    const productRecord = await Product.findByPk(productId, {
      transaction,
    });

    if (!productRecord) {
      return throwCustomError(404, "Product not found");
    }

    const goodsReturnProductRecord = await GoodsReturnProduct.create(
      {
        productId,
        quantity,
        goodsReturnId,
      },
      {
        transaction,
      },
    );

    if (!goodsReturnProductRecord) {
      return throwCustomError(500, "Failed to create goods return product");
    }

    const grossAmount = roundNumber(productRecord.dataValues.rate * quantity);
    const discountAmount =
      productRecord.dataValues.discountRate > 0
        ? roundNumber((grossAmount * productRecord.dataValues.discountRate) / 100)
        : 0;
    const taxAmount = roundNumber(
      ((grossAmount - discountAmount) * productRecord.dataValues.gstRate) / 100,
    );
    const netAmount = roundNumber(grossAmount - discountAmount + taxAmount);

    goodsReturnRecord.dataValues.grossAmount += grossAmount;
    goodsReturnRecord.dataValues.discountAmount += discountAmount;
    goodsReturnRecord.dataValues.taxAmount += taxAmount;
    goodsReturnRecord.dataValues.netAmount += netAmount;

    await goodsReturnRecord.save({ transaction });

    await transaction.commit();

    res.status(201).json({
      message: "Goods return product created successfully",
      data: goodsReturnProductRecord.dataValues,
    });
  } catch (error) {
    await transaction.rollback();
    next(error);
  }
};

export { createV1 };
