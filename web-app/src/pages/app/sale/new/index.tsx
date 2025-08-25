import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { ArrowLeft, Plus, Trash2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { InvoiceUploader } from "@/components/invoice-uploader";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Form, FormLabel } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import PageLoader from "@/components/page-loader";
import { saleFormSchema } from "@/schemas";
import { addSaleToBook } from "@/services/sale";
import { addProducts } from "@/services/product";
import { getAccessibleClients } from "@/services/client";
import { IClient, ExtractedInvoiceData } from "@/interfaces";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { InvoiceSummary } from "@/components/invoice-summary";
import SaleInfo from "@/components/sale-info";

// Add these imports at the top
import { getUserPlanPermissions, UserPlanData } from "@/services/user";
import { useAuth } from "@/hooks/use-auth";
import { Lock, Crown } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import CustomAlertDialog from "@/components/custom-alert-dialog";
type Product = {
  name: string;
  quantity: number;
  unit: string;
  rate: number;
  gstRate: number;
  discountRate: number;
  notes?: string;
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
  commissionRate: 2, // Default 2% commission rate
  invoiceDueDays: 0,
  status: "PENDING",
  sellerId: "",
  buyerId: "",
  notes: "",
  products: [],
};

const emptyProduct: Product = {
  name: "",
  quantity: 0,
  unit: "",
  rate: 0,
  gstRate: 0,
  discountRate: 0,
  notes: "",
};

