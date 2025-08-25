import { FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { ClientFormValues } from "@/pages/app/clients/edit";
import { UseFormReturn } from "react-hook-form";
import countryCodeData from "@/assets/phone-country-code.json";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
const ClientInput = ({form}: {form: UseFormReturn<ClientFormValues>}) => {
    return (
        <>
        <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Client Name<span className="text-red-500">*</span></FormLabel>
                      <FormControl>
                        <Input placeholder="John Doe" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <FormField
                    control={form.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem className="flex flex-col">
                        <FormLabel>Email</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="john.doe@example.com"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <FormField
                    control={form.control}
                    name="phone"
                    render={({ field }) => (
                      <FormItem className="flex flex-col">
                        <FormLabel>Phone<span className="text-red-500">*</span></FormLabel>
                        <FormControl>
                          <div className="relative flex gap-2">
                            <FormField
                              control={form.control}
                              name="phoneCode"
                              render={({ field }) => (
                                <FormItem>
                                  <Select
                                    value={field.value}
                                    onValueChange={field.onChange}
                                  >
                                    <SelectTrigger className="w-[120px]">
                                      <SelectValue placeholder="+91" />
                                    </SelectTrigger>
                                    <SelectContent 
                                      side="bottom" 
                                      className="max-h-[250px] overflow-y-auto"
                                    >
                                      {countryCodeData.map((country) => (
                                        <SelectItem key={country.code} value={country.dial_code}>
                                          {country.name} ({country.dial_code})
                                        </SelectItem>
                                      ))}
                                    </SelectContent>
                                  </Select>
                                </FormItem>
                              )}
                            />
                            <div className="relative flex-1">
                              <Input
                                placeholder="1234567890"
                                type="tel"
                                maxLength={10}
                                {...field}
                              />
                            </div>
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <FormField
                    control={form.control}
                    name="pan"
                    render={({ field }) => (
                      <FormItem className="flex flex-col">
                        <FormLabel>PAN<span className="text-red-500">*</span></FormLabel>
                        <FormControl>
                          <Input placeholder="ABCDE12345" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <FormField
                    control={form.control}
                    name="gstin"
                    render={({ field }) => (
                      <FormItem className="flex flex-col">
                        <FormLabel>GSTIN<span className="text-red-500">*</span></FormLabel>
                        <FormControl>
                          <Input placeholder="01ABCDE12345Z123" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="address"
                    render={({ field }) => (
                      <FormItem className="flex flex-col">
                        <FormLabel>Address<span className="text-red-500">*</span></FormLabel>
                        <FormControl>
                          <Input
                            placeholder="123 Main St, Anytown, USA"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
        </>
    )
}

export default ClientInput;