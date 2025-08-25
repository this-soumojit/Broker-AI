import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { format } from "date-fns";
import type { TSaleCommission, TSalePayments } from "@/pages/app/sale/view-sale";

const PaymentTable = ({ salePayments }: { salePayments: (TSalePayments | TSaleCommission)[] }) => {
    return (
        <div className="border rounded-md">
            <Table>
            <TableHeader>
                <TableRow>
                <TableHead>Invoice Number</TableHead>
                <TableHead>Payment Method</TableHead>
                <TableHead>Reference Number</TableHead>
                <TableHead>Amount (₹)</TableHead>
                <TableHead>Date</TableHead>
                </TableRow>
            </TableHeader>
            <TableBody>
                {salePayments.map((payment, index) => {
                const paymentWithDate = payment as TSalePayments & TSaleCommission & { createdAt?: string };
                return (
                    <TableRow key={index}>
                    <TableCell>
                        {"Sale" in payment && payment.Sale?.invoiceNumber
                            ? payment.Sale.invoiceNumber
                            : "invoiceNumber" in payment
                            ? payment.invoiceNumber
                            : ""}
                    </TableCell>
                    <TableCell>{payment.paymentMethod.replace(/_/g, " ")}</TableCell>
                    <TableCell>{payment.referenceNumber}</TableCell>
                    <TableCell>{payment.amount}</TableCell>
                    <TableCell>
                        {paymentWithDate.createdAt 
                            ? format(new Date(paymentWithDate.createdAt), "MMM dd, yyyy")
                            : ""}
                    </TableCell>
                    </TableRow>
                );
                })}
            </TableBody>
            </Table>
        </div>
    )
}

export const NoPaymentDataTable = ({ message }: { message: string }) => {
    return (
        <div className="border rounded-md">
        <Table>
        <TableHeader>
            <TableRow>
            <TableHead>Invoice Number</TableHead>
            <TableHead>Payment Method</TableHead>
            <TableHead>Reference Number</TableHead>
            <TableHead>Amount (₹)</TableHead>
            <TableHead>Date</TableHead>
            </TableRow>
        </TableHeader>
        <TableBody>
            <TableRow>
            <TableCell colSpan={5} className="text-center text-muted-foreground">
                {message}
            </TableCell>
            </TableRow>
        </TableBody>
        </Table>
        </div>
    )
}

export default PaymentTable;