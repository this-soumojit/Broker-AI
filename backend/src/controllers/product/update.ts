import { Request, Response, NextFunction } from "express";

import { sequelize } from "../../config/db";
import { Product, Sale } from "../../models";
import { roundNumber } from "../../utils";
import { throwCustomError } from "../../utils/error";

const updateV1 = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  const transaction = await sequelize.transaction();

  try {
    const { saleId, productId } = req.params;

    const { name, quantity, unit, rate, gstRate, discountRate, notes } = req.body;

    let oldGrossAmount = 0;
    let oldDiscountAmount = 0;
    let oldTaxAmount = 0;
    let oldNetAmount = 0;

    const saleRecord = await Sale.findByPk(saleId, { transaction });

    if (!saleRecord) {
      return throwCustomError(404, "Sale not found");
    }

    const productRecord = await Product.findByPk(productId, {
      attributes: {
        exclude: ["saleId"],
      },
      transaction,
    });

    if (!productRecord) {
      return throwCustomError(404, "Product not found");
    }

    oldGrossAmount = productRecord.dataValues.grossAmount;
    oldDiscountAmount = productRecord.dataValues.discountAmount;
    oldTaxAmount = productRecord.dataValues.taxAmount;
    oldNetAmount = productRecord.dataValues.netAmount;

    if (Object.prototype.hasOwnProperty.call(req.body, "name")) {
      productRecord.set("name", name);
    }

    if (
      Object.prototype.hasOwnProperty.call(req.body, "quantity") &&
      quantity !== productRecord.dataValues.quantity
    ) {
      productRecord.set("quantity", quantity);

      const grossAmount = roundNumber((productRecord.get("rate") as number) * quantity);

      const discountAmount =
        (productRecord.get("discountRate") as number) > 0
          ? roundNumber((grossAmount * (productRecord.get("discountRate") as number)) / 100)
          : 0;

      const taxAmount = roundNumber(
        ((grossAmount - discountAmount) * (productRecord.get("gstRate") as number)) / 100,
      );

      const netAmount = roundNumber(grossAmount - discountAmount + taxAmount);

      productRecord.set("grossAmount", grossAmount);
      productRecord.set("discountAmount", discountAmount);
      productRecord.set("taxAmount", taxAmount);
      productRecord.set("netAmount", netAmount);
    }

    if (Object.prototype.hasOwnProperty.call(req.body, "unit")) {
      productRecord.set("unit", unit);
    }

    if (
      Object.prototype.hasOwnProperty.call(req.body, "rate") &&
      rate !== productRecord.dataValues.rate
    ) {
      productRecord.set("rate", rate);

      const grossAmount = roundNumber(
        rate * (productRecord.get("quantity") as number),
      );

      const discountAmount =
        (productRecord.get("discountRate") as number) > 0
          ? roundNumber((grossAmount * (productRecord.get("discountRate") as number)) / 100)
          : 0;

      const taxAmount = roundNumber(
        ((grossAmount - discountAmount) * (productRecord.get("gstRate") as number)) / 100,
      );

      const netAmount = roundNumber(grossAmount - discountAmount + taxAmount);

      productRecord.set("grossAmount", grossAmount);
      productRecord.set("discountAmount", discountAmount);
      productRecord.set("taxAmount", taxAmount);
      productRecord.set("netAmount", netAmount);
    }

    if (
      Object.prototype.hasOwnProperty.call(req.body, "gstRate") &&
      gstRate !== productRecord.dataValues.gstRate
    ) {
      productRecord.set("gstRate", gstRate);

      const grossAmount = roundNumber(
        (productRecord.get("rate") as number) * (productRecord.get("quantity") as number),
      );

      const discountAmount =
        (productRecord.get("discountRate") as number) > 0
          ? roundNumber((grossAmount * (productRecord.get("discountRate") as number)) / 100)
          : 0;

      const taxAmount = roundNumber(
        ((grossAmount - discountAmount) * gstRate) / 100,
      );

      const netAmount = roundNumber(grossAmount - discountAmount + taxAmount);

      productRecord.set("grossAmount", grossAmount);
      productRecord.set("discountAmount", discountAmount);
      productRecord.set("taxAmount", taxAmount);
      productRecord.set("netAmount", netAmount);
    }

    if (
      Object.prototype.hasOwnProperty.call(req.body, "discountRate") &&
      discountRate !== productRecord.dataValues.discountRate
    ) {
      productRecord.set("discountRate", discountRate);

      const grossAmount = roundNumber(
        (productRecord.get("rate") as number) * (productRecord.get("quantity") as number),
      );

      const discountAmount =
        discountRate > 0
          ? roundNumber((grossAmount * discountRate) / 100)
          : 0;

      const taxAmount = roundNumber(
        ((grossAmount - discountAmount) * (productRecord.get("gstRate") as number)) / 100,
      );

      const netAmount = roundNumber(grossAmount - discountAmount + taxAmount);

      productRecord.set("grossAmount", grossAmount);
      productRecord.set("discountAmount", discountAmount);
      productRecord.set("taxAmount", taxAmount);
      productRecord.set("netAmount", netAmount);
    }

    if (Object.prototype.hasOwnProperty.call(req.body, "notes")) {
      productRecord.set("notes", notes);
    }

    await productRecord.save({ transaction });

    const newNetAmount = productRecord.get("netAmount") as number;
    const newGrossAmount = productRecord.get("grossAmount") as number;
    const newDiscountAmount = productRecord.get("discountAmount") as number;
    const newTaxAmount = productRecord.get("taxAmount") as number;

    saleRecord.set("invoiceNetAmount", (saleRecord.get("invoiceNetAmount") as number) + newNetAmount - oldNetAmount);
    saleRecord.set("invoiceGrossAmount", (saleRecord.get("invoiceGrossAmount") as number) + newGrossAmount - oldGrossAmount);
    saleRecord.set("invoiceDiscountAmount", (saleRecord.get("invoiceDiscountAmount") as number) + newDiscountAmount - oldDiscountAmount);
    saleRecord.set("invoiceTaxAmount", (saleRecord.get("invoiceTaxAmount") as number) + newTaxAmount - oldTaxAmount);

    await saleRecord.save({ transaction });

    await transaction.commit();

    res.status(200).json({
      message: "Product updated successfully",
      data: productRecord.toJSON(),
    });
  } catch (error) {
    await transaction.rollback();
    next(error);
  }
};

export { updateV1 };
