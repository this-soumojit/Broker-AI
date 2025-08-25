import { FormField, FormItem, FormLabel, FormControl, FormMessage } from "../ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";
import { Input } from "../ui/input";
import { Textarea } from "../ui/textarea";
import { Button } from "../ui/button";
import { Calendar } from "../ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "../ui/popover";
import { CalendarIcon } from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { SaleFormValues } from "@/pages/app/sale/view-sale";
import type { UseFormReturn } from "react-hook-form";
import { IClient } from "@/interfaces";

const SaleInfo = ({ form, clients }: {form: UseFormReturn<SaleFormValues>, clients: IClient[]}) => {
    const sellerId = form.watch("sellerId");
    const buyerId = form.watch("buyerId");

    return (
        <>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <FormField
                control={form.control}
                name="sellerId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Seller <span className="text-red-500">*</span></FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                      value={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select a seller" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {clients
                          .filter((client) => client.id !== buyerId)
                          .map((client) => (
                            <SelectItem key={client.id} value={client.id!}>
                              {client.name}
                            </SelectItem>
                          ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="buyerId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Buyer <span className="text-red-500">*</span></FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                      value={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select a buyer" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {clients
                          .filter((client) => client.id !== sellerId)
                          .map((client) => (
                            <SelectItem key={client.id} value={client.id!}>
                              {client.name}
                            </SelectItem>
                          ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="lorryReceiptNumber"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Lorry Receipt Number<span className="text-red-500">*</span></FormLabel>
                  <FormControl>
                    <Input placeholder="Lorry Receipt Number" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <FormField
                control={form.control}
                name="lorryReceiptDate"
                render={({ field }) => (
                  <FormItem className="flex flex-col">
                    <FormLabel>Lorry Receipt Date <span className="text-muted-foreground">(Optional)</span></FormLabel>
                    <Popover>
                      <PopoverTrigger asChild>
                        <FormControl>
                          <Button
                            variant={"outline"}
                            className={cn(
                              "w-full pl-3 text-left font-normal",
                              !field.value && "text-muted-foreground"
                            )}
                          >
                            {field.value ? (
                              format(field.value, "PPP")
                            ) : (
                              <span>Pick a date</span>
                            )}
                            <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                          </Button>
                        </FormControl>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="single"
                          selected={
                            field.value instanceof Date
                              ? field.value
                              : new Date(field.value || "")
                          }
                          onSelect={field.onChange}
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="caseNumber"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Case Number<span className="text-red-500">*</span></FormLabel>
                    <FormControl>
                      <Input placeholder="Case Number" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <FormField
                control={form.control}
                name="weight"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Weight (kg) <span className="text-muted-foreground">(Optional)</span></FormLabel>
                    <FormControl>
                      <Input type="number" min={0} step="0.01" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="freight"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Freight (₹) <span className="text-muted-foreground">(Optional)</span></FormLabel>
                    <FormControl>
                      <Input type="number" min={0} step="0.01" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <FormField
                control={form.control}
                name="transportName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Transport Name <span className="text-red-500">*</span></FormLabel>
                    <FormControl>
                      <Input placeholder="Transport Name" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="transportNumber"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Transport Number <span className="text-red-500">*</span></FormLabel>
                    <FormControl>
                      <Input placeholder="Transport Number" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="transportStation"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Transport Station <span className="text-red-500">*</span></FormLabel>
                    <FormControl>
                      <Input placeholder="Transport Station" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <FormField
                control={form.control}
                name="eWayBillNumber"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>E-Way Bill Number<span className="text-red-500">*</span></FormLabel>
                    <FormControl>
                      <Input placeholder="E-Way Bill Number" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="eWayBillDate"
                render={({ field }) => (
                  <FormItem className="flex flex-col">
                    <FormLabel>E-Way Bill Date <span className="text-muted-foreground">(Optional)</span></FormLabel>
                    <Popover>
                      <PopoverTrigger asChild>
                        <FormControl>
                          <Button
                            variant={"outline"}
                            className={cn(
                              "w-full pl-3 text-left font-normal",
                              !field.value && "text-muted-foreground"
                            )}
                          >
                            {field.value ? (
                              format(field.value, "PPP")
                            ) : (
                              <span>Pick a date</span>
                            )}
                            <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                          </Button>
                        </FormControl>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="single"
                          selected={
                            field.value instanceof Date
                              ? field.value
                              : new Date(field.value || "")
                          }
                          onSelect={field.onChange}
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <FormField
                control={form.control}
                name="challanNumber"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Challan Number<span className="text-red-500">*</span></FormLabel>
                    <FormControl>
                      <Input placeholder="Challan Number" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="challanDate"
                render={({ field }) => (
                  <FormItem className="flex flex-col">
                    <FormLabel>Challan Date <span className="text-muted-foreground">(Optional)</span></FormLabel>
                    <Popover>
                      <PopoverTrigger asChild>
                        <FormControl>
                          <Button
                            variant={"outline"}
                            className={cn(
                              "w-full pl-3 text-left font-normal",
                              !field.value && "text-muted-foreground"
                            )}
                          >
                            {field.value ? (
                              format(field.value, "PPP")
                            ) : (
                              <span>Pick a date</span>
                            )}
                            <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                          </Button>
                        </FormControl>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="single"
                          selected={
                            field.value instanceof Date
                              ? field.value
                              : new Date(field.value || "")
                          }
                          onSelect={field.onChange}
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <FormField
                control={form.control}
                name="invoiceNumber"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Invoice Number<span className="text-red-500">*</span></FormLabel>
                    <FormControl>
                      <Input placeholder="Invoice Number" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="invoiceDate"
                render={({ field }) => (
                  <FormItem className="flex flex-col">
                    <FormLabel>Invoice Date<span className="text-red-500">*</span></FormLabel>
                    <Popover>
                      <PopoverTrigger asChild>
                        <FormControl>
                          <Button
                            variant={"outline"}
                            className={cn(
                              "w-full pl-3 text-left font-normal",
                              !field.value && "text-muted-foreground"
                            )}
                          >
                            {field.value ? (
                              format(field.value, "PPP")
                            ) : (
                              <span>Pick a date</span>
                            )}
                            <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                          </Button>
                        </FormControl>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="single"
                          selected={
                            field.value instanceof Date
                              ? field.value
                              : new Date(field.value || "")
                          }
                          onSelect={field.onChange}
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <FormField
                control={form.control}
                name="commissionRate"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Commission Rate (%)<span className="text-red-500">*</span></FormLabel>
                    <FormControl>
                      <Input type="number" min={0} step="0.01" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="invoiceDueDays"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Invoice Due Days<span className="text-red-500">*</span></FormLabel>
                    <FormControl>
                      <Input type="number" min={0} step="1" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="status"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Status<span className="text-red-500">*</span></FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                    value={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select status" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="PENDING">Pending</SelectItem>
                      <SelectItem value="PARTIALLY_PAID">
                        Partially Paid
                      </SelectItem>
                      <SelectItem value="PAID">Paid</SelectItem>
                      <SelectItem value="OVERDUE">Overdue</SelectItem>
                    </SelectContent>
                  </Select>
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
                    <Textarea placeholder="Additional notes" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
        </>
    )
}

export default SaleInfo;