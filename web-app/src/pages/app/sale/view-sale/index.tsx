import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { format } from "date-fns";
import { ArrowLeft, FileCheck, Plus } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Form,
} from "@/components/ui/form";
import { useToast } from "@/hooks/use-toast";
import PageLoader from "@/components/page-loader";
import { saleFormSchema } from "@/schemas";
import { getSaleById } from "@/services/sale";
import { getClients } from "@/services/client";
import { IClient } from "@/interfaces";

import {
  getProducts,
} from "@/services/product";
import { getGoodsReturnProducts } from "@/services/goods-return-product";
import { getGoodsReturns } from "@/services/goods-return";
import { getSalePayments } from "@/services/sale-payment";
import { getSaleCommissions } from "@/services/sale-commission";
import ProductTable, { NoProductDataTable } from "@/components/product-table";
import PaymentTable, { NoPaymentDataTable } from "@/components/payment-table";
import InvoiceWithProductSummary from "@/components/invoice-summary";
import GoodReturnTable from "@/components/good-return-table";

export type Product = {
  id?: string;
  name: string;
  quantity: number;
  unit: string;
  rate: number;
  gstRate: number;
  discountRate: number;
  notes?: string;
};

// For goodReturnProducts, the structure includes a nested Product object
export type GoodReturnProduct = {
  id?: string;
  quantity: number;
  Product: Product;
};

export type SaleFormValues = {
  lorryReceiptNumber: string;
  lorryReceiptDate: Date | string;
  caseNumber: string;
  weight: number;
  freight: number;
  transportName: string;
  transportNumber: string;
  transportStation: string;
  eWayBillNumber: string;
  eWayBillDate: Date | string;
  challanNumber: string;
  challanDate: Date | string;
  invoiceNumber: string;
  invoiceDate: Date | string;
  invoiceGrossAmount: number;
  invoiceDiscountAmount: number;
  invoiceTaxAmount: number;
  invoiceNetAmount: number;
  commissionRate: number;
  invoiceDueDays: number;
  status: "PENDING" | "PARTIALLY_PAID" | "PAID" | "OVERDUE";
  sellerId: string;
  buyerId: string;
  notes?: string;
  products: Product[];
};

export type TSalePayments = {
  Sale: {
    invoiceNumber: string;
  };
  paymentMethod: string;
  referenceNumber: string;
  amount: number;
  createdAt: string;
  id?: string;
}

export type TSaleCommission = {
  invoiceNumber: string;
  paymentMethod: string;
  referenceNumber: string;
  amount: number;
  createdAt: string;
  id?: string;
};

export type TGoodReturn = {
  id?: string;
  notes: string;
}

const defaultValues: SaleFormValues = {
  lorryReceiptNumber: "",
  lorryReceiptDate: new Date(),
  caseNumber: "",
  weight: 0,
  freight: 0,
  transportName: "",
  transportNumber: "",
  transportStation: "",
  eWayBillNumber: "",
  eWayBillDate: new Date(),
  challanNumber: "",
  challanDate: new Date(),
  invoiceNumber: "",
  invoiceDate: new Date(),
  invoiceGrossAmount: 0,
  invoiceDiscountAmount: 0,
  invoiceTaxAmount: 0,
  invoiceNetAmount: 0,
  commissionRate: 0,
  invoiceDueDays: 0,
  status: "PENDING",
  sellerId: "",
  buyerId: "",
  notes: "",
  products: [],
};

