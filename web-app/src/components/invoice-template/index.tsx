import React from 'react';
import { IProduct, ISale, IClient } from "@/interfaces";
import type { Product, GoodReturnProduct, TGoodReturn } from "@/pages/app/sale/sale-invoice"
import { TSalePayments } from "@/pages/app/sale/sale-invoice"

// Extend IProduct for additional properties needed in template
export interface ITemplateProduct extends IProduct {
    amount: number;
    pendingQuantity?: number;
    originalQuantity?: number;
    returnedQuantity?: number;
}

export interface IReturnProduct {
    id: string;
    quantity: number;
    amount: number;
    Product: IProduct;
}

interface InvoiceTemplateProps {
    contentRef: React.RefObject<HTMLDivElement>;
    user: {
        name?: string;
        email?: string;
        phone?: string;
    };
    saleData: ISale;
    buyerData?: IClient | null;
    sellerData?: IClient | null;
    productData?: Product[];
    goodReturnProducts: GoodReturnProduct[][];
    goodReturnId?: TGoodReturn[];
    calculatePendingProducts: () => {
    originalQuantity: any;
    pendingQuantity: number;
    returnedQuantity: any;
    id?: string | undefined;
    name: string;
    quantity: number;
    unit: string;
    rate: number;
    gstRate: number;
    discountRate: number;
    notes?: string | undefined;
}[];
    salePayments: TSalePayments[];
};

export const InvoiceTemplate: React.FC<InvoiceTemplateProps> = ({ 
    contentRef, 
    user, 
    saleData, 
    buyerData, 
    sellerData,
    productData = [],
    goodReturnProducts = [],
    goodReturnId = [],
    calculatePendingProducts,
    salePayments = []
}) => {

    const pendingProducts = calculatePendingProducts();
    return (
        <div className="min-h-screen bg-gray-50 p-8 fixed -left-[9999px]">
        <div className="max-w-4xl mx-auto">
          {/* Content to be converted to PDF */}
          <div
            ref={contentRef}
            className="bg-white rounded-lg shadow-lg p-8 space-y-6"
            style={{ width: "794px", minHeight: "1123px" }}
          >
            {/* Document Header */}
            <div className="border-b border-gray-200 pb-3">
              <h2 className="text-2xl font-semibold text-gray-800">
                Sale Invoice
              </h2>
            </div>

        {/* Contact Information */}
        <div className="grid md:grid-cols-2 gap-6">
            <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-800 border-b border-gray-200 pb-2">
                Broker Information
            </h3>
            <div className="space-y-2">
                <div className="flex justify-between">
                <span className="text-gray-600">Name:</span>
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

              <div className="space-y-4">
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
            <div className="grid md:grid-cols-2 gap-6">
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

              <div className="space-y-4">
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
                    <span className="text-gray-800 font-medium">
                      {sellerData?.address ||
                        saleData?.seller?.address ||
                        "N/A"}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Sample Content */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-800 border-b border-gray-200 pb-2">
                Transport & Additional Details
              </h3>
              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-2">
                    <div className="flex justify-between">
                        <span className="text-gray-600">Lorry Receipt Number:</span>
                        <span className="text-gray-800 font-medium">{saleData?.lorryReceiptNumber || 'N/A'}</span>
                    </div>
                    <div className="flex justify-between">
                        <span className="text-gray-600">Transport Name:</span>
                        <span className="text-gray-800 font-medium">{saleData?.transportName || 'N/A'}</span>
                    </div>
                    <div className="flex justify-between">
                        <span className="text-gray-600">Transport Number:</span>
                        <span className="text-gray-800 font-medium">{saleData?.transportNumber || 'N/A'}</span>
                    </div>
                    <div className="flex justify-between">
                        <span className="text-gray-600">E-Way Bill Number:</span>
                        <span className="text-gray-800 font-medium">{saleData?.eWayBillNumber || 'N/A'}</span>
                    </div>
                </div>
                <div className="space-y-2">
                    <div className="flex justify-between">
                        <span className="text-gray-600">Case Number:</span>
                        <span className="text-gray-800 font-medium">{saleData?.caseNumber || 'N/A'}</span>
                    </div>
                    <div className="flex justify-between">
                        <span className="text-gray-600">Weight:</span>
                        <span className="text-gray-800 font-medium">{saleData?.weight ? `${saleData.weight} kg` : 'N/A'}</span>
                    </div>
                    <div className="flex justify-between">
                        <span className="text-gray-600">Freight:</span>
                        <span className="text-gray-800 font-medium">{saleData?.freight ? `₹${saleData.freight}` : 'N/A'}</span>
                    </div>
                    <div className="flex justify-between">
                        <span className="text-gray-600">Commission Rate:</span>
                        <span className="text-gray-800 font-medium">{saleData?.commissionRate ? `${saleData.commissionRate}%` : 'N/A'}</span>
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

                <div className="space-y-4">
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
              <div className="space-y-4">
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
                        <span className="text-lg font-semibold text-gray-800">
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
    )
}