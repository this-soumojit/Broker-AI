import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { ArrowLeft, Plus } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Form } from "@/components/ui/form";
import { useToast } from "@/hooks/use-toast";
import PageLoader from "@/components/page-loader";
import { saleFormSchema } from "@/schemas";
import { getSaleById, updateSale } from "@/services/sale";
import { getClients } from "@/services/client";
import { IClient } from "@/interfaces";

import {
  getProducts,
  addProducts,
  updateProduct,
  deleteProduct,
} from "@/services/product";

import InvoiceWithProductSummary from "@/components/invoice-summary";
import AppendProduct from "@/components/append-product";
import SaleInfo from "@/components/sale-info";

type Product = {
  id?: string;
  name: string;
  quantity: number;
  unit: string;
  rate: number;
  gstRate: number;
  discountRate: number;
  notes?: string;
};

type SaleFormValues = {
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
  commissionRate: 0,
  invoiceDueDays: 0,
  status: "PENDING",
  sellerId: "",
  buyerId: "",
  notes: "",
  products: [],
};

const emptyProduct: Product = {
  id: undefined,
  name: "",
  quantity: 0,
  unit: "",
  rate: 0,
  gstRate: 0,
  discountRate: 0,
  notes: "",
};

export default function EditSalePage() {
  const [isLoading, setIsLoading] = useState(false);
  const [clients, setClients] = useState<IClient[]>([]);
  const [allProducts, setAllProducts] = useState<Product[]>([]);

  const { showSuccess, showError } = useToast();
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

  const appendProductAdd = () => {
    // If no products exist, just add a new one
    if (allProducts.length === 0) {
      setAllProducts([emptyProduct]);
      return;
    }

    const lastProduct = allProducts[allProducts.length - 1];

    if (!lastProduct.name.trim() && lastProduct.quantity <= 0) {
      showError("Product name and quantity are required");
      return;
    }
    setAllProducts([...allProducts, emptyProduct]);
  };

  const removeProduct = async (id: string | undefined) => {
    if (userId && bookId && saleId && id) {
      await deleteProduct(userId, bookId, saleId, id);
      setAllProducts((pro) => pro.filter((p) => p.id !== id));
      showSuccess("Product Deleted Successfully!");
    }
  };

  useEffect(() => {
    loadClients();
    loadProducts();
    if (userId && bookId && saleId) {
      loadSale();
    }
  }, [userId, bookId, saleId]);

  // Sync allProducts with form products for calculations
  useEffect(() => {
    form.setValue("products", allProducts);
  }, [allProducts, form]);

  // Add automatic calculations for invoice amounts based on products
  useEffect(() => {
    if (allProducts.length > 0) {
      // Calculate total gross amount (before discount and tax)
      const grossAmount = allProducts.reduce((sum, product) => {
        return sum + product.quantity * product.rate;
      }, 0);

      // Calculate total discount amount
      const discountAmount = allProducts.reduce((sum, product) => {
        const amount = product.quantity * product.rate;
        return sum + (amount * product.discountRate) / 100;
      }, 0);

      // Calculate total tax amount
      const taxAmount = allProducts.reduce((sum, product) => {
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
  }, [allProducts, form]);

  const onSubmit = async (data: SaleFormValues) => {
    if (!userId || !bookId || !saleId) return;

    setIsLoading(true);

    try {
      // Sync allProducts with form products field
      const updatedData = {
        ...data,
        products: allProducts,
      };

      await updateSale(userId, bookId, saleId, {
        ...updatedData,
        lorryReceiptDate:
          updatedData.lorryReceiptDate instanceof Date
            ? updatedData.lorryReceiptDate.toISOString()
            : updatedData.lorryReceiptDate,
        challanDate:
          updatedData.challanDate instanceof Date
            ? updatedData.challanDate.toISOString()
            : updatedData.challanDate,
        invoiceDate:
          updatedData.invoiceDate instanceof Date
            ? updatedData.invoiceDate.toISOString()
            : updatedData.invoiceDate,
        eWayBillDate:
          updatedData.eWayBillDate instanceof Date
            ? updatedData.eWayBillDate.toISOString()
            : updatedData.eWayBillDate,
        invoiceGrossAmount: updatedData.invoiceGrossAmount,
        invoiceDiscountAmount: updatedData.invoiceDiscountAmount,
        invoiceTaxAmount: updatedData.invoiceTaxAmount,
        invoiceNetAmount: updatedData.invoiceNetAmount,
        commissionRate: updatedData.commissionRate,
        invoiceDueDays: updatedData.invoiceDueDays,
        sellerId: updatedData.sellerId,
        buyerId: updatedData.buyerId,
        notes: updatedData.notes || "",
        status: updatedData.status,
        products: updatedData.products,
      });

      if (allProducts && allProducts.length > 0) {
        for (const product of allProducts) {
          if (!product.id) {
            await addProducts(userId, bookId, saleId, product);
            console.log("New Product Added");
          } else {
            await updateProduct(userId, bookId, saleId, product.id, {
              name: product.name,
              quantity: product.quantity,
              unit: product.unit,
              rate: product.rate,
              gstRate: product.gstRate,
              discountRate: product.discountRate,
              notes: product.notes,
            });
            console.log("Product Updated!!");
          }
        }
      }
      
      showSuccess("Sale updated successfully");
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
          <h1 className="text-3xl font-bold tracking-tight">Edit Sale</h1>
          <p className="text-muted-foreground">Edit the details of your sale</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 items-start gap-6">
        <Card className="col-span-1 lg:col-span-2 shadow-sm">
          <CardHeader>
            <CardTitle>Sale Information</CardTitle>
            <CardDescription>Edit the details for your sale</CardDescription>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form
                onSubmit={form.handleSubmit(onSubmit)}
                className="space-y-6"
              >
                <SaleInfo form={form} clients={clients} />

                {/* Products Section */}
                <div className="space-y-4">
                  {allProducts.map((item, index) => {
                    return (
                      <AppendProduct
                        key={item.id}
                        item={item}
                        index={index}
                        setAllProducts={setAllProducts}
                        removeProduct={removeProduct}
                      />
                    );
                  })}
                </div>

                <div className="flex justify-end">
                  <Button
                    type="button"
                    onClick={appendProductAdd}
                    className="flex items-center gap-1"
                  >
                    <Plus className="h-4 w-4" /> Add Product
                  </Button>
                </div>

                <div className="flex flex-col sm:flex-row gap-4 justify-between">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={goBack}
                    className="cursor-pointer"
                  >
                    Cancel
                  </Button>
                  <div className="flex gap-2">
                    <Button
                      type="submit"
                      disabled={isLoading}
                      className="cursor-pointer"
                    >
                      Update Sale
                    </Button>
                  </div>
                </div>
              </form>
            </Form>
          </CardContent>
        </Card>

        {/* Invoice Summary Card */}
        <div className="sticky top-0 fit-content">
          <InvoiceWithProductSummary form={form} allProducts={allProducts} />
        </div>
      </div>
    </div>
  );
}
