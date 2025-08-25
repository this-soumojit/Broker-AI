import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { NoProductDataTable } from "../product-table";
import { TGoodReturn, GoodReturnProduct } from "@/pages/app/sale/view-sale";

const GoodReturnTable = ({ goodReturnId, goodReturnProducts }: { goodReturnId: TGoodReturn[]; goodReturnProducts: GoodReturnProduct[][] }) => {
    return (
    <div className="space-y-4">
        <Accordion type="multiple" className="w-full">
        {goodReturnId.length > 0 ? goodReturnId.map((goodReturn, index) => (
            <AccordionItem key={goodReturn.id} value={`item-${goodReturn.id}`}>
            <AccordionTrigger className="cursor-pointer">
                {goodReturn.notes || 'No note provided'}
            </AccordionTrigger>
            <AccordionContent>
                <div className="border rounded-md">
                {goodReturnProducts[index]?.length ? (
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
                        {goodReturnProducts[index].map((product, i) => {
                        const amount = product.quantity * product?.Product.rate;
                        const discountAmount =
                            amount * (product.Product.discountRate / 100);
                        const afterDiscount = amount - discountAmount;
                        const gstAmount =
                            afterDiscount * (product.Product.gstRate / 100);
                        const total = afterDiscount + gstAmount;

                        return (
                        <TableRow key={i}>
                            <TableCell>{product.Product.name}</TableCell>
                            <TableCell>{product.quantity}</TableCell>
                            <TableCell>{product.Product.unit}</TableCell>
                            <TableCell>{product.Product.rate.toFixed(2)}</TableCell>
                            
                            <TableCell>{amount.toFixed(2)}</TableCell>
                            <TableCell>
                                {product.Product.discountRate > 0
                                ? `${product.Product.discountRate}% (${discountAmount.toFixed(2)})`
                                : "0%"}
                            </TableCell>
                            <TableCell>
                                {product.Product.gstRate > 0
                                ? `${product.Product.gstRate}% (${gstAmount.toFixed(
                                    2
                                    )})`
                                : "0%"}
                            </TableCell>
                            <TableCell className="font-medium">
                                {total.toFixed(2)}
                            </TableCell>
                            </TableRow>
                        );
                        })}
                    </TableBody>
                    </Table>
                ) : (
                    <NoProductDataTable message="No Good Return Product Available." />
                )}
                </div>
            </AccordionContent>
            </AccordionItem>
        ))
        : (
            <NoProductDataTable message="No Good Returns Available" />
        )}
        </Accordion>
        </div>
    )
}

export default GoodReturnTable;