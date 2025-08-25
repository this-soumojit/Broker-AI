import { useState, useRef, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import PageLoader from "@/components/page-loader";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Mail, Lock, Crown } from "lucide-react";
import { getSaleById } from "@/services/sale";
import { getClientById } from "@/services/client";
import { useAuth } from "@/hooks/use-auth";
import { IProduct, ISale, IClient } from "@/interfaces";
import { getProducts } from "@/services/product";
import { downloadPDFCompatible, emailPDFCompatible } from "@/utils/convert-pdf";
import { getGoodsReturnProducts } from "@/services/goods-return-product";
import { getGoodsReturns } from "@/services/goods-return";
import { getSalePayments } from "@/services/sale-payment";
import { useToast } from "@/hooks/use-toast";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { getUserPlanPermissions, UserPlanData } from "@/services/user";
import { SiWhatsapp } from "react-icons/si";
import { InvoiceTemplate } from "@/components/invoice-template";

// Types for goods returns and payments
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

export type GoodReturnProduct = {
  id?: string;
  quantity: number;
  Product: Product;
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
};

export type TGoodReturn = {
  id?: string;
  notes: string;
};

const defaultValues: ISale = {
  lorryReceiptNumber: "",
  lorryReceiptDate: "",
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
  buyer: {
    id: "",
    name: "",
    phone: "",
    address: "",
    gstin: "",
    pan: "",
    email: "",
  },
  seller: {
    id: "",
    name: "",
    phone: "",
    address: "",
    gstin: "",
    pan: "",
    email: "",
  },
  notes: "",
  products: [],
};

