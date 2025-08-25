import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { ArrowLeft } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardHeader,
} from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { salePaymentFormSchema } from "@/schemas";
import { addSalePayment } from "@/services/sale-payment";
import { addSaleCommission } from "@/services/sale-commission";

type SalePaymentFormValues = z.infer<typeof salePaymentFormSchema>;

const defaultValues: SalePaymentFormValues = {
  amount: 0,
  paymentMethod: "CASH",
  referenceNumber: "",
  notes: "",
};

export default function SalePaymentPage() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { showSuccess, showError } = useToast();
  const { userId, bookId, saleId } = useParams();
  const navigate = useNavigate();

  const form = useForm<SalePaymentFormValues>({
    resolver: zodResolver(salePaymentFormSchema),
    defaultValues,
  });


  // Handle form submission (add or update)
  const onSubmit = async (values: SalePaymentFormValues) => {
    if (!userId || !bookId || !saleId) return;
    setIsSubmitting(true);
    try {
      console.log("Form values:", values);
        console.log("Creating new payment");
        const { data: salePaymentDetail } = await addSalePayment(userId, bookId, saleId, values);
        if (salePaymentDetail.id) {
          await addSaleCommission(userId, bookId, saleId, salePaymentDetail.id, {
            amount: values.amount * 0.05,
            paymentMethod: values.paymentMethod,
            referenceNumber: values.referenceNumber,
            notes: values.notes,
          });
        }
        showSuccess("Payment added successfully");
        handleBack();
    } catch (error) {
      console.error("Submit error:", error);
      showError(error);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle back navigation
  const handleBack = () => {
    navigate(`/${userId}/books/${bookId}/sales/${saleId}/view`);
  };

  return (
    <div className="container mx-auto py-6 space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" title="Back" className="h-8 w-8 cursor-pointer" onClick={handleBack}>
          <ArrowLeft />
        </Button>
        <div className="flex-1">
          <h1 className="text-3xl font-bold tracking-tight">Sale Payments</h1>
          <p className="text-muted-foreground">
            Create a Sale Payment
          </p>
        </div>
      </div>

      {/* Payments List */}
      <Card className="shadow-sm sm:w-[400px]">
        <CardHeader className="bg-muted/50">
          <div>
                <Form {...form}>
                  <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                    <FormField
                      control={form.control}
                      name="amount"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Amount<span className="text-red-500">*</span></FormLabel>
                          <FormControl>
                            <Input
                              type="number"
                              step="0.01"
                              placeholder="Enter payment amount"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="paymentMethod"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Payment Method<span className="text-red-500">*</span></FormLabel>
                          <Select onValueChange={field.onChange} value={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select payment method" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="CASH">Cash</SelectItem>
                              <SelectItem value="BANK_TRANSFER">Bank Transfer</SelectItem>
                              <SelectItem value="CHEQUE">Cheque</SelectItem>
                              <SelectItem value="ONLINE_PAYMENT">Online Payment</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="referenceNumber"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Reference Number<span className="text-red-500">*</span></FormLabel>
                          <FormControl>
                            <Input
                              placeholder="Enter reference number"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="notes"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Notes <span className="text-muted-foreground">(Optional)</span></FormLabel>
                          <FormControl>
                            <Textarea
                              placeholder="Enter any additional notes"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <div className="flex justify-end gap-2">
                      <Button
                        type="button"
                        variant="outline"
                        onClick={handleBack}
                      >
                        Cancel
                      </Button>
                      <Button type="submit" disabled={isSubmitting}>
                        {isSubmitting
                          ? ""
                          : "Add Payment"}
                      </Button>
                    </div>
                  </form>
                </Form>
          </div>
        </CardHeader>
      </Card>
    </div>
  );
}
