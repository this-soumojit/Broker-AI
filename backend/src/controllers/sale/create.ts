import { Request, Response, NextFunction } from "express";

import { Sale } from "../../models";
import { roundNumber } from "../../utils";
import { throwCustomError } from "../../utils/error";

const createV1 = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { bookId } = req.params;

    const {
      lorryReceiptNumber,
      lorryReceiptDate,
      caseNumber,
      weight,
      freight,
      transportName,
      transportNumber,
      transportStation,
      eWayBillNumber,
      eWayBillDate,
      challanNumber,
      challanDate,
      invoiceNumber,
      invoiceDate,
      invoiceGrossAmount = 0,
      invoiceDiscountAmount = 0,
      invoiceTaxAmount = 0,
      invoiceNetAmount = 0,
      commissionRate = 0,
      invoiceDueDays = 45,
      status,
      notes,
      sellerId,
      buyerId,
    } = req.body;

    const query: Record<string, string | undefined> = {
      invoiceNumber,
    };

    const saleRecord = await Sale.findOne({
      where: query,
    });

    if (saleRecord) {
      return throwCustomError(400, "Sale with same invoice number already exists");
    }

    const newSaleRecord = await Sale.create({
      lorryReceiptNumber,
      lorryReceiptDate,
      caseNumber,
      weight,
      freight,
      transportName,
      transportNumber,
      transportStation,
      eWayBillNumber,
      eWayBillDate,
      challanNumber,
      challanDate,
      invoiceNumber,
      invoiceDate,
      invoiceGrossAmount: roundNumber(invoiceGrossAmount),
      invoiceDiscountAmount: roundNumber(invoiceDiscountAmount),
      invoiceTaxAmount: roundNumber(invoiceTaxAmount),
      invoiceNetAmount: roundNumber(invoiceNetAmount),
      commissionRate,
      invoiceDueDays,
      status,
      notes,
      sellerId,
      buyerId,
      bookId,
    });

    if (!newSaleRecord) {
      return throwCustomError(500, "Failed to create sale");
    }

    res.status(201).json({
      message: "Sale created successfully",
      data: newSaleRecord.dataValues,
    });
  } catch (error) {
    next(error);
  }
};

export { createV1 };