export default function SaleInvoicePage() {
  const { userId, bookId, saleId } = useParams();
  const { showSuccess, showError } = useToast();
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isLoadingPlan, setIsLoadingPlan] = useState<boolean>(true);
  const [userPlan, setUserPlan] = useState<UserPlanData | null>(null);
  const [saleData, setSaleData] = useState<ISale>(defaultValues);
  const [productData, setProduct] = useState<IProduct[]>([]);
  const [buyerData, setBuyerData] = useState<IClient | null>(null);
  const [sellerData, setSellerData] = useState<IClient | null>(null);
  const [goodReturnId, setGoodReturnId] = useState<TGoodReturn[]>([]);
  const [goodReturnProducts, setGoodReturnProducts] = useState<
    GoodReturnProduct[][]
  >([]);
  const [salePayments, setSalePayments] = useState<TSalePayments[]>([]);
  const [isEmailSending, setIsEmailSending] = useState<boolean>(false);
  const navigate = useNavigate();
  const { user, token } = useAuth();

  const contentRef = useRef<HTMLDivElement>(null);

  // Load user plan permissions
  const loadUserPlan = async () => {
    if (!userId || !token) {
      setIsLoadingPlan(false);
      return;
    }

    try {
      const response = await getUserPlanPermissions(userId, token);
      setUserPlan(response.data);
    } catch (error) {
      console.error("Error loading user plan:", error);
    } finally {
      setIsLoadingPlan(false);
    }
  };

  // Load good return data
  const loadGoodReturn = async () => {
    if (!userId || !bookId || !saleId) return;

    try {
      const { data } = await getGoodsReturns(userId, bookId, saleId);
      setGoodReturnId(data || []);
    } catch (error) {
      console.error("Error fetching goods return data:", error);
    }
  };

  // Load good return products
  const loadGoodReturnProducts = async () => {
    if (!userId || !bookId || !saleId || goodReturnId.length === 0) return;

    try {
      const productPromises = goodReturnId.map((goodReturn) =>
        getGoodsReturnProducts(userId, bookId, saleId, goodReturn.id ?? "")
      );
      const responses = await Promise.all(productPromises);
      const allProducts = responses.map((res) => res.data || []);
      setGoodReturnProducts(allProducts);
    } catch (error) {
      console.error("Error fetching goods return products:", error);
    }
  };

  // Load sale payments
  const loadSalePayment = async () => {
    if (!userId || !bookId || !saleId) return;

    try {
      const response = await getSalePayments(userId, bookId, saleId);
      setSalePayments(response?.data || []);
    } catch (error) {
      console.error("Error fetching sale payments:", error);
    }
  };

  // Load client data
  const loadClientData = async (sale: ISale) => {
    if (!userId) return;

    // Load buyer data
    if (sale.buyerId) {
      try {
        const { data: buyer } = await getClientById(userId, sale.buyerId);
        setBuyerData(buyer);
      } catch (error) {
        console.error("Error fetching buyer data:", error);
        setBuyerData(null);
      }
    }

    // Load seller data (if different from buyer)
    if (sale.sellerId && sale.sellerId !== sale.buyerId) {
      try {
        const { data: seller } = await getClientById(userId, sale.sellerId);
        setSellerData(seller);
      } catch (error) {
        console.error("Error fetching seller data:", error);
        setSellerData(null);
      }
    }
  };

  useEffect(() => {
    const fetchSaleData = async () => {
      if (!userId || !bookId || !saleId) return;

      setIsLoading(true);
      try {
        const [{ data: sale }, { data: product }] = await Promise.all([
          getSaleById(userId, bookId, saleId),
          getProducts(userId, bookId, saleId),
        ]);

        setSaleData(sale);
        setProduct(product);
        await loadClientData(sale);
        await loadGoodReturn();
        await loadSalePayment();
      } catch (error) {
        console.error("Error fetching sale data:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchSaleData();
    loadUserPlan();
  }, [userId, bookId, saleId, token]);

  // Load good return products when goodReturnId changes
  useEffect(() => {
    if (goodReturnId.length > 0) {
      loadGoodReturnProducts();
    }
  }, [goodReturnId]);

  // Calculate original and pending products
  const calculatePendingProducts = () => {
    const returnedProductsMap = new Map();

    // Create a map of returned quantities by product name
    goodReturnProducts.flat().forEach((returnProduct) => {
      const productName = returnProduct.Product.name;
      const currentReturned = returnedProductsMap.get(productName) || 0;
      returnedProductsMap.set(
        productName,
        currentReturned + returnProduct.quantity
      );
    });

    // Calculate original and pending products
    // productData.quantity is the remaining quantity after returns
    // Original quantity = remaining quantity + returned quantity
    return productData
      .map((product) => {
        const returnedQuantity = returnedProductsMap.get(product.name) || 0;
        const originalQuantity = product.quantity + returnedQuantity;
        const pendingQuantity = product.quantity;
        return {
          ...product,
          originalQuantity,
          pendingQuantity,
          returnedQuantity,
        };
      })
      .filter((product) => product.pendingQuantity > 0);
  };

  const pendingProducts = calculatePendingProducts();

  const goBack = () => {
    navigate(`/${userId}/books/${bookId}/sales/${saleId}/view`);
  };

  const handleSendEmail = async () => {
    if (!userPlan?.canSendReminders) {
      showError("Upgrade to Professional or Enterprise to send invoices");
      return;
    }

    if (!contentRef.current) {
      showError("Invoice content not found. Please try again.");
      return;
    }

    // Check if we have all required email addresses
    const userEmail = user?.email;
    const buyerEmail = saleData?.buyer?.email;
    const sellerEmail = saleData?.seller?.email;

    if (!userEmail || !buyerEmail || !sellerEmail) {
      const missingEmails = [];
      if (!userEmail) missingEmails.push("User");
      if (!buyerEmail) missingEmails.push("Buyer");
      if (!sellerEmail) missingEmails.push("Seller");

      showError(
        `Missing email addresses for: ${missingEmails.join(
          ", "
        )}. Please ensure all parties have valid email addresses.`
      );
      return;
    }

        setIsEmailSending(true);
        try {
          if (contentRef.current) {
            await emailPDFCompatible(contentRef as React.RefObject<HTMLDivElement>, {
              recipientEmail: buyerEmail,
              recipientName: saleData?.buyer?.name || "Buyer",
              invoiceNumber: saleData?.invoiceNumber || "N/A",
              senderName: user?.name || "User",
              customMessage: "Please find attached the invoice. Thank you for your business!"
            });

        showSuccess(`Invoice has been sent to Buyer`);
      }
    } catch (error) {
      console.error("Error sending email:", error);
      showError("Failed to send invoice email. Please try again.");
    } finally {
      setIsEmailSending(false);
    }
  };

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
            <div className="flex items-center gap-3">
              <h1 className="text-xl sm:text-3xl font-bold tracking-tight">
                Sale Invoice
              </h1>
              {isLoadingPlan ? (
                <Badge variant="secondary" className="text-xs">
                  Loading plan...
                </Badge>
              ) : userPlan ? (
                <Badge
                  variant={userPlan.canSendReminders ? "default" : "secondary"}
                  className="text-xs flex items-center gap-1"
                >
                  {userPlan.planName} Plan
                  {!userPlan.canSendReminders && <Lock className="h-3 w-3" />}
                </Badge>
              ) : null}
            </div>
            <p className="text-muted-foreground text-sm sm:text-md">
              {isLoadingPlan
                ? "Loading plan information..."
                : userPlan?.canSendReminders
                ? "View and share invoice details"
                : "View invoice details - upgrade to share"}
            </p>
          </div>
        </div>
        <div className="flex flex-col sm:flex-row items-center gap-3">
          <Button
            onClick={() => {
              if (!userPlan?.canSendReminders || !contentRef.current) return;
              downloadPDFCompatible(
                contentRef as React.RefObject<HTMLDivElement>,
                [
                  `91${user?.phone}`,
                  `91${sellerData?.phone}`,
                  `91${buyerData?.phone}`,
                ]
              );
            }}
            disabled={isLoadingPlan || !userPlan?.canSendReminders}
            className={`!text-sm sm:text-md ${isLoadingPlan || !userPlan?.canSendReminders ? "opacity-75" : ""}`}
            title={
              isLoadingPlan
                ? "Loading plan information..."
                : !userPlan?.canSendReminders
                ? "Upgrade to Professional or Enterprise to share invoices"
                : ""
            }
          >
            {(isLoadingPlan || !userPlan?.canSendReminders) && (
              <Lock className="h-4 w-4 mr-2" />
            )}
            <SiWhatsapp />
            Send To WhatsApp
          </Button>

          <Button
            onClick={handleSendEmail} className="!text-sm sm:text-md"
            disabled={
              isEmailSending || isLoadingPlan || !userPlan?.canSendReminders
            }
            title={
              isLoadingPlan
                ? "Loading plan information..."
                : !userPlan?.canSendReminders
                ? "Upgrade to Professional or Enterprise to send invoices"
                : ""
            }
          >
            {(isLoadingPlan || !userPlan?.canSendReminders) && (
              <Lock className="h-4 w-4 mr-2" />
            )}
            <Mail />
            {isEmailSending ? "Sending..." : "Send to Email"}
          </Button>
        </div>
      </div>

        <InvoiceTemplate 
        contentRef={contentRef}
        user={user} 
        saleData={saleData} 
        productData={productData} 
        goodReturnProducts={goodReturnProducts} 
        goodReturnId={goodReturnId} 
        calculatePendingProducts={calculatePendingProducts} 
        salePayments={salePayments}
        buyerData={buyerData}
        sellerData={sellerData}
        />


      {/* Plan Upgrade Banner - Only for Basic Plan */}
      {!isLoadingPlan &&
        userPlan &&
        (userPlan.planName === "Basic" || !userPlan.canSendReminders) && (
          <Card className="border-amber-200 bg-amber-50">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-semibold text-amber-800">
                    Upgrade to Share Invoices
                  </h3>
                  <p className="text-sm text-amber-700 mt-1">
                    You're currently on the {userPlan.planName} plan. Upgrade to
                    Professional or Enterprise to share invoices via WhatsApp
                    and email.
                  </p>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => navigate(`/${userId}/upgrade`)}
                  className="border-amber-300 text-amber-800 hover:bg-amber-100"
                >
                  <Crown className="h-4 w-4 mr-2" />
                  Upgrade Plan
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

      {/* Content goes here */}
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-4xl mx-auto">
          {/* Content to be converted to PDF */}
          <div
            className="bg-white rounded-lg shadow-lg p-8 space-y-6"
          >
            {/* Document Header */}
            <div className="border-b border-gray-200 pb-3">
              <h2 className="text-lg sm:text-2xl font-semibold text-gray-800">
                Sale Invoice
              </h2>
            </div>

        {/* Contact Information */}
        <div className="grid md:grid-cols-2 gap-6">
            <div className="space-y-4">
            <h3 className="text-md sm:text-lg font-semibold text-gray-800 border-b border-gray-200 pb-2">
                Broker Information
            </h3>
            <div className="space-y-2  text-sm sm:!text-base">
                <div className="flex justify-between">
                <span className="text-gray-600 text-sm sm:!text-base">Name:</span>
                <span className="text-gray-800 font-medium">{user?.name || 'N/A'}</span>
                </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Email:</span>
                    <span className="text-gray-800 font-medium">
                      {user?.email || "N/A"}
                    </span>
                  </div>
                </div>
              </div>

              <div className="space-y-4 text-sm sm:!text-base">
                <h3 className="text-lg font-semibold text-gray-800 border-b border-gray-200 pb-2">
                  Invoice Summary
                </h3>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Invoice Number:</span>
                    <span className="text-gray-800 font-medium">
                      {saleData?.invoiceNumber || "N/A"}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Date:</span>
                    <span className="text-gray-800 font-medium">
                      {saleData?.invoiceDate
                        ? new Date(saleData.invoiceDate).toLocaleDateString()
                        : "N/A"}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Due Date:</span>
                    <span className="text-gray-800 font-medium">
                      {saleData?.invoiceDate && saleData?.invoiceDueDays
                        ? new Date(
                            new Date(saleData.invoiceDate).getTime() +
                              saleData.invoiceDueDays * 24 * 60 * 60 * 1000
                          ).toLocaleDateString()
                        : "N/A"}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Status:</span>
                    <span
                      className={`font-medium ${
                        saleData?.status === "PAID"
                          ? "text-green-600"
                          : saleData?.status === "PARTIALLY_PAID"
                          ? "text-yellow-600"
                          : saleData?.status === "OVERDUE"
                          ? "text-red-600"
                          : "text-orange-600"
                      }`}
                    >
                      {saleData?.status.replace(/_/g, " ") || "N/A"}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Buyer and Seller Information */}
            <div className="grid md:grid-cols-2 gap-6 text-sm sm:!text-base">
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-800 border-b border-gray-200 pb-2">
                  Buyer Information
                </h3>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Name:</span>
                    <span className="text-gray-800 font-medium">
                      {buyerData?.name || saleData?.buyer?.name || "N/A"}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Phone:</span>
                    <span className="text-gray-800 font-medium">
                      {buyerData?.phone || saleData?.buyer?.phone || "N/A"}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">PAN:</span>
                    <span className="text-gray-800 font-medium">
                      {buyerData?.pan || saleData?.buyer?.pan || "N/A"}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Address:</span>
                    <span className="text-gray-800 font-medium">
                      {buyerData?.address || saleData?.buyer?.address || "N/A"}
                    </span>
                  </div>
                </div>
              </div>

              <div className="space-y-4 text-sm sm:!text-base">
                <h3 className="text-lg font-semibold text-gray-800 border-b border-gray-200 pb-2">
                  Seller Information
                </h3>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Name:</span>
                    <span className="text-gray-800 font-medium">
                      {sellerData?.name || saleData?.seller?.name || "N/A"}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Phone:</span>
                    <span className="text-gray-800 font-medium">
                      {sellerData?.phone || saleData?.seller?.phone || "N/A"}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">PAN:</span>
                    <span className="text-gray-800 font-medium">
                      {sellerData?.pan || saleData?.seller?.pan || "N/A"}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Address:</span>
                    <span className="text-gray-800">
                      {sellerData?.address ||
                        saleData?.seller?.address ||
                        "N/A"}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Sample Content */}
            <div className="space-y-4 text-sm sm:!text-base">
              <h3 className="text-lg font-semibold text-gray-800 border-b border-gray-200 pb-2">
                Transport & Additional Details
              </h3>
              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Lorry Receipt Number:</span>
                    <span className="text-gray-800 font-medium">
                      {saleData?.lorryReceiptNumber || "N/A"}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Transport Name:</span>
                    <span className="text-gray-800 font-medium">
                      {saleData?.transportName || "N/A"}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Transport Number:</span>
                    <span className="text-gray-800 font-medium">
                      {saleData?.transportNumber || "N/A"}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">E-Way Bill Number:</span>
                    <span className="text-gray-800 font-medium">
                      {saleData?.eWayBillNumber || "N/A"}
                    </span>
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Case Number:</span>
                    <span className="text-gray-800 font-medium">
                      {saleData?.caseNumber || "N/A"}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Weight:</span>
                    <span className="text-gray-800 font-medium">
                      {saleData?.weight ? `${saleData.weight} kg` : "N/A"}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Freight:</span>
                    <span className="text-gray-800 font-medium">
                      {saleData?.freight ? `₹${saleData.freight}` : "N/A"}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Commission Rate:</span>
                    <span className="text-gray-800 font-medium">
                      {saleData?.commissionRate
                        ? `${saleData.commissionRate}%`
                        : "N/A"}
                    </span>
                  </div>
                </div>
              </div>
              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-gray-800 border-b border-gray-200 pb-2">
                    User Information
                  </h3>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Name:</span>
                      <span className="text-gray-800 font-medium">
                        {user?.name || "N/A"}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Phone:</span>
                      <span className="text-gray-800 font-medium">
                        {user?.phone || "N/A"}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Email:</span>
                      <span className="text-gray-800 font-medium">
                        {user?.email || "N/A"}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="space-y-4 text-sm sm:!text-base">
                  <h3 className="text-lg font-semibold text-gray-800 border-b border-gray-200 pb-2">
                    Invoice Summary
                  </h3>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Invoice Number:</span>
                      <span className="text-gray-800 font-medium">
                        {saleData?.invoiceNumber || "N/A"}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Date:</span>
                      <span className="text-gray-800 font-medium">
                        {saleData?.invoiceDate
                          ? new Date(saleData.invoiceDate).toLocaleDateString()
                          : "N/A"}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Due Date:</span>
                      <span className="text-gray-800 font-medium">
                        {saleData?.invoiceDate && saleData?.invoiceDueDays
                          ? new Date(
                              new Date(saleData.invoiceDate).getTime() +
                                saleData.invoiceDueDays * 24 * 60 * 60 * 1000
                            ).toLocaleDateString()
                          : "N/A"}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Status:</span>
                      <span
                        className={`font-medium ${
                          saleData?.status === "PAID"
                            ? "text-green-600"
                            : saleData?.status === "PARTIALLY_PAID"
                            ? "text-yellow-600"
                            : saleData?.status === "OVERDUE"
                            ? "text-red-600"
                            : "text-orange-600"
                        }`}
                      >
                        {saleData?.status || "N/A"}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Sample Table */}
              <div className="space-y-4 !text-sm sm:!text-base">
                <h3 className="text-lg font-semibold text-gray-800 border-b border-gray-200 pb-2">
                  Product Details (Original Purchase)
                </h3>
                {productData && productData.length > 0 ? (
                  <div className="overflow-x-auto">
                    <table className="min-w-full bg-white border border-gray-200 border-collapse">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border border-gray-200">
                            Product Name
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border border-gray-200">
                            Original Quantity
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border border-gray-200">
                            Unit
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border border-gray-200">
                            Rate
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border border-gray-200">
                            GST Rate
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border border-gray-200">
                            Total
                          </th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-200">
                        {productData.map((product, index) => {
                          // Calculate original quantity by adding returned quantity
                          const returnedQuantity = goodReturnProducts
                            .flat()
                            .filter(
                              (returnProduct) =>
                                returnProduct.Product.name === product.name
                            )
                            .reduce(
                              (total, returnProduct) =>
                                total + returnProduct.quantity,
                              0
                            );
                          const originalQuantity =
                            product.quantity + returnedQuantity;

                          const subtotal = originalQuantity * product.rate;
                          const discount =
                            subtotal * (product.discountRate / 100);
                          const afterDiscount = subtotal - discount;
                          const gst = afterDiscount * (product.gstRate / 100);
                          const total = afterDiscount + gst;

                          return (
                            <tr key={index}>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 border border-gray-200">
                                {product.name}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 border border-gray-200">
                                {originalQuantity}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 border border-gray-200">
                                {product.unit}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 border border-gray-200">
                                ₹{product.rate.toFixed(2)}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 border border-gray-200">
                                {product.gstRate}%
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 border border-gray-200">
                                ₹{total.toFixed(2)}
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                      <tfoot className="bg-gray-50">
                        <tr>
                          <td
                            colSpan={5}
                            className="px-6 py-4 text-right text-sm font-medium text-gray-900 border border-gray-200"
                          >
                            Gross Amount:
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-gray-900 border border-gray-200">
                            ₹{saleData.invoiceGrossAmount?.toFixed(2) || "0.00"}
                          </td>
                        </tr>
                        <tr>
                          <td
                            colSpan={5}
                            className="px-6 py-4 text-right text-sm font-medium text-gray-900 border border-gray-200"
                          >
                            Discount:
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-gray-900 border border-gray-200">
                            ₹
                            {saleData.invoiceDiscountAmount?.toFixed(2) ||
                              "0.00"}
                          </td>
                        </tr>
                        <tr>
                          <td
                            colSpan={5}
                            className="px-6 py-4 text-right text-sm font-medium text-gray-900 border border-gray-200"
                          >
                            GST Amount:
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-gray-900 border border-gray-200">
                            ₹{saleData.invoiceTaxAmount?.toFixed(2) || "0.00"}
                          </td>
                        </tr>
                        <tr>
                          <td
                            colSpan={5}
                            className="px-6 py-4 text-right text-sm font-medium text-gray-900 border border-gray-200"
                          >
                            Net Amount:
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-gray-900 border border-gray-200">
                            ₹{saleData.invoiceNetAmount?.toFixed(2) || "0.00"}
                          </td>
                        </tr>
                      </tfoot>
                    </table>
                  </div>
                ) : (
                  <div className="text-center text-gray-500 py-8">
                    {" "}
                    No products found{" "}
                  </div>
                )}
              </div>

              {/* Goods Return Section */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-800 border-b border-gray-200 pb-2">
                  Goods Return Details
                </h3>
                {goodReturnProducts &&
                goodReturnProducts.length > 0 &&
                goodReturnProducts.some((products) => products.length > 0) ? (
                  <div className="space-y-6">
                    {goodReturnProducts.map((returnProducts, returnIndex) => {
                      if (returnProducts.length === 0) return null;

                      return (
                        <div
                          key={returnIndex}
                          className="border border-gray-200 rounded-lg overflow-hidden"
                        >
                          <div className="bg-gray-100 px-6 py-3 border-b border-gray-200">
                            <h4 className="text-md font-medium text-gray-800">
                              Goods Return #{returnIndex + 1}
                              {goodReturnId[returnIndex]?.notes && (
                                <span className="text-sm text-gray-600 ml-2">
                                  - {goodReturnId[returnIndex].notes}
                                </span>
                              )}
                            </h4>
                          </div>
                          <div className="overflow-x-auto">
                            <table className="min-w-full bg-white border-collapse">
                              <thead className="bg-gray-50">
                                <tr>
                                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border border-gray-200">
                                    Product Name
                                  </th>
                                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border border-gray-200">
                                    Returned Quantity
                                  </th>
                                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border border-gray-200">
                                    Unit
                                  </th>
                                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border border-gray-200">
                                    Rate
                                  </th>
                                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border border-gray-200">
                                    Return Value
                                  </th>
                                </tr>
                              </thead>
                              <tbody className="divide-y divide-gray-200">
                                {returnProducts.map(
                                  (returnProduct, productIndex) => {
                                    const subtotal =
                                      returnProduct.quantity *
                                      returnProduct.Product.rate;
                                    const discount =
                                      subtotal *
                                      (returnProduct.Product.discountRate /
                                        100);
                                    const afterDiscount = subtotal - discount;
                                    const gst =
                                      afterDiscount *
                                      (returnProduct.Product.gstRate / 100);
                                    const returnValue = afterDiscount + gst;

                                    return (
                                      <tr key={productIndex}>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 border border-gray-200">
                                          {returnProduct.Product.name}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 border border-gray-200">
                                          {returnProduct.quantity}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 border border-gray-200">
                                          {returnProduct.Product.unit}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 border border-gray-200">
                                          ₹
                                          {returnProduct.Product.rate.toFixed(
                                            2
                                          )}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 border border-gray-200">
                                          ₹{returnValue.toFixed(2)}
                                        </td>
                                      </tr>
                                    );
                                  }
                                )}
                              </tbody>
                              <tfoot className="bg-gray-50">
                                <tr>
                                  <td
                                    colSpan={4}
                                    className="px-6 py-4 text-right text-sm font-medium text-gray-900 border border-gray-200"
                                  >
                                    Return #{returnIndex + 1} Total:
                                  </td>
                                  <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-gray-900 border border-gray-200">
                                    ₹
                                    {returnProducts
                                      .reduce((total, returnProduct) => {
                                        const subtotal =
                                          returnProduct.quantity *
                                          returnProduct.Product.rate;
                                        const discount =
                                          subtotal *
                                          (returnProduct.Product.discountRate /
                                            100);
                                        const afterDiscount =
                                          subtotal - discount;
                                        const gst =
                                          afterDiscount *
                                          (returnProduct.Product.gstRate / 100);
                                        return total + (afterDiscount + gst);
                                      }, 0)
                                      .toFixed(2)}
                                  </td>
                                </tr>
                              </tfoot>
                            </table>
                          </div>
                        </div>
                      );
                    })}

                    {/* Total of all returns */}
                    <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                      <div className="flex justify-between items-center">
                        <span className="text-sm sm:text-lg font-semibold text-gray-800">
                          Total Return Value (All Returns):
                        </span>
                        <span className="text-lg font-bold text-red-600">
                          ₹
                          {goodReturnProducts
                            .flat()
                            .reduce((total, returnProduct) => {
                              const subtotal =
                                returnProduct.quantity *
                                returnProduct.Product.rate;
                              const discount =
                                subtotal *
                                (returnProduct.Product.discountRate / 100);
                              const afterDiscount = subtotal - discount;
                              const gst =
                                afterDiscount *
                                (returnProduct.Product.gstRate / 100);
                              return total + (afterDiscount + gst);
                            }, 0)
                            .toFixed(2)}
                        </span>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="text-center text-gray-500 py-8">
                    No goods return available
                  </div>
                )}
              </div>

              {/* Pending Products Section */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-800 border-b border-gray-200 pb-2">
                  Pending Products (After Returns)
                </h3>
                {pendingProducts && pendingProducts.length > 0 ? (
                  <div className="overflow-x-auto">
                    <table className="min-w-full bg-white border border-gray-200 border-collapse">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border border-gray-200">
                            Product Name
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border border-gray-200">
                            Original Qty
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border border-gray-200">
                            Returned Qty
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border border-gray-200">
                            Pending Qty
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border border-gray-200">
                            Rate
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border border-gray-200">
                            Pending Value
                          </th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-200">
                        {pendingProducts.map((product, index) => {
                          const subtotal =
                            product.pendingQuantity * product.rate;
                          const discount =
                            subtotal * (product.discountRate / 100);
                          const afterDiscount = subtotal - discount;
                          const gst = afterDiscount * (product.gstRate / 100);
                          const pendingValue = afterDiscount + gst;

                          return (
                            <tr key={index}>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 border border-gray-200">
                                {product.name}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 border border-gray-200">
                                {product.originalQuantity}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 border border-gray-200">
                                {product.returnedQuantity}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 border border-gray-200">
                                {product.pendingQuantity}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 border border-gray-200">
                                ₹{product.rate.toFixed(2)}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 border border-gray-200">
                                ₹{pendingValue.toFixed(2)}
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                      <tfoot className="bg-gray-50">
                        <tr>
                          <td
                            colSpan={5}
                            className="px-6 py-4 text-right text-sm font-medium text-gray-900 border border-gray-200"
                          >
                            Total Pending Value:
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-gray-900 border border-gray-200">
                            ₹
                            {pendingProducts
                              .reduce((total, product) => {
                                const subtotal =
                                  product.pendingQuantity * product.rate;
                                const discount =
                                  subtotal * (product.discountRate / 100);
                                const afterDiscount = subtotal - discount;
                                const gst =
                                  afterDiscount * (product.gstRate / 100);
                                return total + (afterDiscount + gst);
                              }, 0)
                              .toFixed(2)}
                          </td>
                        </tr>
                      </tfoot>
                    </table>
                  </div>
                ) : (
                  <div className="text-center text-gray-500 py-8">
                    All products have been returned or no products pending
                  </div>
                )}
              </div>

              {/* Payment Details Section */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-800 border-b border-gray-200 pb-2">
                  Payment Details
                </h3>
                {salePayments && salePayments.length > 0 ? (
                  <div className="overflow-x-auto">
                    <table className="min-w-full bg-white border border-gray-200 border-collapse">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border border-gray-200">
                            Payment Date
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border border-gray-200">
                            Payment Method
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border border-gray-200">
                            Reference Number
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border border-gray-200">
                            Amount Paid
                          </th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-200">
                        {salePayments.map((payment, index) => (
                          <tr key={index}>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 border border-gray-200">
                              {new Date(payment.createdAt).toLocaleDateString()}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 border border-gray-200">
                              {payment.paymentMethod.replace(/_/g, " ")}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 border border-gray-200">
                              {payment.referenceNumber || "N/A"}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 border border-gray-200">
                              ₹{payment.amount.toFixed(2)}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                      <tfoot className="bg-gray-50">
                        <tr>
                          <td
                            colSpan={3}
                            className="px-6 py-4 text-right text-sm font-medium text-gray-900 border border-gray-200"
                          >
                            Total Paid:
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-gray-900 border border-gray-200">
                            ₹
                            {salePayments
                              .reduce(
                                (total, payment) => total + payment.amount,
                                0
                              )
                              .toFixed(2)}
                          </td>
                        </tr>
                      </tfoot>
                    </table>
                  </div>
                ) : (
                  <div className="text-center text-gray-500 py-8">
                    No sale payment available
                  </div>
                )}
              </div>

              {/* Payment Summary Section */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-800 border-b border-gray-200 pb-2">
                  Payment Summary
                </h3>
                <div className="bg-gray-50 p-6 rounded-lg">
                  <div className="grid md:grid-cols-2 gap-6">
                    <div className="space-y-3">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Invoice Amount:</span>
                        <span className="text-gray-800 font-medium">
                          ₹{saleData.invoiceNetAmount?.toFixed(2) || "0.00"}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">
                          Goods Return Value:
                        </span>
                        <span className="text-red-600 font-medium">
                          - ₹
                          {goodReturnProducts
                            .flat()
                            .reduce((total, returnProduct) => {
                              const subtotal =
                                returnProduct.quantity *
                                returnProduct.Product.rate;
                              const discount =
                                subtotal *
                                (returnProduct.Product.discountRate / 100);
                              const afterDiscount = subtotal - discount;
                              const gst =
                                afterDiscount *
                                (returnProduct.Product.gstRate / 100);
                              return total + (afterDiscount + gst);
                            }, 0)
                            .toFixed(2)}
                        </span>
                      </div>
                      <div className="flex justify-between border-t pt-2">
                        <span className="text-gray-600 font-medium">
                          Adjusted Invoice Amount:
                        </span>
                        <span className="text-gray-800 font-semibold">
                          ₹
                          {Math.max(
                            0,
                            (saleData.invoiceNetAmount || 0) -
                              goodReturnProducts
                                .flat()
                                .reduce((total, returnProduct) => {
                                  const subtotal =
                                    returnProduct.quantity *
                                    returnProduct.Product.rate;
                                  const discount =
                                    subtotal *
                                    (returnProduct.Product.discountRate / 100);
                                  const afterDiscount = subtotal - discount;
                                  const gst =
                                    afterDiscount *
                                    (returnProduct.Product.gstRate / 100);
                                  return total + (afterDiscount + gst);
                                }, 0)
                          ).toFixed(2)}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Total Paid:</span>
                        <span className="text-green-600 font-medium">
                          ₹
                          {salePayments
                            .reduce(
                              (total, payment) => total + payment.amount,
                              0
                            )
                            .toFixed(2)}
                        </span>
                      </div>
                    </div>
                    <div className="space-y-3">
                      <div className="flex justify-between border-t pt-3">
                        <span className="text-gray-800 font-semibold">
                          Pending Amount:
                        </span>
                        <span
                          className={`font-bold ${
                            Math.max(
                              0,
                              (saleData.invoiceNetAmount || 0) -
                                goodReturnProducts
                                  .flat()
                                  .reduce((total, returnProduct) => {
                                    const subtotal =
                                      returnProduct.quantity *
                                      returnProduct.Product.rate;
                                    const discount =
                                      subtotal *
                                      (returnProduct.Product.discountRate /
                                        100);
                                    const afterDiscount = subtotal - discount;
                                    const gst =
                                      afterDiscount *
                                      (returnProduct.Product.gstRate / 100);
                                    return total + (afterDiscount + gst);
                                  }, 0) -
                                salePayments.reduce(
                                  (total, payment) => total + payment.amount,
                                  0
                                )
                            ) <= 0
                              ? "text-green-600"
                              : "text-red-500"
                          }`}
                        >
                          ₹
                          {Math.max(
                            0,
                            (saleData.invoiceNetAmount || 0) -
                              goodReturnProducts
                                .flat()
                                .reduce((total, returnProduct) => {
                                  const subtotal =
                                    returnProduct.quantity *
                                    returnProduct.Product.rate;
                                  const discount =
                                    subtotal *
                                    (returnProduct.Product.discountRate / 100);
                                  const afterDiscount = subtotal - discount;
                                  const gst =
                                    afterDiscount *
                                    (returnProduct.Product.gstRate / 100);
                                  return total + (afterDiscount + gst);
                                }, 0) -
                              salePayments.reduce(
                                (total, payment) => total + payment.amount,
                                0
                              )
                          ).toFixed(2)}
                        </span>
                      </div>
                      {(() => {
                        const adjustedAmount = Math.max(
                          0,
                          (saleData.invoiceNetAmount || 0) -
                            goodReturnProducts
                              .flat()
                              .reduce((total, returnProduct) => {
                                const subtotal =
                                  returnProduct.quantity *
                                  returnProduct.Product.rate;
                                const discount =
                                  subtotal *
                                  (returnProduct.Product.discountRate / 100);
                                const afterDiscount = subtotal - discount;
                                const gst =
                                  afterDiscount *
                                  (returnProduct.Product.gstRate / 100);
                                return total + (afterDiscount + gst);
                              }, 0)
                        );
                        const totalPaid = salePayments.reduce(
                          (total, payment) => total + payment.amount,
                          0
                        );
                        const difference = totalPaid - adjustedAmount;

                        if (difference > 0) {
                          return (
                            <div className="flex justify-between">
                              <span className="text-gray-800 font-medium">
                                Overpaid Amount:
                              </span>
                              <span className="font-medium text-blue-600">
                                ₹{difference.toFixed(2)}
                              </span>
                            </div>
                          );
                        }
                        return null;
                      })()}
                    </div>
                  </div>
                </div>

                {/* Footer */}
                <div className="border-t border-gray-200 pt-6 text-center text-sm text-gray-500">
                  <p>
                    This document was generated automatically on{" "}
                    {new Date().toLocaleString()}
                  </p>
                  <p className="mt-2">
                    © {new Date().getFullYear()} Your Company Name. All rights
                    reserved.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
