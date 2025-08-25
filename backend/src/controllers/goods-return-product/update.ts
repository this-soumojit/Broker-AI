import { Request, Response, NextFunction } from "express";

import { sequelize } from "../../config/db";
import { GoodsReturn, GoodsReturnProduct, Product } from "../../models";
import { roundNumber } from "../../utils";
import { throwCustomError } from "../../utils/error";

const updateV1 = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  const transaction = await sequelize.transaction();

  try {
    const { goodsReturnId, goodsReturnProductId } = req.params;

    const goodsReturnRecord = await GoodsReturn.findByPk(goodsReturnId, {
      transaction,
    });

    if (!goodsReturnRecord) {
      return throwCustomError(404, "Goods return not found");
    }

    const { productId, quantity } = req.body;

    const goodsReturnProductRecord = await GoodsReturnProduct.findByPk(goodsReturnProductId, {
      attributes: {
        exclude: ["goodsReturnId"],
      },
      transaction,
    });

    if (!goodsReturnProductRecord) {
      return throwCustomError(404, "Goods return product not found");
    }

    if (Object.prototype.hasOwnProperty.call(req.body, "productId")) {
      goodsReturnProductRecord.dataValues.productId = productId;
    }

    if (Object.prototype.hasOwnProperty.call(req.body, "quantity")) {
      const productRecord = await Product.findByPk(goodsReturnProductRecord.dataValues.productId, {
        transaction,
      });

      if (!productRecord) {
        return throwCustomError(404, "Product not found");
      }

      const oldQuantity = goodsReturnProductRecord.dataValues.quantity;
      const oldGrossAmount = roundNumber(productRecord.dataValues.rate * oldQuantity);
      const oldDiscountAmount =
        productRecord.dataValues.discountRate > 0
          ? roundNumber((oldGrossAmount * productRecord.dataValues.discountRate) / 100)
          : 0;
      const oldTaxAmount = roundNumber(
        ((oldGrossAmount - oldDiscountAmount) * productRecord.dataValues.gstRate) / 100,
      );
      const oldNetAmount = roundNumber(oldGrossAmount - oldDiscountAmount + oldTaxAmount);

      goodsReturnRecord.dataValues.grossAmount -= oldGrossAmount;
      goodsReturnRecord.dataValues.discountAmount -= oldDiscountAmount;
      goodsReturnRecord.dataValues.taxAmount -= oldTaxAmount;
      goodsReturnRecord.dataValues.netAmount -= oldNetAmount;

      const newQuantity = quantity;
      const newGrossAmount = roundNumber(productRecord.dataValues.rate * newQuantity);
      const newDiscountAmount =
        productRecord.dataValues.discountRate > 0
          ? roundNumber((newGrossAmount * productRecord.dataValues.discountRate) / 100)
          : 0;
      const newTaxAmount = roundNumber(
        ((newGrossAmount - newDiscountAmount) * productRecord.dataValues.gstRate) / 100,
      );
      const newNetAmount = roundNumber(newGrossAmount - newDiscountAmount + newTaxAmount);

      goodsReturnRecord.dataValues.grossAmount += newGrossAmount;
      goodsReturnRecord.dataValues.discountAmount += newDiscountAmount;
      goodsReturnRecord.dataValues.taxAmount += newTaxAmount;
      goodsReturnRecord.dataValues.netAmount += newNetAmount;

      await goodsReturnRecord.save({ transaction });
    }

    await goodsReturnProductRecord.save({ transaction });

    await transaction.commit();

    res.status(200).json({
      message: "Goods return product updated successfully",
      data: goodsReturnProductRecord.dataValues,
    });
  } catch (error) {
    await transaction.rollback();
    next(error);
  }
};

export { updateV1 };
