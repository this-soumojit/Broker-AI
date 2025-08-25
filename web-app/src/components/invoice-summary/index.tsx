import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import type { Product, SaleFormValues } from "@/pages/app/sale/view-sale";
import { format } from "date-fns";
import type { UseFormReturn } from "react-hook-form";

const InvoiceWithProductSummary = ({
    form,
    allProducts = [],
}: {
    form: UseFormReturn<SaleFormValues>;
    allProducts: Product[];
}) => {
    return (
        <Card className="col-span-1 shadow-sm">
            <CardHeader>
                <CardTitle>Invoice Summary</CardTitle>
                <CardDescription>Real-time invoice preview</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
                <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Invoice Number:</span>
                        <span className="font-medium">
                            {form.watch("invoiceNumber") || "N/A"}
                        </span>
                    </div>
                    <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Date:</span>
                        <span className="font-medium">
                            {form.watch("invoiceDate")
                                ? format(new Date(form.watch("invoiceDate")), "dd/MM/yyyy")
                                : "N/A"}
                        </span>
                    </div>
                    <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Due Date:</span>
                        <span className="font-medium">
                            {form.watch("invoiceDate") && form.watch("invoiceDueDays")
                                ? format(
                                        new Date(
                                            new Date(form.watch("invoiceDate")).getTime() +
                                                form.watch("invoiceDueDays") * 24 * 60 * 60 * 1000
                                        ),
                                        "dd/MM/yyyy"
                                    )
                                : "N/A"}
                        </span>
                    </div>
                    <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Status:</span>
                        <span className="font-medium">
                            {form.watch("status") === "PENDING" && (
                                <span className="text-yellow-500">Pending</span>
                            )}
                            {form.watch("status") === "PARTIALLY_PAID" && (
                                <span className="text-blue-500">Partially Paid</span>
                            )}
                            {form.watch("status") === "PAID" && (
                                <span className="text-green-500">Paid</span>
                            )}
                            {form.watch("status") === "OVERDUE" && (
                                <span className="text-red-500">Overdue</span>
                            )}
                        </span>
                    </div>
                </div>

                <div className="border-t pt-4">
                    <h4 className="font-medium mb-2">Products</h4>
                    {allProducts.length > 0 ? (
                        <div className="space-y-3">
                            {allProducts.map((product, index) => {
                                const amount = product.quantity * product.rate;
                                const discountAmount =
                                    amount * (product.discountRate / 100);
                                const afterDiscount = amount - discountAmount;
                                const gstAmount = afterDiscount * (product.gstRate / 100);
                                const total = afterDiscount + gstAmount;

                                return (
                                    <div key={index} className="border-b pb-2">
                                        <div className="flex justify-between">
                                            <span className="font-medium">{product.name}</span>
                                            <span>₹{total.toFixed(2)}</span>
                                        </div>
                                        <div className="text-xs text-muted-foreground">
                                            {product.quantity} {product.unit} × ₹
                                            {product.rate.toFixed(2)}
                                            {product.discountRate > 0 &&
                                                ` (-${product.discountRate}%)`}
                                            {product.gstRate > 0 && ` (+${product.gstRate}% GST)`}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    ) : (
                        <div className="text-sm text-muted-foreground italic">
                            No products added
                        </div>
                    )}
                </div>

                <div className="border-t pt-4 space-y-2">
                    <div className="flex justify-between">
                        <span className="text-muted-foreground">Gross Amount:</span>
                        <span>
                            ₹{(form.watch("invoiceGrossAmount") || 0).toFixed(2)}
                        </span>
                    </div>
                    <div className="flex justify-between">
                        <span className="text-muted-foreground">Discount Amount:</span>
                        <span>
                            ₹{(form.watch("invoiceDiscountAmount") || 0).toFixed(2)}
                        </span>
                    </div>
                    <div className="flex justify-between">
                        <span className="text-muted-foreground">Tax Amount:</span>
                        <span>
                            ₹{(form.watch("invoiceTaxAmount") || 0).toFixed(2)}
                        </span>
                    </div>
                    <div className="flex justify-between font-medium text-lg pt-2 border-t">
                        <span>Net Amount:</span>
                        <span>
                            ₹{(form.watch("invoiceNetAmount") || 0).toFixed(2)}
                        </span>
                    </div>
                </div>

                <div className="border-t pt-4">
                    <div className="bg-muted p-4 rounded-lg">
                        <div className="flex justify-between items-center">
                            <span className="text-sm font-medium">
                                Commission ({form.watch("commissionRate") || 0}%):
                            </span>
                            <span>
                                ₹
                                {(
                                    ((form.watch("commissionRate") || 0) / 100) *
                                    (form.watch("invoiceNetAmount") || 0)
                                ).toFixed(2)}
                            </span>
                        </div>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
};

export const InvoiceSummary = ({form}: {form: UseFormReturn<SaleFormValues>}) => {
    return (
        <Card className="col-span-1 shadow-sm">
          <CardHeader>
            <CardTitle>Invoice Summary</CardTitle>
            <CardDescription>Real-time invoice preview</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Invoice Number:</span>
                <span className="font-medium">
                  {form.watch("invoiceNumber") || "N/A"}
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Date:</span>
                <span className="font-medium">
                  {form.watch("invoiceDate")
                    ? format(new Date(form.watch("invoiceDate")), "dd/MM/yyyy")
                    : "N/A"}
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Due Date:</span>
                <span className="font-medium">
                  {form.watch("invoiceDate") && form.watch("invoiceDueDays")
                    ? format(
                        new Date(
                          new Date(form.watch("invoiceDate")).getTime() +
                            form.watch("invoiceDueDays") * 24 * 60 * 60 * 1000
                        ),
                        "dd/MM/yyyy"
                      )
                    : "N/A"}
                </span>
              </div>
            </div>

            <div className="border-t pt-4">
              <h4 className="font-medium mb-2">Products</h4>
              {form.watch("products").length > 0 ? (
                <div className="space-y-3">
                  {form.watch("products").map((product, index) => {
                    const amount = product.quantity * product.rate;
                    const discountAmount =
                      amount * (product.discountRate / 100);
                    const afterDiscount = amount - discountAmount;
                    const gstAmount = afterDiscount * (product.gstRate / 100);
                    const total = afterDiscount + gstAmount;

                    return (
                      <div key={index} className="border-b pb-2">
                        <div className="flex justify-between">
                          <span className="font-medium">{product.name}</span>
                          <span>₹{total.toFixed(2)}</span>
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {product.quantity} {product.unit} × ₹
                          {product.rate.toFixed(2)}
                          {product.discountRate > 0 &&
                            ` (-${product.discountRate}%)`}
                          {product.gstRate > 0 && ` (+${product.gstRate}% GST)`}
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="text-sm text-muted-foreground italic">
                  No products added
                </div>
              )}
            </div>

            <div className="border-t pt-4 space-y-2">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Gross Amount:</span>
                <span>
                  ₹{(form.watch("invoiceGrossAmount") || 0).toFixed(2)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Discount Amount:</span>
                <span>
                  ₹{(form.watch("invoiceDiscountAmount") || 0).toFixed(2)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Tax Amount:</span>
                <span>
                  ₹{(form.watch("invoiceTaxAmount") || 0).toFixed(2)}
                </span>
              </div>
              <div className="flex justify-between font-medium text-lg pt-2 border-t">
                <span>Net Amount:</span>
                <span>
                  ₹{(form.watch("invoiceNetAmount") || 0).toFixed(2)}
                </span>
              </div>
            </div>

            <div className="border-t pt-4">
              <div className="bg-muted p-4 rounded-lg">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium">
                    Commission ({form.watch("commissionRate") || 0}%):
                  </span>
                  <span>
                    ₹
                    {(
                      ((form.watch("commissionRate") || 0) / 100) *
                      (form.watch("invoiceNetAmount") || 0)
                    ).toFixed(2)}
                  </span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
    );
};

export default InvoiceWithProductSummary;