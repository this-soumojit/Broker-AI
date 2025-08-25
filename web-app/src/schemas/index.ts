import { z } from "zod";

export const bookFormSchema = z.object({
  name: z.string().min(1, "Name is required"),
  startDate: z.union([z.string().min(1, "Start date is required"), z.date()]),
  endDate: z.union([z.string().min(1, "End date is required"), z.date()]),
  openingBalance: z.coerce
    .number()
    .min(0, "Opening balance must be a positive number"),
  closingBalance: z.coerce
    .number()
    .min(0, "Closing balance must be a positive number"),
  notes: z.string().optional(),
});

export const clientFormSchema = z.object({
  name: z.string().min(1, "Name is required"),
  email: z.string().email("Invalid email address"),
  phoneCode: z.string(),
  phone: z.string().min(10, "Phone number must be at least 10 digits").regex(/^\d+$/, { message: "Phone number must contain only digits" }),
  pan: z.string().min(1, "PAN is required"),
  gstin: z.string().min(1, "GSTIN is required"),
  address: z.string().min(1, "Address is required"),
});

export const saleFormSchema = z.object({
  id: z.string().optional(),
  lorryReceiptNumber: z.string().min(1, "Lorry receipt number is required"),
  lorryReceiptDate: z.union([
    z.string().min(1, "Lorry receipt date is required"),
    z.date(),
  ]),
  caseNumber: z.string().min(10, "Case number must be at least 10 characters"),
  weight: z.coerce.number().min(0, "Weight must be a positive number"),
  freight: z.coerce.number().min(0, "Freight must be a positive number"),
  transportName: z.string().min(1, "Transport name is required"),
  transportNumber: z.string().min(10, "Transport number must be at least 10 characters"),
  transportStation: z.string().min(1, "Transport station is required"),
  eWayBillNumber: z.string().min(10, "E-Way Bill number must be at least 10 characters"),
  eWayBillDate: z.union([
    z.string().min(1, "E-Way Bill date is required"),
    z.date(),
  ]),
  challanNumber: z.string().min(10, "Challan number must be at least 10 characters"),
  challanDate: z.union([
    z.string().min(1, "Challan date is required"),
    z.date(),
  ]),
  invoiceNumber: z.string().min(10, "Invoice number must be at least 10 characters"),
  invoiceDate: z.union([
    z.string().min(1, "Invoice date is required"),
    z.date(),
  ]),
  invoiceGrossAmount: z.coerce
    .number()
    .min(0, "Invoice gross amount must be a positive number"),
  invoiceDiscountAmount: z.coerce
    .number()
    .min(0, "Invoice discount amount must be a positive number"),
  invoiceTaxAmount: z.coerce
    .number()
    .min(0, "Invoice tax amount must be a positive number"),
  invoiceNetAmount: z.coerce
    .number()
    .min(0, "Invoice net amount must be a positive number"),
  commissionRate: z.coerce
    .number()
    .min(0, "Commission rate must be a positive number"),
  invoiceDueDays: z.coerce
    .number()
    .min(0, "Invoice due days must be a positive number"),
  status: z.enum(["PENDING", "PARTIALLY_PAID", "PAID", "OVERDUE"]),
  notes: z.string().optional(),
  sellerId: z.string().min(1, "Seller is required"),
  buyerId: z.string().min(1, "Buyer is required"),
  products: z
    .array(
      z.object({
        name: z.string().min(1, "Product name is required"),
        quantity: z.coerce
          .number()
          .min(0.01, "Quantity must be greater than 0"),
        unit: z.string().min(1, "Unit is required"),
        rate: z.coerce.number().min(0, "Rate must be a positive number"),
        gstRate: z.coerce.number().min(0, "GST rate must be a positive number"),
        discountRate: z.coerce
          .number()
          .min(0, "Discount rate must be a positive number"),
        notes: z.string().optional(),
      })
    )
    .optional()
    .default([]),
}).refine((data) => data.sellerId !== data.buyerId, {
  message: "Seller and buyer must be different",
  path: ["buyerId"],
});

export const salePaymentFormSchema = z.object({
  amount: z.coerce.number().min(0.01, "Amount must be greater than 0"),
  paymentMethod: z.enum(["CASH", "BANK_TRANSFER", "CHEQUE", "ONLINE_PAYMENT"], {
    required_error: "Please select a payment method",
  }),
  referenceNumber: z.string().min(1, "Reference number is required"),
  notes: z.string().optional(),
});

export const saleCommissionFormSchema = z.object({
  amount: z.coerce.number().min(0.01, "Amount must be greater than 0"),
  paymentMethod: z.enum(["CASH", "BANK_TRANSFER", "CHEQUE", "ONLINE_PAYMENT"], {
    required_error: "Please select a payment method",
  }),
  referenceNumber: z.string().min(1, "Reference number is required"),
  notes: z.string().optional(),
});