export default function NewSalePage() {
  const [isLoading, setIsLoading] = useState(false);
  const [clients, setClients] = useState<
    Array<IClient & { isAccessible: boolean }>
  >([]);
  const [currentProduct, setCurrentProduct] = useState<Product>({
    ...emptyProduct,
  });
  const { showSuccess, showError } = useToast();
  const { userId, bookId } = useParams();
  const navigate = useNavigate();

  const [userPlan, setUserPlan] = useState<UserPlanData | null>(null);
  const { token } = useAuth(); // Get the auth token

  const loadUserPlanPermissions = async () => {
    if (!userId || !token) return;

    try {
      const response = await getUserPlanPermissions(userId, token);
      setUserPlan(response.data);
    } catch (error) {
      console.error("Error loading user plan permissions:", error);
      // Default to basic plan if there's an error
      setUserPlan({
        planName: "Basic",
        canSendReminders: false,
      });
    }
  };

  const form = useForm<SaleFormValues>({
    resolver: zodResolver(saleFormSchema),
    defaultValues,
  });

  const loadClients = async () => {
    if (!userId) return;

    try {
      const response = await getAccessibleClients(userId);
      // Explicitly cast the response to include isAccessible property
      setClients(
        response.clients as Array<IClient & { isAccessible: boolean }>
      );
    } catch (error) {
      showError(error);
    }
  };

  const handleExtractedData = (extractedData: ExtractedInvoiceData) => {
    try {
      console.log("=== FORM MAPPING DEBUG ===");
      console.log("Raw extracted data:", extractedData);

      // Reset form to default values first
      form.reset(defaultValues);

      // Helper function to parse dates safely
      const parseDate = (dateString: string | undefined): Date | undefined => {
        if (!dateString) return undefined;
        const date = new Date(dateString);
        return isNaN(date.getTime()) ? undefined : date;
      };

      // 1. Basic Invoice Details
      if (extractedData.invoiceNumber) {
        form.setValue("invoiceNumber", extractedData.invoiceNumber);
        console.log("Set invoice number:", extractedData.invoiceNumber);
      }

      // 2. Set Invoice Date
      const invoiceDate = parseDate(extractedData.invoiceDate);
      if (invoiceDate) {
        form.setValue("invoiceDate", invoiceDate);
        console.log("Set invoice date:", invoiceDate);
      }

      // 3. Set Amount Details (with null check)
      const setAmount = (
        value: number | undefined | null,
        field: keyof SaleFormValues
      ) => {
        if (typeof value === "number" && !isNaN(value)) {
          form.setValue(field, Number(value.toFixed(2)));
          console.log(`Set ${field}:`, value.toFixed(2));
        }
      };

      setAmount(extractedData.invoiceGrossAmount, "invoiceGrossAmount");
      setAmount(extractedData.invoiceDiscountAmount, "invoiceDiscountAmount");
      setAmount(extractedData.invoiceTaxAmount, "invoiceTaxAmount");
      setAmount(extractedData.invoiceNetAmount, "invoiceNetAmount");

      // Set transport details
      if (extractedData.transportDetails) {
        if (extractedData.transportDetails.transportName) {
          form.setValue(
            "transportName",
            extractedData.transportDetails.transportName
          );
          console.log(
            "Set transport name:",
            extractedData.transportDetails.transportName
          );
        }
        if (extractedData.transportDetails.transportNumber) {
          form.setValue(
            "transportNumber",
            extractedData.transportDetails.transportNumber
          );
          console.log(
            "Set transport number:",
            extractedData.transportDetails.transportNumber
          );
        }
        if (extractedData.transportDetails.transportStation) {
          form.setValue(
            "transportStation",
            extractedData.transportDetails.transportStation
          );
          console.log(
            "Set transport station:",
            extractedData.transportDetails.transportStation
          );
        }
        if (extractedData.transportDetails.lorryReceiptNumber) {
          form.setValue(
            "lorryReceiptNumber",
            extractedData.transportDetails.lorryReceiptNumber
          );
          console.log(
            "Set lorry receipt number:",
            extractedData.transportDetails.lorryReceiptNumber
          );
        }
        if (extractedData.transportDetails.lorryReceiptDate) {
          const lrDate = parseDate(
            extractedData.transportDetails.lorryReceiptDate
          );
          if (lrDate) {
            form.setValue("lorryReceiptDate", lrDate);
            console.log("Set lorry receipt date:", lrDate);
          }
        }
      }

      // Set challan details
      if (extractedData.challanNumber) {
        form.setValue("challanNumber", extractedData.challanNumber);
        console.log("Set challan number:", extractedData.challanNumber);
      }
      const challanDate = parseDate(extractedData.challanDate);
      if (challanDate) {
        form.setValue("challanDate", challanDate);
        console.log("Set challan date:", challanDate);
      }

      // Set e-way bill details
      if (extractedData.eWayBillNumber) {
        form.setValue("eWayBillNumber", extractedData.eWayBillNumber);
        console.log("Set e-way bill number:", extractedData.eWayBillNumber);
      }
      const eWayBillDate = parseDate(extractedData.eWayBillDate);
      if (eWayBillDate) {
        form.setValue("eWayBillDate", eWayBillDate);
        console.log("Set e-way bill date:", eWayBillDate);
      }

      // Set weight and freight
      if (
        typeof extractedData.weight === "number" &&
        !isNaN(extractedData.weight)
      ) {
        form.setValue("weight", extractedData.weight);
        console.log("Set weight:", extractedData.weight);
      }
      if (
        typeof extractedData.freight === "number" &&
        !isNaN(extractedData.freight)
      ) {
        form.setValue("freight", extractedData.freight);
        console.log("Set freight:", extractedData.freight);
      }
      if (extractedData.caseNumber) {
        form.setValue("caseNumber", extractedData.caseNumber);
        console.log("Set case number:", extractedData.caseNumber);
      }

      // 4. Set Products (with validation)
      if (extractedData.products && Array.isArray(extractedData.products)) {
        const validProducts = extractedData.products.map((product) => ({
          name: product.name,
          quantity: Number(product.quantity),
          unit: product.unit || "PCS",
          rate: Number(product.rate || 0),
          gstRate: Number(product.gstRate || 0),
          discountRate: Number(product.discountRate || 0),
          notes: "",
        }));

        if (validProducts.length > 0) {
          form.setValue("products", validProducts);
          console.log("Set products:", validProducts);
        }
      }

      // Set default commission rate if not set
      if (!form.getValues("commissionRate")) {
        form.setValue("commissionRate", 2); // Default 2% commission
      }

      // Set default due days if not set
      if (!form.getValues("invoiceDueDays")) {
        form.setValue("invoiceDueDays", 45); // Default 45 days
      }

      showSuccess("Form filled successfully with extracted data");
      console.log("Final form values:", form.getValues());
    } catch (error) {
      console.error("Error filling form:", error);
      showError("Failed to fill form with extracted data");
    }
  };

  useEffect(() => {
    loadClients();
    loadUserPlanPermissions();
  }, [userId, token]);

  // Add automatic calculations for invoice amounts based on products
  useEffect(() => {
    const products = form.watch("products");

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

      // Set commission rate to 2% only if it's currently 0 (not manually set)
      const currentCommissionRate = form.getValues("commissionRate");
      if (currentCommissionRate === 0) {
        form.setValue("commissionRate", 2);
      }
    } else {
      // Reset values when no products
      form.setValue("invoiceGrossAmount", 0);
      form.setValue("invoiceDiscountAmount", 0);
      form.setValue("invoiceTaxAmount", 0);
      form.setValue("invoiceNetAmount", 0);

      // Only reset commission rate if it's currently 0
      const currentCommissionRate = form.getValues("commissionRate");
      if (currentCommissionRate === 0) {
        form.setValue("commissionRate", 2);
      }
    }
  }, [form.watch("products")]);

  // Calculate invoice due days based on invoice date
  useEffect(() => {
    const invoiceDate = form.watch("invoiceDate");

    if (invoiceDate) {
      // Set default due date to 30 days from invoice date (you can adjust this)
      const dueDateFromInvoice = new Date(invoiceDate);
      dueDateFromInvoice.setDate(dueDateFromInvoice.getDate() + 45);

      // Calculate days difference
      const timeDifference =
        dueDateFromInvoice.getTime() - new Date(invoiceDate).getTime();
      const daysDifference = Math.ceil(timeDifference / (1000 * 3600 * 24));

      form.setValue("invoiceDueDays", daysDifference);
    }
  }, [form.watch("invoiceDate")]);

  const onSubmit = async (data: SaleFormValues) => {
    if (!userId || !bookId) return;

    setIsLoading(true);

    try {
      const sendSale = await addSaleToBook(userId, bookId, {
        ...data,
        lorryReceiptDate:
          data.lorryReceiptDate instanceof Date
            ? data.lorryReceiptDate.toISOString()
            : data.lorryReceiptDate,
        challanDate:
          data.challanDate instanceof Date
            ? data.challanDate.toISOString()
            : data.challanDate,
        invoiceDate:
          data.invoiceDate instanceof Date
            ? data.invoiceDate.toISOString()
            : data.invoiceDate,
        eWayBillDate:
          data.eWayBillDate instanceof Date
            ? data.eWayBillDate.toISOString()
            : data.eWayBillDate,
        invoiceGrossAmount: data.invoiceGrossAmount,
        invoiceDiscountAmount: data.invoiceDiscountAmount,
        invoiceTaxAmount: data.invoiceTaxAmount,
        invoiceNetAmount: data.invoiceNetAmount,
        commissionRate: data.commissionRate,
        invoiceDueDays: data.invoiceDueDays,
        sellerId: data.sellerId,
        buyerId: data.buyerId,
        notes: data.notes || "",
        status: "PENDING",
        products: data.products,
      });

      console.log(data.products);

      console.log(sendSale);

      for (const product of data.products) {
        const sendProduct = await addProducts(
          userId,
          bookId,
          sendSale.data?.id,
          {
            name: product.name,
            quantity: product.quantity,
            unit: product.unit,
            rate: product.rate,
            gstRate: product.gstRate,
            discountRate: product.discountRate,
            notes: product.notes,
          }
        );
        console.log(sendProduct);
      }

      showSuccess("Sale created successfully");
      navigate(`/${userId}/books/${bookId}/sales`);
    } catch (error) {
      showError(error);
    } finally {
      setIsLoading(false);
    }
  };

  const goBack = () => {
    navigate(`/${userId}/books/${bookId}/sales`);
  };

  // Filter accessible clients for dropdowns
  const accessibleClients = clients.filter((client) => client.isAccessible);

  return (
    <div className="container mx-auto py-6 space-y-6">
      <PageLoader isLoading={isLoading} />

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
          <h1 className="text-3xl font-bold tracking-tight">Add New Sale</h1>
          <p className="text-muted-foreground">Create a new sale</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="col-span-1 lg:col-span-2 shadow-sm">
          <CardHeader>
            <CardTitle>Sale Information</CardTitle>
            <CardDescription>
              Enter the details for your new sale
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form
                onSubmit={form.handleSubmit(onSubmit)}
                className="space-y-6"
              >
                {/* Invoice Upload Section */}
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <h3 className="text-lg font-medium">Upload Invoice</h3>
                    {userPlan?.planName === "Basic" ? (
                      <Badge variant="secondary" className="text-xs">
                        <Lock className="h-3 w-3 mr-1" />
                        Professional+
                      </Badge>
                    ) : (
                      <Badge
                        variant="outline"
                        className="text-xs bg-black text-white border-black"
                      >
                        {userPlan?.planName} Plan
                      </Badge>
                    )}
                  </div>

                  <div className="border rounded-md p-4">
                    {userPlan?.planName === "Basic" ? (
                      <div className="flex flex-col items-center justify-center gap-4 p-8 text-center ">
                        <Lock className="h-8 w-8 text-muted-foreground" />
                        <div>
                          <h4 className="font-semibold">
                            AI Invoice Processing
                          </h4>
                          <p className="text-sm text-muted-foreground">
                            Available in Professional and Enterprise plans
                          </p>
                        </div>
                        <Button
                          onClick={() => navigate(`/${userId}/upgrade`)}
                          variant="default"
                        >
                          <Crown className="h-4 w-4 mr-2" />
                          Upgrade Now
                        </Button>
                      </div>
                    ) : (
                      <InvoiceUploader
                        onDataExtracted={(data) => handleExtractedData(data)}
                        onError={(error) => showError(error)}
                      />
                    )}
                  </div>
                </div>
                <SaleInfo form={form} clients={accessibleClients} />

                {/* Products Section */}
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <h3 className="text-lg font-medium">Products</h3>
                  </div>

                  <div className="border rounded-md p-4 space-y-4">
                    {/* Product Input Fields */}
                    <div className="grid grid-cols-1 gap-4">
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                          <FormLabel htmlFor="product-name">
                            Name<span className="text-red-500">*</span>
                          </FormLabel>
                          <Input
                            id="product-name"
                            placeholder="Product name"
                            value={currentProduct.name}
                            onChange={(e) =>
                              setCurrentProduct({
                                ...currentProduct,
                                name: e.target.value,
                              })
                            }
                          />
                        </div>

                        <div className="grid grid-cols-2 gap-2">
                          <div>
                            <FormLabel htmlFor="product-quantity">
                              Quantity<span className="text-red-500">*</span>
                            </FormLabel>
                            <Input
                              id="product-quantity"
                              type="number"
                              min={0}
                              step="1"
                              placeholder="0"
                              value={currentProduct.quantity}
                              onChange={(e) =>
                                setCurrentProduct({
                                  ...currentProduct,
                                  quantity: parseFloat(e.target.value) || 0,
                                })
                              }
                            />
                          </div>

                          <div>
                            <FormLabel htmlFor="product-unit">
                              Unit<span className="text-red-500">*</span>
                            </FormLabel>
                            <Input
                              id="product-unit"
                              placeholder="kg, pcs, etc."
                              value={currentProduct.unit}
                              onChange={(e) =>
                                setCurrentProduct({
                                  ...currentProduct,
                                  unit: e.target.value,
                                })
                              }
                            />
                          </div>
                        </div>

                        <div>
                          <FormLabel htmlFor="product-rate">
                            Rate (₹)<span className="text-red-500">*</span>
                          </FormLabel>
                          <Input
                            id="product-rate"
                            type="number"
                            min={0}
                            step="0.01"
                            placeholder="0"
                            value={currentProduct.rate}
                            onChange={(e) =>
                              setCurrentProduct({
                                ...currentProduct,
                                rate: parseFloat(e.target.value) || 0,
                              })
                            }
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-2">
                        <div>
                          <FormLabel htmlFor="product-amount">
                            Amount (₹)
                          </FormLabel>
                          <Input
                            id="product-amount"
                            type="text"
                            readOnly
                            className="bg-muted"
                            value={(
                              currentProduct.quantity * currentProduct.rate
                            ).toFixed(2)}
                          />
                        </div>

                        <div className="grid grid-cols-2 gap-2">
                          <div>
                            <FormLabel htmlFor="product-discount">
                              Discount (%)
                              <span className="text-red-500">*</span>
                            </FormLabel>
                            <Input
                              id="product-discount"
                              type="number"
                              min={0}
                              max={100}
                              step="0.01"
                              placeholder="0"
                              value={currentProduct.discountRate}
                              onChange={(e) =>
                                setCurrentProduct({
                                  ...currentProduct,
                                  discountRate: parseFloat(e.target.value) || 0,
                                })
                              }
                            />
                          </div>

                          <div>
                            <FormLabel htmlFor="product-discount-amount">
                              Discount (₹)
                            </FormLabel>
                            <Input
                              id="product-discount-amount"
                              type="text"
                              readOnly
                              className="bg-muted"
                              value={(
                                (currentProduct.quantity *
                                  currentProduct.rate *
                                  currentProduct.discountRate) /
                                100
                              ).toFixed(2)}
                            />
                          </div>
                        </div>

                        <div className="grid grid-cols-2 gap-2">
                          <div>
                            <FormLabel htmlFor="product-gst">
                              GST Rate (%)
                              <span className="text-red-500">*</span>
                            </FormLabel>
                            <Input
                              id="product-gst"
                              type="number"
                              min={0}
                              max={100}
                              step="0.01"
                              placeholder="0"
                              value={currentProduct.gstRate}
                              onChange={(e) =>
                                setCurrentProduct({
                                  ...currentProduct,
                                  gstRate: parseFloat(e.target.value) || 0,
                                })
                              }
                            />
                          </div>

                          <div>
                            <FormLabel htmlFor="product-gst-amount">
                              GST (₹)
                            </FormLabel>
                            <Input
                              id="product-gst-amount"
                              type="text"
                              readOnly
                              className="bg-muted"
                              value={(() => {
                                const amount =
                                  currentProduct.quantity * currentProduct.rate;
                                const discountAmount =
                                  (amount * currentProduct.discountRate) / 100;
                                return (
                                  ((amount - discountAmount) *
                                    currentProduct.gstRate) /
                                  100
                                ).toFixed(2);
                              })()}
                            />
                          </div>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-2">
                        <div>
                          <FormLabel
                            htmlFor="product-total"
                            className="font-medium"
                          >
                            Total Amount (₹)
                          </FormLabel>
                          <Input
                            id="product-total"
                            type="text"
                            readOnly
                            className="bg-muted font-medium"
                            value={(() => {
                              const amount =
                                currentProduct.quantity * currentProduct.rate;
                              const discountAmount =
                                (amount * currentProduct.discountRate) / 100;
                              const afterDiscount = amount - discountAmount;
                              const gstAmount =
                                (afterDiscount * currentProduct.gstRate) / 100;
                              return (afterDiscount + gstAmount).toFixed(2);
                            })()}
                          />
                        </div>

                        <div className="md:col-span-2">
                          <FormLabel htmlFor="product-notes">
                            Notes
                            <span className="text-muted-foreground">
                              (Optional)
                            </span>
                          </FormLabel>
                          <Textarea
                            id="product-notes"
                            placeholder="Product notes"
                            value={currentProduct.notes}
                            onChange={(e) =>
                              setCurrentProduct({
                                ...currentProduct,
                                notes: e.target.value,
                              })
                            }
                          />
                        </div>
                      </div>
                    </div>

                    <div className="flex justify-end">
                      <Button
                        type="button"
                        onClick={() => {
                          if (
                            !currentProduct.name ||
                            currentProduct.quantity <= 0
                          ) {
                            showError("Product name and quantity are required");
                            return;
                          }
                          const updatedProducts = [
                            ...form.getValues().products,
                            currentProduct,
                          ];
                          form.setValue("products", updatedProducts);
                          setCurrentProduct({ ...emptyProduct });
                        }}
                        className="flex items-center gap-1"
                      >
                        <Plus className="h-4 w-4" /> Add Product
                      </Button>
                    </div>
                  </div>

                  {/* Product List Table */}
                  {form.getValues().products.length > 0 && (
                    <div className="border rounded-md">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Name</TableHead>
                            <TableHead>Quantity</TableHead>
                            <TableHead>Unit</TableHead>
                            <TableHead>Rate (₹)</TableHead>
                            <TableHead>Amount (₹)</TableHead>
                            <TableHead>Discount (%)</TableHead>
                            <TableHead>GST (%)</TableHead>
                            <TableHead>Total (₹)</TableHead>
                            <TableHead>Actions</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {form.getValues().products.map((product, index) => {
                            const amount = product.quantity * product.rate;
                            const discountAmount =
                              amount * (product.discountRate / 100);
                            const afterDiscount = amount - discountAmount;
                            const gstAmount =
                              afterDiscount * (product.gstRate / 100);
                            const total = afterDiscount + gstAmount;

                            return (
                              <TableRow key={index}>
                                <TableCell>{product.name}</TableCell>
                                <TableCell>{product.quantity}</TableCell>
                                <TableCell>{product.unit}</TableCell>
                                <TableCell>{product.rate.toFixed(2)}</TableCell>
                                <TableCell>{amount.toFixed(2)}</TableCell>
                                <TableCell>
                                  {product.discountRate > 0
                                    ? `${
                                        product.discountRate
                                      }% (${discountAmount.toFixed(2)})`
                                    : "0%"}
                                </TableCell>
                                <TableCell>
                                  {product.gstRate > 0
                                    ? `${product.gstRate}% (${gstAmount.toFixed(
                                        2
                                      )})`
                                    : "0%"}
                                </TableCell>
                                <TableCell className="font-medium">
                                  {total.toFixed(2)}
                                </TableCell>
                                <TableCell>
                                  <CustomAlertDialog
                                    trigger={<Trash2 className="h-4 w-4 cursor-pointer" />}
                                    func={() => {
                                      const updatedProducts = form
                                        .getValues()
                                        .products.filter((_, i) => i !== index);
                                      form.setValue("products", updatedProducts);
                                    }}
                                    className="bg-red-700 hover:bg-red-800 cursor-pointer text-white"
                                  />
                                </TableCell>
                              </TableRow>
                            );
                          })}
                          <TableRow>
                            <TableCell
                              colSpan={4}
                              className="text-right font-medium"
                            >
                              Total:
                            </TableCell>
                            <TableCell className="font-medium">
                              {form
                                .getValues()
                                .products.reduce(
                                  (sum, product) =>
                                    sum + product.quantity * product.rate,
                                  0
                                )
                                .toFixed(2)}
                            </TableCell>
                            <TableCell className="font-medium">
                              {form
                                .getValues()
                                .products.reduce((sum, product) => {
                                  const amount =
                                    product.quantity * product.rate;
                                  return (
                                    sum + (amount * product.discountRate) / 100
                                  );
                                }, 0)
                                .toFixed(2)}
                            </TableCell>
                            <TableCell className="font-medium">
                              {form
                                .getValues()
                                .products.reduce((sum, product) => {
                                  const amount =
                                    product.quantity * product.rate;
                                  const discountAmount =
                                    amount * (product.discountRate / 100);
                                  const afterDiscount = amount - discountAmount;
                                  return (
                                    sum +
                                    (afterDiscount * product.gstRate) / 100
                                  );
                                }, 0)
                                .toFixed(2)}
                            </TableCell>
                            <TableCell className="font-medium">
                              {form
                                .getValues()
                                .products.reduce((sum, product) => {
                                  const amount =
                                    product.quantity * product.rate;
                                  const discountAmount =
                                    amount * (product.discountRate / 100);
                                  const afterDiscount = amount - discountAmount;
                                  const gstAmount =
                                    afterDiscount * (product.gstRate / 100);
                                  return sum + afterDiscount + gstAmount;
                                }, 0)
                                .toFixed(2)}
                            </TableCell>
                          </TableRow>
                        </TableBody>
                      </Table>
                    </div>
                  )}
                </div>

                <div className="flex flex-col sm:flex-row gap-4 justify-end">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={goBack}
                    className="cursor-pointer"
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    disabled={isLoading}
                    className="cursor-pointer"
                  >
                    Create Sale
                  </Button>
                </div>
              </form>
            </Form>
          </CardContent>
        </Card>

        {/* Invoice Summary Card */}
        <div className="sticky top-6 self-start">
          <InvoiceSummary form={form} />
        </div>
      </div>
    </div>
  );
}
