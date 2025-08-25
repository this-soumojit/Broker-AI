import type { Product } from "@/pages/app/sale/view-sale";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

const ProductTable = ({ allProducts }: {allProducts: Product[]}) => {
    return (
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
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {allProducts.map((product, index) => {
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
                            </TableRow>
                        );
                        }
                    )}
                </TableBody>
                </Table>
            </div>
    )
}

export const NoProductDataTable = ({ message }: { message: string }) => {
    return (
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
                    </TableRow>
                </TableHeader>
                <TableBody>
                <TableRow>
                    <TableCell colSpan={8} className="text-center text-muted-foreground">
                        {message}
                    </TableCell>
                    </TableRow>
                </TableBody>
            </Table>
        </div>
    )
}

export default ProductTable;