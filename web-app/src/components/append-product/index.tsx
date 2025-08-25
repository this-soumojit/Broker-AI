import { X } from "lucide-react";
import { FormLabel } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import type { Product } from "@/pages/app/sale/view-sale";
import CustomAlertDialog from "../custom-alert-dialog";

const AppendProduct = (
{ 
    item,
    index,
    setAllProducts, 
    removeProduct
}: {
    item: Product, 
    index: number, 
    setAllProducts: React.Dispatch<React.SetStateAction<Product[]>>, 
    removeProduct: (id: string | undefined) => void
}) => {
    return (
        <div
        key={index}
        className="border rounded-md p-4 space-y-4"
        >
        {item.id ? (
            <div className="flex justify-end">
                <CustomAlertDialog trigger={<X className="cursor-pointer w-4 h-4" />} func={() => removeProduct(item.id)} className="bg-red-700 hover:bg-red-800 cursor-pointer text-white"/>
            </div>
        ) : null}

        {/* Product Input Fields */}
        <div className="grid grid-cols-1 gap-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
                <FormLabel htmlFor="product-name">Name<span className="text-red-500">*</span></FormLabel>
                <Input
                id="product-name"
                placeholder="Product name"
                value={item.name}
                onChange={(e) =>
                    setAllProducts((prod) => {
                    const updated = [...prod];
                    updated[index] = {
                        ...prod[index],
                        name: e.target.value,
                    };
                    return updated;
                    })
                }
                />
            </div>

            <div className="grid grid-cols-2 gap-2">
                <div>
                <FormLabel htmlFor="product-quantity">
                    Quantity<span className="text-red-500">*</span>
                </FormLabel>
                <Input
                    id="product-quantity"
                    type="number"
                    min={0}
                    step="0.01"
                    placeholder="0"
                    value={item.quantity}
                    onChange={(e) =>
                    setAllProducts((prod) => {
                        const updated = [...prod];
                        updated[index] = {
                        ...prod[index],
                        quantity:
                            parseFloat(e.target.value) || 0,
                        };
                        return updated;
                    })
                    }
                />
                </div>

                <div>
                <FormLabel htmlFor="product-unit">
                    Unit<span className="text-red-500">*</span>
                </FormLabel>
                <Input
                    id="product-unit"
                    placeholder="kg, pcs, etc."
                    required
                    value={item.unit}
                    onChange={(e) =>
                    setAllProducts((prod) => {
                        const updated = [...prod];
                        updated[index] = {
                        ...prod[index],
                        unit: e.target.value,
                        };
                        return updated;
                    })
                    }
                />
                </div>
            </div>

            <div>
                <FormLabel htmlFor="product-rate">
                Rate (₹)<span className="text-red-500">*</span>
                </FormLabel>
                <Input
                id="product-rate"
                type="number"
                min={0}
                step="0.01"
                placeholder="0"
                value={item.rate}
                onChange={(e) =>
                    setAllProducts((prod) => {
                    const updated = [...prod];
                    updated[index] = {
                        ...prod[index],
                        rate: parseFloat(e.target.value) || 0,
                    };
                    return updated;
                    })
                }
                />
            </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-2">
            <div>
                <FormLabel htmlFor="product-amount">
                Amount (₹)
                </FormLabel>
                <Input
                id="product-amount"
                type="text"
                readOnly
                className="bg-muted"
                value={(item.quantity * item.rate).toFixed(2)}
                />
            </div>

            <div className="grid grid-cols-2 gap-2">
                <div>
                <FormLabel htmlFor="product-discount">
                    Discount (%)<span className="text-red-500">*</span>
                </FormLabel>
                <Input
                    id="product-discount"
                    type="number"
                    min={0}
                    max={100}
                    step="0.01"
                    placeholder="0"
                    value={item.discountRate}
                    onChange={(e) =>
                    setAllProducts((prod) => {
                        const updated = [...prod];
                        updated[index] = {
                        ...prod[index],
                        discountRate:
                            parseFloat(e.target.value) || 0,
                        };
                        return updated;
                    })
                    }
                />
                </div>

                <div>
                <FormLabel htmlFor="product-discount-amount">
                    Discount (₹)
                </FormLabel>
                <Input
                    id="product-discount-amount"
                    type="text"
                    readOnly
                    className="bg-muted"
                    value={(
                    (item.quantity *
                        item.rate *
                        item.discountRate) /
                    100
                    ).toFixed(2)}
                />
                </div>
            </div>

            <div className="grid grid-cols-2 gap-2">
                <div>
                <FormLabel htmlFor="product-gst">
                    GST Rate (%)<span className="text-red-500">*</span>
                </FormLabel>
                <Input
                    id="product-gst"
                    type="number"
                    min={0}
                    max={100}
                    step="0.01"
                    placeholder="0"
                    value={item.gstRate}
                    onChange={(e) =>
                    setAllProducts((prod) => {
                        const updated = [...prod];
                        updated[index] = {
                        ...prod[index],
                        gstRate:
                            parseFloat(e.target.value) || 0,
                        };
                        return updated;
                    })
                    }
                />
                </div>

                <div>
                <FormLabel htmlFor="product-gst-amount">
                    GST (₹)
                </FormLabel>
                <Input
                    id="product-gst-amount"
                    type="text"
                    readOnly
                    className="bg-muted"
                    value={(() => {
                    const amount = item.quantity * item.rate;
                    const discountAmount =
                        (amount * item.discountRate) / 100;
                    return (
                        ((amount - discountAmount) *
                        item.gstRate) /
                        100
                    ).toFixed(2);
                    })()}
                />
                </div>
            </div>
            </div>
        </div>
        </div>
    )
}

export default AppendProduct;