import { Request, Response, NextFunction } from "express";

import { Sale } from "../../models";
import { roundNumber } from "../../utils";
import { throwCustomError } from "../../utils/error";

const updateV1 = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { saleId } = req.params;

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
      invoiceGrossAmount,
      invoiceDiscountAmount,
      invoiceTaxAmount,
      invoiceNetAmount,
      commissionRate,
      invoiceDueDays,
      status,
      notes,
      sellerId,
      buyerId,
    } = req.body;

    const saleRecord = await Sale.findByPk(saleId, {
      attributes: {
        exclude: ["bookId"],
      },
    });

    if (!saleRecord) {
      return throwCustomError(404, "Sale not found");
    }

    if (Object.prototype.hasOwnProperty.call(req.body, "lorryReceiptNumber")) {
      saleRecord.set("lorryReceiptNumber", lorryReceiptNumber);
    }

    if (Object.prototype.hasOwnProperty.call(req.body, "lorryReceiptDate")) {
      saleRecord.set("lorryReceiptDate", lorryReceiptDate);
    }

    if (Object.prototype.hasOwnProperty.call(req.body, "caseNumber")) {
      saleRecord.set("caseNumber", caseNumber);
    }

    if (Object.prototype.hasOwnProperty.call(req.body, "weight")) {
      saleRecord.set("weight", weight);
    }

    if (Object.prototype.hasOwnProperty.call(req.body, "freight")) {
      saleRecord.set("freight", freight);
    }

    if (Object.prototype.hasOwnProperty.call(req.body, "transportName")) {
      saleRecord.set("transportName", transportName);
    }

    if (Object.prototype.hasOwnProperty.call(req.body, "transportNumber")) {
      saleRecord.set("transportNumber", transportNumber);
    }

    if (Object.prototype.hasOwnProperty.call(req.body, "transportStation")) {
      saleRecord.set("transportStation", transportStation);
    }

    if (Object.prototype.hasOwnProperty.call(req.body, "eWayBillNumber")) {
      saleRecord.set("eWayBillNumber", eWayBillNumber);
    }

    if (Object.prototype.hasOwnProperty.call(req.body, "eWayBillDate")) {
      saleRecord.set("eWayBillDate", eWayBillDate);
    }

    if (Object.prototype.hasOwnProperty.call(req.body, "challanNumber")) {
      saleRecord.set("challanNumber", challanNumber);
    }

    if (Object.prototype.hasOwnProperty.call(req.body, "challanDate")) {
      saleRecord.set("challanDate", challanDate);
    }

    if (Object.prototype.hasOwnProperty.call(req.body, "invoiceNumber")) {
      if (invoiceNumber !== saleRecord.dataValues.invoiceNumber) {
        const query: Record<string, string | undefined> = {
          invoiceNumber,
        };

        const saleRecordWithSameInvoiceNumber = await Sale.findOne({
          where: query,
        });

        if (saleRecordWithSameInvoiceNumber) {
          return throwCustomError(400, "Sale with same invoice number already exists");
        }
      }

      saleRecord.set("invoiceNumber", invoiceNumber);
    }

    if (Object.prototype.hasOwnProperty.call(req.body, "invoiceDate")) {
      saleRecord.set("invoiceDate", invoiceDate);
    }

    if (Object.prototype.hasOwnProperty.call(req.body, "invoiceGrossAmount")) {
      saleRecord.set("invoiceGrossAmount", roundNumber(invoiceGrossAmount));
    }

    if (Object.prototype.hasOwnProperty.call(req.body, "invoiceDiscountAmount")) {
      saleRecord.set("invoiceDiscountAmount", roundNumber(invoiceDiscountAmount));
    }

    if (Object.prototype.hasOwnProperty.call(req.body, "invoiceTaxAmount")) {
      saleRecord.set("invoiceTaxAmount", roundNumber(invoiceTaxAmount));
    }

    if (Object.prototype.hasOwnProperty.call(req.body, "invoiceNetAmount")) {
      saleRecord.set("invoiceNetAmount", roundNumber(invoiceNetAmount));
    }

    if (Object.prototype.hasOwnProperty.call(req.body, "commissionRate")) {
      saleRecord.set("commissionRate", commissionRate);
    }

    if (Object.prototype.hasOwnProperty.call(req.body, "invoiceDueDays")) {
      saleRecord.set("invoiceDueDays", invoiceDueDays);
    }

    if (Object.prototype.hasOwnProperty.call(req.body, "status")) {
      saleRecord.set("status", status);
    }

    if (Object.prototype.hasOwnProperty.call(req.body, "notes")) {
      saleRecord.set("notes", notes);
    }

    if (Object.prototype.hasOwnProperty.call(req.body, "sellerId")) {
      saleRecord.set("sellerId", sellerId);
    }

    if (Object.prototype.hasOwnProperty.call(req.body, "buyerId")) {
      saleRecord.set("buyerId", buyerId);
    }

    await saleRecord.save();

    res.status(200).json({
      message: "Sale updated successfully",
      data: saleRecord.dataValues,
    });
  } catch (error) {
    next(error);
  }
};

export { updateV1 };