export default function ViewSalePage() {
  const [isLoading, setIsLoading] = useState(false);
  const [clients, setClients] = useState<IClient[]>([]);
  const [allProducts, setAllProducts] = useState<Product[]>([]);
  const [goodReturnId, setGoodReturnId] = useState<TGoodReturn[]>([]);
  const [goodReturnProducts, setGoodReturnProducts] = useState<GoodReturnProduct[][]>([]);
  const [salePayments, setSalePayments] = useState<TSalePayments[]>([]);
  const [saleCommission, setSaleCommission] = useState<TSaleCommission[]>([]);
  const [salesData, setSalesData] = useState<SaleFormValues>(defaultValues);

  const { showError } = useToast();
  const { userId, bookId, saleId } = useParams();
  const navigate = useNavigate();

  const form = useForm<SaleFormValues>({
    resolver: zodResolver(saleFormSchema),
    defaultValues,
  });

  const loadClients = async () => {
    if (!userId) return;

    try {
      const { data } = await getClients(userId, "");
      setClients(data);
    } catch (error) {
      showError(error);
    }
  };

  const loadSale = async () => {
    if (!userId || !bookId || !saleId) return;

    setIsLoading(true);

    try {
      const { data } = await getSaleById(userId, bookId, saleId);
      setSalesData(data);

      // console.log(salesData);

      // Convert date strings to Date objects for the form
      const formData = {
        ...data,
        products: data.products || [],
        lorryReceiptDate: data.lorryReceiptDate
          ? new Date(data.lorryReceiptDate)
          : new Date(),
        eWayBillDate: data.eWayBillDate
          ? new Date(data.eWayBillDate)
          : new Date(),
        challanDate: data.challanDate ? new Date(data.challanDate) : new Date(),
        invoiceDate: data.invoiceDate ? new Date(data.invoiceDate) : new Date(),
      };

      form.reset(formData);
    } catch (error) {
      showError(error);
    } finally {
      setIsLoading(false);
    }
  };

  // Load good return data
  const loadGoodReturn = async () => {
    if (!userId || !bookId || !saleId) return;

    setIsLoading(true);
    try {
      const { data } = await getGoodsReturns(userId, bookId, saleId);
      if (data.length === 0) {
        setGoodReturnId([]);
        return;
      }
      console.log("Good Return data: ", data);
      setGoodReturnId(data);
    } catch (error) {
      showError(error);
    } finally {
      setIsLoading(false);
    } 
  };

  // Load good return products
  const loadGoodReturnProducts = async () => {
    if (!userId || !bookId || !saleId) return;

    setIsLoading(true);
    try {
      if (!goodReturnId || goodReturnId.length === 0) {
        setGoodReturnProducts([]);
        // console.log("Good Return Products: No good returns found, setting empty array");
        return;
      }
      // Fetch products for each goodReturnId using Promise.all and map
      const productPromises = goodReturnId.map((goodReturn) =>
        getGoodsReturnProducts(userId, bookId, saleId, goodReturn.id ?? "")
      );
      const responses = await Promise.all(productPromises);
      // Keep as array of arrays (2D array)
      const allProducts = responses.map((res) => res.data || []);
      setGoodReturnProducts(allProducts);
      // console.log("Good Return Products:", allProducts);
    } catch (error) {
      showError(error);
    } finally {
      setIsLoading(false);
    }
  };

  const loadProducts = async () => {
    if (!userId || !bookId || !saleId) return;

    setIsLoading(true);

    try {
      const productData = await getProducts(userId, bookId, saleId);
      setAllProducts(productData.data);
    } catch (error) {
      showError(error);
    } finally {
      setIsLoading(false);
    }
  };
  
  const loadSalePayment = async () => {
    if (!userId || !bookId || !saleId) return;

    setIsLoading(true);

    try {
      console.log('Fetching sale payments with params:', { userId, bookId, saleId });
      const response = await getSalePayments(userId, bookId, saleId);
      // console.log('Full response:', response);
      // console.log('Response data:', response.data);
      
      if (response && response.data) {
        setSalePayments(response.data);
      } else {
        // console.log('No data in response, setting empty array');
        setSalePayments([]);
      }
    }
    catch (error) {
      // console.error('Error loading sale payments:', error);
      showError(error);
    } finally {
      setIsLoading(false);
    }
  }


  // console.log("Sale Payments:", salePayments);

const loadSaleCommission = async () => {
  if (!userId || !bookId || !saleId || salePayments.length === 0) return;

  setIsLoading(true);

  try {
    // Clear previous commission data
    setSaleCommission([]);
    
    // Fetch all commissions in parallel using Promise.all
    const commissionPromises = salePayments.map(payment => 
      getSaleCommissions(userId, bookId, saleId, payment?.id ?? "")
    );
    
    const commissionResponses = await Promise.all(commissionPromises);
    
    // Extract data from all responses and flatten the array
    // Attach invoiceNumber from salePayments to each commission
    const allCommissionData = commissionResponses
      .map((response, idx) => {
        const invoiceNumber = salePayments[idx].Sale.invoiceNumber;
        // Attach invoiceNumber to each commission object
        return (response.data || []).map((commission: any) => ({
          ...commission,
          invoiceNumber,
        }));
      })
      .flat();
    
    setSaleCommission(allCommissionData);
    // console.log("All sale commissions: ", allCommissionData);
    
  } catch (error) {
    // console.error('Error loading sale commissions:', error);
    showError(error);
  } finally {
    setIsLoading(false);
  }
};

  useEffect(() => {
    loadClients();
    loadProducts();
    loadSalePayment();
    
    if (userId && bookId && saleId) {
      loadGoodReturn();
      loadSale();
    }

    
  }, [userId, bookId, saleId]);

  // Separate useEffect for loading good return products when goodReturnId changes
  useEffect(() => {
    if (userId && bookId && saleId && goodReturnId.length >= 0) {
      loadGoodReturnProducts();
    }
  }, [goodReturnId, userId, bookId, saleId]);

  // Separate useEffect for loading commissions after payments are loaded
  useEffect(() => {
    if (salePayments.length > 0) {
      loadSaleCommission();
    }
  }, [salePayments]); // This will run when salePayments state changes

  // Add automatic calculations for invoice amounts based on products
  useEffect(() => {
    const products = form.watch("products") || [];

    if (products.length > 0) {
      // Calculate total gross amount (before discount and tax)
      const grossAmount = products.reduce((sum, product) => {
        return sum + product.quantity * product.rate;
      }, 0);

      // Calculate total discount amount
      const discountAmount = products.reduce((sum, product) => {
        const amount = product.quantity * product.rate;
        return sum + (amount * product.discountRate) / 100;
      }, 0);

      // Calculate total tax amount
      const taxAmount = products.reduce((sum, product) => {
        const amount = product.quantity * product.rate;
        const discountAmount = amount * (product.discountRate / 100);
        const afterDiscount = amount - discountAmount;
        return sum + (afterDiscount * product.gstRate) / 100;
      }, 0);

      // Calculate net amount (after discount and tax)
      const netAmount = grossAmount - discountAmount + taxAmount;

      // Update form values
      form.setValue("invoiceGrossAmount", parseFloat(grossAmount.toFixed(2)));
      form.setValue(
        "invoiceDiscountAmount",
        parseFloat(discountAmount.toFixed(2))
      );
      form.setValue("invoiceTaxAmount", parseFloat(taxAmount.toFixed(2)));
      form.setValue("invoiceNetAmount", parseFloat(netAmount.toFixed(2)));
    }
  }, [form.watch("products")]);

  const goGoodsReturn = () => {
    navigate(`/${userId}/books/${bookId}/sales/${saleId}/goods-return`);
  };

  const goBack = () => {
    navigate(`/${userId}/books/${bookId}/sales`);
  };

  const goToPayments = () => {
    navigate(`/${userId}/books/${bookId}/sales/${saleId}/payments`);
  };

  const goToInvoice = () => {
    navigate(`/${userId}/books/${bookId}/sales/${saleId}/invoice`);
  };

  const goToClients = (clientId: string) => {
    navigate(`/${userId}/clients/${clientId}`);
  }

  return (
    <div className="container mx-auto py-6 space-y-6">
      <PageLoader isLoading={isLoading} />
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={goBack}
            className="h-8 w-8 cursor-pointer"
            title="Back"
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">View Sale</h1>
            <p className="text-muted-foreground">View the details of your sale</p>
          </div>
        </div>

      
        <Button
          type="button"
          onClick={goToInvoice}
          className="flex items-center gap-1 cursor-pointer">
          <FileCheck className="h-4 w-4" /> Sale Invoice
        </Button>
      </div>

      <div className="grid grid-cols-1 items-start lg:grid-cols-3 gap-6">
        <Card className="col-span-1 lg:col-span-2 shadow-sm">
          <CardHeader>
            <CardTitle>Sale Information</CardTitle>
            <CardDescription>View the details for your sale</CardDescription>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form
                className="space-y-6"
              >
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <p className="leading-none font-semibold mb-1 text-muted-foreground">Seller</p>
                    <p>
                      <span className="cursor-pointer hover:underline" onClick={() => goToClients(form.watch("sellerId"))}>{clients.find((client) => client.id === form.watch("sellerId"))?.name || <span className="text-muted-foreground">N/A</span>}</span>
                      <br />
                      <span className="text-muted-foreground font-medium text-sm block">
                        {(() => {
                          const seller = clients.find((client) => client.id === form.watch("sellerId"));
                          if (!seller) return null;
                          return (
                            <>
                              {seller.phone && (
                                <span>
                                  Phone: {seller.phone}
                                  <br />
                                </span>
                              )}
                              {seller.pan && (
                                <span>
                                  PAN: {seller.pan}
                                  <br />
                                </span>
                              )}
                              {seller.gstin && (
                                <span>
                                  GSTIN: {seller.gstin}
                                  <br />
                                </span>
                              )}
                              {seller.address && (
                                <span>
                                  Address: {seller.address}
                                </span>
                              )}
                            </>
                          );
                        })()}
                      </span>
                    </p>
                    <div>

                    </div>
                  </div>
                  <div>
                    <p className="leading-none font-semibold mb-1 text-muted-foreground">Buyer</p>
                    <p>
                      <span className="cursor-pointer hover:underline" onClick={() => goToClients(form.watch("buyerId"))}>{clients.find((client) => client.id === form.watch("buyerId"))?.name || <span className="text-muted-foreground">N/A</span>}</span>
                      <br />
                      <span className="text-muted-foreground font-medium text-sm block">
                        {(() => {
                          const buyer = clients.find((client) => client.id === form.watch("buyerId"));
                          if (!buyer) return null;
                          return (
                            <>
                              {buyer.phone && (
                                <span>
                                  Phone: {buyer.phone}
                                  <br />
                                </span>
                              )}
                              {buyer.pan && (
                                <span>
                                  PAN: {buyer.pan}
                                  <br />
                                </span>
                              )}
                              {buyer.gstin && (
                                <span>
                                  GSTIN: {buyer.gstin}
                                  <br />
                                </span>
                              )}
                              {buyer.address && (
                                <span>
                                  Address: {buyer.address}
                                </span>
                              )}
                            </>
                          );
                        })()}
                      </span>
                    </p>
                  </div>
                </div>

                <div>
                  <p className="leading-none font-semibold mb-1 text-muted-foreground">Lorry Receipt Number</p>
                  <p>
                  {salesData.lorryReceiptNumber || <span className="text-muted-foreground">N/A</span>}
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                  <p className="leading-none font-semibold mb-1 text-muted-foreground">Lorry Receipt Date</p>
                  <p>
                  {salesData.lorryReceiptDate
                  ? format(new Date(salesData.lorryReceiptDate), "dd/MM/yyyy")
                  : <span className="text-muted-foreground">N/A</span>}
                  </p>
                  </div>
                  <div>
                  <p className="leading-none font-semibold mb-1 text-muted-foreground">Case Number</p>
                  <p>
                  {salesData.caseNumber || <span className="text-muted-foreground">N/A</span>}
                  </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                  <p className="leading-none font-semibold mb-1 text-muted-foreground">Weight (kg)</p>
                  <p>
                    {salesData.weight || <span className="text-muted-foreground">N/A</span>}
                  </p>
                  </div>
                  <div>
                  <p className="leading-none font-semibold mb-1 text-muted-foreground">Freight (₹)</p>
                  <p>
                    {salesData.freight || <span className="text-muted-foreground">N/A</span>}
                  </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div>
                  <p className="leading-none font-semibold mb-1 text-muted-foreground">Transport Name</p>
                  <p>
                  {salesData.transportName || <span className="text-muted-foreground">N/A</span>}
                  </p>
                  </div>
                  <div>
                  <p className="leading-none font-semibold mb-1 text-muted-foreground">Transport Number</p>
                  <p>
                  {salesData.transportNumber || <span className="text-muted-foreground">N/A</span>}
                  </p>
                  </div>
                  <div>
                  <p className="leading-none font-semibold mb-1 text-muted-foreground">Transport Station</p>
                  <p>
                  {salesData.transportStation || <span className="text-muted-foreground">N/A</span>}
                  </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                  <p className="leading-none font-semibold mb-1 text-muted-foreground">E-Way Bill Number</p>
                  <p>
                    {salesData.eWayBillNumber || <span className="text-muted-foreground">N/A</span>}
                  </p>
                  </div>
                  <div>
                  <p className="leading-none font-semibold mb-1 text-muted-foreground">E-Way Bill Date</p>
                  <p>
                    {salesData.eWayBillDate
                    ? format(new Date(salesData.eWayBillDate), "dd/MM/yyyy")
                    : <span className="text-muted-foreground">N/A</span>}
                  </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                  <p className="leading-none font-semibold mb-1 text-muted-foreground">Challan Number</p>
                  <p>
                  {salesData.challanNumber || <span className="text-muted-foreground">N/A</span>}
                  </p>
                  </div>
                  <div>
                  <p className="leading-none font-semibold mb-1 text-muted-foreground">Challan Date</p>
                  <p>
                  {salesData.challanDate
                  ? format(new Date(salesData.challanDate), "dd/MM/yyyy")
                  : <span className="text-muted-foreground">N/A</span>}
                  </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                  <p className="leading-none font-semibold mb-1 text-muted-foreground">Invoice Number</p>
                  <p>
                    {salesData.invoiceNumber || <span className="text-muted-foreground">N/A</span>}
                  </p>
                  </div>
                  <div>
                  <p className="leading-none font-semibold mb-1 text-muted-foreground">Invoice Date</p>
                  <p>
                    {salesData.invoiceDate
                    ? format(new Date(salesData.invoiceDate), "dd/MM/yyyy")
                    : <span className="text-muted-foreground">N/A</span>}
                  </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                  <p className="leading-none font-semibold mb-1 text-muted-foreground">Invoice Gross Amount (₹)</p>
                  <p>
                  {salesData.invoiceGrossAmount?.toFixed(2) || <span className="text-muted-foreground">N/A</span>}
                  </p>
                  </div>
                  <div>
                  <p className="leading-none font-semibold mb-1 text-muted-foreground">Invoice Discount Amount (₹)</p>
                  <p>
                  {salesData.invoiceDiscountAmount?.toFixed(2) || <span className="text-muted-foreground">N/A</span>}
                  </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                  <p className="leading-none font-semibold mb-1 text-muted-foreground">Invoice Tax Amount (₹)</p>
                  <p>
                  {salesData.invoiceTaxAmount?.toFixed(2) || <span className="text-muted-foreground">N/A</span>}
                  </p>
                  </div>
                  <div>
                  <p className="leading-none font-semibold mb-1 text-muted-foreground">Invoice Net Amount (₹)</p>
                  <p>
                  {salesData.invoiceNetAmount?.toFixed(2) || <span className="text-muted-foreground">N/A</span>}
                  </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                  <p className="leading-none font-semibold mb-1 text-muted-foreground">Commission Rate (%)</p>
                  <p>
                  {salesData.commissionRate || <span className="text-muted-foreground">N/A</span>}
                  </p>
                  </div>
                  <div>
                  <p className="leading-none font-semibold mb-1 text-muted-foreground">Invoice Due Days</p>
                  <p>
                  {salesData.invoiceDueDays || <span className="text-muted-foreground">N/A</span>}
                  </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                  <p className="leading-none font-semibold mb-1 text-muted-foreground">Status</p>
                  <p>
                    {salesData.status === "PENDING" && (
                    <span className="text-yellow-500">Pending</span>
                    )}
                    {salesData.status === "PARTIALLY_PAID" && (
                    <span className="text-blue-500">Partially Paid</span>
                    )}
                    {salesData.status === "PAID" && (
                    <span className="text-green-500">Paid</span>
                    )}
                    {salesData.status === "OVERDUE" && (
                    <span className="text-red-500">Overdue</span>
                    )}
                  </p>
                  </div>
                  <div>
                  <p className="leading-none font-semibold mb-1 text-muted-foreground">Notes</p>
                  <p>
                    {salesData.notes || <span className="text-muted-foreground">N/A</span>}
                  </p>
                  </div>
                </div>

                {/* Products Section */}
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <h3 className="text-lg font-medium">Products</h3>
                  </div>

                {/* Product List Table */}
                
                {
                  allProducts.length > 0 ? 
                  ( <ProductTable allProducts={allProducts} /> ) 
                    : 
                  ( <NoProductDataTable message="No products available" /> )
                }
                </div>

                {/* Button to add Good Returns */}
                  <div className="flex justify-between">
                    
                  <div>
                    <h3 className="text-lg font-medium">Good Returns</h3>
                  </div>

                  <div>
                    <Button
                      type="button"
                      onClick={goGoodsReturn}
                      className="flex items-center gap-1 text-[12px] !py-[6px] cursor-pointer">
                      <Plus className="h-2 w-2" /> Add Good Returns
                    </Button>
                  </div>
                  </div>

              {/* Good Returns and Good Return Products Section */}
              <GoodReturnTable goodReturnId={goodReturnId} goodReturnProducts={goodReturnProducts} />

                {/* Button to add Good Returns */}

                {/* Good Returns Section */}
                  {
                    allProducts.some(product => product.quantity !== 0) && (
                      <>
                        <div className="flex justify-between">
                          <div>
                            <h3 className="text-lg font-medium">Sale Payment</h3>
                          </div>
                          <div>
                            <Button
                              type="button"
                              onClick={goToPayments}
                              className="flex items-center gap-1 text-[12px] !py-[6px] cursor-pointer">
                              <Plus className="h-2 w-2" /> Add Sale Payment
                            </Button>
                          </div>
                        </div>

                        <div className="space-y-4">
                          {/* Sale Payment List Table */}
                          {salePayments.length > 0 ? (
                            <PaymentTable salePayments={salePayments} />
                          ) : (
                            <NoPaymentDataTable message={"No Sale Payment Available"} />
                          )}
                        </div>

                        <div className="flex justify-between">
                          <div>
                            <h3 className="text-lg font-medium">Sale Commission</h3>
                          </div>
                        </div>

                        {/* Sale Commission List Table */}
                        <div className="space-y-4">
                          {saleCommission.length > 0 ? (
                            <PaymentTable salePayments={saleCommission} />
                          ) : (
                            <NoPaymentDataTable message={"No Sale Commission Available"} />
                          )}
                        </div>
                      </>
                    )
                  }
              </form>
            </Form>
          </CardContent>
        </Card>

  {/* goToInvoice Button Without Sticky  */}
        {/* Invoice Summary Card */}
                  {/* <Button
          type="button"
          onClick={goToInvoice}
          className="flex items-center gap-1 cursor-pointer">
          <FileCheck className="h-4 w-4" /> Sale Invoice
        </Button> */}
        <div className='sticky top-0 fit-content'>
          <InvoiceWithProductSummary form={form} allProducts={allProducts} />
        </div>
      </div>
    </div>
  );
}
