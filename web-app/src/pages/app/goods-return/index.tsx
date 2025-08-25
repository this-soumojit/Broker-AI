import { useEffect, useState, useCallback } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { ArrowLeftIcon, TrashIcon } from "lucide-react";
import { format } from "date-fns";
import PageLoader from "@/components/page-loader";
import { useToast } from "@/hooks/use-toast";
import { useNavigate, useParams } from "react-router-dom";
import { createGoodsReturn } from "@/services/goods-return";
import { getSaleById } from "@/services/sale";
import { getProducts, updateProduct } from "@/services/product";
import { IGoodsReturn, ISale, ISaleProduct } from "@/interfaces";
import { addGoodsReturnProducts } from "@/services/goods-return-product";

interface ReturnFormData {
  saleId: string;
  notes: string;
  products: Array<{
    id: string;
    productName: string;
    quantity: number;
    maxQuantity: number;
    unit: string;
    rate: number;
  }>;
}

function GoodsReturnPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [isFormLoading, setIsFormLoading] = useState(false);
  const [sales, setSales] = useState<ISale | null>(null);
  const [selectedSaleProducts, setSelectedSaleProducts] = useState<ISaleProduct[]>([]);
  const [formData, setFormData] = useState<ReturnFormData>({
    saleId: "",
    notes: "",
    products: [],
  });
  const { showError, showSuccess } = useToast();
  const { userId, bookId, saleId } = useParams();
  const navigate = useNavigate();

  const loadSaleProducts = useCallback(async (selectedSaleId: string) => {
    try {
      const { data: productsData } = await getProducts(userId!, bookId!, selectedSaleId);
      setSelectedSaleProducts(productsData);
      setFormData(prevFormData => ({
        ...prevFormData,
        saleId: selectedSaleId,
        products: productsData.map((product: ISaleProduct) => ({
          id: product.id,
          productName: product.name,
          quantity: 0,
          maxQuantity: product.quantity,
          unit: product.unit,
          rate: product.rate,
        })),
      }));
    } catch (error) {
      showError(error);
    }
  }, [userId, bookId]);

  const loadSales = useCallback(async () => {
    if (!userId || !bookId || !saleId) return;
    setIsLoading(true);
    try {
      const { data } = await getSaleById(userId, bookId, saleId);
      setSales(data);
      console.log("Sale data loaded:", data);
      
      // Load products for this sale
      loadSaleProducts(saleId);
    } catch (error) {
      showError(error);
    } finally {
      setIsLoading(false);
    }
  }, [userId, bookId, saleId]);

  const removeProductFromReturn = (productName: string) => {
    setFormData({
      ...formData,
      products: formData.products.map(product =>
        product.productName === productName
          ? { ...product, quantity: 0 }
          : product
      ),
    });
  };

  const handleSubmit = async () => {
    if (!userId || !bookId || !saleId) return;

    const selectedProducts = formData.products.filter(p => p.quantity > 0);
    if (selectedProducts.length === 0) {
      showError("Please select at least one product to return");
      return;
    }

    setIsFormLoading(true);
    try {
      const goodsReturnPayload: IGoodsReturn = {
        saleId: formData.saleId,
        notes: formData.notes,
        grossAmount: 0, // This should be calculated based on products
        discountAmount: 0,
        taxAmount: 0,
        netAmount: 0,
        products: selectedProducts.map(p => ({
          productId: p.id,
          productName: p.productName,
          quantity: p.quantity,
        })),
      };

      const sendGoodsReturn = await createGoodsReturn(userId, bookId, saleId, goodsReturnPayload);
      console.log("Goods return created:", sendGoodsReturn);
      console.log("Goods return payload:", goodsReturnPayload);

      if (goodsReturnPayload.products && goodsReturnPayload.products.length > 0) {
        const goodsReturnId = sendGoodsReturn.data?.id;
        if (!goodsReturnId) {
          showError("Failed to get Goods Return ID from response");
          return;
        }
        for (const product of goodsReturnPayload.products) {
          // Add goods return product
          const getProduct = await addGoodsReturnProducts(userId, bookId, saleId, goodsReturnId, {
            productId: product?.productId,
            productName: product?.productName,
            quantity: product?.quantity
          });

          console.log("Goods return product added:", getProduct);

          // Update the original product quantity by subtracting the returned quantity
          const originalProduct = selectedSaleProducts.find(sp => sp.id === product.productId);
          if (originalProduct && product.productId) {
            const updatedQuantity = originalProduct.quantity - (product.quantity || 0);
            
            // Only send the fields that need to be updated - let backend calculate amounts
            const updatedProductPayload = {
              name: originalProduct.name,
              quantity: Math.max(0, updatedQuantity), // Ensure quantity doesn't go below 0
              unit: originalProduct.unit,
              rate: originalProduct.rate,
              gstRate: originalProduct.gstRate,
              discountRate: originalProduct.discountRate,
              notes: originalProduct.notes || "",
            };

            console.log("Updating product:", product.productId);
            console.log("Original quantity:", originalProduct.quantity);
            console.log("Return quantity:", product.quantity);
            console.log("Updated quantity:", updatedQuantity);
            console.log("Update payload:", updatedProductPayload);

            try {
              const updateResult = await updateProduct(userId, bookId, saleId, product.productId, updatedProductPayload);
              console.log(`Product ${originalProduct.name} updated successfully:`, updateResult);
            } catch (updateError) {
              console.error(`Failed to update product ${originalProduct.name}:`, updateError);
              throw updateError; // Re-throw to be caught by the main try-catch
            }
          }
        }
      }

      showSuccess("Goods return created successfully");
      navigate(`/${userId}/books/${bookId}/sales/${saleId}/view`);
    } catch (error) {
      showError(error);
    } finally {
      setIsFormLoading(false);
    }
  };

  const handleGoBack = () => {
    navigate(`/${userId}/books/${bookId}/sales/${saleId}/view`);
  };

  useEffect(() => {
    if (userId && bookId) {
      loadSales();
    }
  }, [userId, bookId, loadSales]);

  return (
    <div className="container mx-auto py-6 space-y-6">
      <PageLoader isLoading={isLoading} />
      
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="outline" size="icon" onClick={handleGoBack}>
          <ArrowLeftIcon className="h-4 w-4" />
        </Button>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Create Goods Return</h1>
          <p className="text-muted-foreground">Select products to return from a sale and specify quantities</p>
        </div>
      </div>

      {/* Form */}
      <div className="max-w-4xl">
        <Card>
          <CardHeader>
            <CardTitle>Return Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Sale Selection */}
            <div className="space-y-2">
              <Label htmlFor="sale">Select Sale</Label>
              {sales ? (
                <div className="flex items-center gap-4">
                  <span className="font-medium">Sale Invoice:</span>
                  <p>
                    {`#${sales.invoiceNumber} - ${format(new Date(sales.invoiceDate), "dd/MM/yyyy")}`}
                  </p>
                </div>
              ) : (
                <p className="text-muted-foreground">No sale found.</p>
              )}
            </div>

            {/* Products Selection */}
            {selectedSaleProducts.length > 0 && formData.saleId && (
              <div className="space-y-4">
                <Label>Select Products to Return</Label>
                <Card>
                  <CardContent className="p-4">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Product Name</TableHead>
                          <TableHead>Unit</TableHead>
                          <TableHead>Available Qty</TableHead>
                          <TableHead>Return Qty</TableHead>
                          <TableHead>Action</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {formData.products.map((product, index) => (
                          <TableRow key={index}>
                            <TableCell className="font-medium">
                              {product.productName}
                            </TableCell>
                            <TableCell>{product.unit}</TableCell>
                            <TableCell>{product.maxQuantity}</TableCell>
                            <TableCell>
                              <Input
                                type="number"
                                min="0"
                                max={product.maxQuantity}
                                value={product.quantity}
                                onChange={(e) =>
                                  setFormData({
                                    ...formData,
                                    products: formData.products.map((p, i) =>
                                      i === index
                                        ? { ...p, quantity: Math.min(Number(e.target.value), product.maxQuantity) }
                                        : p
                                    ),
                                  })
                                }
                                className="w-24"
                              />
                            </TableCell>
                            <TableCell>
                              {product.quantity > 0 ? (
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => removeProductFromReturn(product.productName)}
                                >
                                  <TrashIcon className="h-4 w-4" />
                                </Button>
                              ) : (
                                <span className="text-muted-foreground text-sm">
                                  Not selected
                                </span>
                              )}
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </CardContent>
                </Card>
              </div>
            )}

            {/* Notes */}
            <div className="space-y-2">
              <Label htmlFor="notes">Notes <span className="text-muted-foreground">(Optional)</span></Label>
              <Textarea
                id="notes"
                placeholder="Add any notes about this return..."
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                rows={3}
                required
              />
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3 pt-4">
              <Button variant="outline" onClick={handleGoBack}>
                Cancel
              </Button>
              <Button 
                onClick={handleSubmit} 
                disabled={isFormLoading || !formData.saleId || formData.products.filter(p => p.quantity > 0).length === 0}
              >
                {isFormLoading ? "Creating..." : "Create Return"}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

export default GoodsReturnPage;