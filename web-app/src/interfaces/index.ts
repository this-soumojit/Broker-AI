export interface IBook {
  id?: string;
  name: string;
  startDate: string | Date;
  endDate: string | Date;
  openingBalance: number;
  closingBalance: number;
  status: "OPEN" | "CLOSED";
  notes?: string;
}

export interface IClient {
  id?: string;
  name: string;
  email: string;
  phone: string;
  pan: string;
  gstin: string;
  address: string;
}

export interface IPaymentResponse {
  orderId: string;
  paymentSessionId: string;
  orderToken: string;
}

export interface IUserSubscription {
  id: number;
  userId: number;
  planName: string;
  planPrice: number;
  duration: number;
  orderId: string;
  status:
    | "PENDING"
    | "ACTIVE"
    | "EXPIRED"
    | "CANCELLED"
    | "UPGRADED"
    | "DOWNGRADED";
  paymentStatus: "PENDING" | "COMPLETED" | "FAILED" | "REFUNDED";
  startDate: Date | null;
  endDate: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface ICreateSale {
  id?: string;
  lorryReceiptNumber: string;
  lorryReceiptDate: string;
  caseNumber: string;
  weight: number;
  freight: number;
  transportName: string;
  transportNumber: string;
  transportStation: string;
  eWayBillNumber: string;
  eWayBillDate: string | Date;
  challanNumber: string;
  challanDate: string | Date;
  invoiceNumber: string;
  invoiceDate: string | Date;
  invoiceGrossAmount: number;
  invoiceDiscountAmount: number;
  invoiceTaxAmount: number;
  invoiceNetAmount: number;
  commissionRate: number;
  invoiceDueDays: number;
  status: "PENDING" | "PARTIALLY_PAID" | "PAID" | "OVERDUE";
  notes: string;
  sellerId: string;
  buyerId: string;
  products?: Array<{
    name: string;
    quantity: number;
    unit: string;
    rate: number;
    gstRate: number;
    discountRate: number;
    notes?: string;
  }>;
}

export interface ISale {
  id?: string;
  lorryReceiptNumber: string;
  lorryReceiptDate: string;
  caseNumber: string;
  weight: number;
  freight: number;
  transportName: string;
  transportNumber: string;
  transportStation: string;
  eWayBillNumber: string;
  eWayBillDate: string | Date;
  challanNumber: string;
  challanDate: string | Date;
  invoiceNumber: string;
  invoiceDate: string | Date;
  invoiceGrossAmount: number;
  invoiceDiscountAmount: number;
  invoiceTaxAmount: number;
  invoiceNetAmount: number;
  commissionRate: number;
  invoiceDueDays: number;
  status: "PENDING" | "PARTIALLY_PAID" | "PAID" | "OVERDUE";
  notes: string;
  sellerId: string;
  buyerId: string;
  isAccessible?: boolean;
  buyer: {
    id: string;
    name: string;
    phone: string;
    address: string;
    gstin: string;
    pan: string;
    email: string;
  };
  seller: {
    id: string;
    name: string;
    phone: string;
    address: string;
    gstin: string;
    pan: string;
    email: string;
  };
  products?: Array<{
    name: string;
    quantity: number;
    unit: string;
    rate: number;
    gstRate: number;
    discountRate: number;
    notes?: string;
  }>;
}

export interface IProduct {
  id?: string;
  name: string;
  quantity: number;
  unit: string;
  rate: number;
  gstRate: number;
  discountRate: number;
  notes?: string;
}

export interface IGoodsReturn {
  id?: string;
  grossAmount: number;
  discountAmount: number;
  taxAmount: number;
  netAmount: number;
  notes: string;
  saleId: string;
  products?: IGoodsReturnProduct[];
}

export interface IGoodsReturnProduct {
  id?: string;
  quantity: number;
  productName?: string;
  goodsReturnId?: string;
  productId?: string;
  product?: IProduct;
}

export interface ISaleProduct {
  id?: string;
  name: string;
  quantity: number;
  unit: string;
  rate: number;
  gstRate: number;
  discountRate: number;
  notes?: string;
  saleId?: string;
}

export interface ISalePayment {
  id?: string;
  amount: number;
  paymentMethod: "CASH" | "BANK_TRANSFER" | "CHEQUE" | "ONLINE_PAYMENT";
  referenceNumber: string;
  notes?: string;
  createdAt?: string | Date;
}

export interface ISaleCommission {
  id?: string;
  amount: number;
  paymentMethod: "CASH" | "BANK_TRANSFER" | "CHEQUE" | "ONLINE_PAYMENT";
  referenceNumber: string;
  notes?: string;
  createdAt: string | Date;
}

export interface SendInvoiceEmailRequest {
  recipientEmail: string;
  recipientName?: string;
  invoiceNumber?: string;
  senderName?: string;
  customMessage?: string;
}

export interface SendInvoiceEmailMultipleRequest {
  recipientEmails: string; // comma-separated emails
  invoiceNumber?: string;
  senderName?: string;
  customMessage?: string;
}

export interface SendInvoiceEmailResponse {
  success: boolean;
  message: string;
  data: {
    recipientEmail?: string;
    recipientCount?: number;
    recipients?: string[];
    invoiceNumber: string;
    sentAt: string;
  };
}

export interface IAccessibleClientsResponse {
  clients: Array<
    IClient & {
      isAccessible: boolean;
    }
  >;
  planDetails: {
    plan: string;
    clientLimit: number;
    isUnlimited: boolean;
  };
}

export interface ExtractedInvoiceData {
  invoiceNumber?: string;
  invoiceDate?: string;
  invoiceGrossAmount?: number;
  invoiceDiscountAmount?: number;
  invoiceTaxAmount?: number;
  invoiceNetAmount?: number;
  transportDetails?: {
    transportName?: string;
    transportNumber?: string;
    transportStation?: string;
    lorryReceiptNumber?: string;
    lorryReceiptDate?: string;
  };
  eWayBillNumber?: string;
  eWayBillDate?: string;
  challanNumber?: string;
  challanDate?: string;
  weight?: number;
  freight?: number;
  caseNumber?: string;
  products?: Array<{
    name: string;
    quantity: number;
    unit: string;
    rate: number;
    gstRate: number;
    discountRate: number;
  }>;
}
