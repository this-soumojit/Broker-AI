import { Request, Response, NextFunction } from "express";

import { sequelize } from "../../config/db";
import { Product, Sale } from "../../models";
import { roundNumber } from "../../utils";
import { throwCustomError } from "../../utils/error";

const createV1 = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  const transaction = await sequelize.transaction();
  try {
    const { saleId } = req.params;

    const { name, quantity, unit, rate, gstRate, discountRate, notes } = req.body;

    const saleRecord = await Sale.findByPk(saleId, { transaction });

    if (!saleRecord) {
      return throwCustomError(404, "Sale not found");
    }

    const grossAmount = roundNumber(rate * quantity);
    const discountAmount = discountRate > 0 ? roundNumber((grossAmount * discountRate) / 100) : 0;
    const taxAmount = roundNumber(((grossAmount - discountAmount) * gstRate) / 100);
    const netAmount = roundNumber(grossAmount - discountAmount + taxAmount);

    const newProductRecord = await Product.create(
      {
        name,
        quantity,
        unit,
        rate,
        gstRate,
        discountRate,
        grossAmount,
        discountAmount,
        taxAmount,
        netAmount,
        notes,
        saleId,
      },
      { transaction },
    );

    if (!newProductRecord) {
      return throwCustomError(500, "Failed to create product");
    }

    saleRecord.dataValues.invoiceNetAmount += netAmount;
    saleRecord.dataValues.invoiceGrossAmount += grossAmount;
    saleRecord.dataValues.invoiceDiscountAmount += discountAmount;
    saleRecord.dataValues.invoiceTaxAmount += taxAmount;

    await saleRecord.save({ transaction });

    await transaction.commit();

    res.status(201).json({
      message: "Product created successfully",
      data: newProductRecord.dataValues,
    });
  } catch (error) {
    await transaction.rollback();
    next(error);
  }
};

export { createV1 };
