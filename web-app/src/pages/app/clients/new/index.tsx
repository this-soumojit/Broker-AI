import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Form,
} from "@/components/ui/form";
import { useToast } from "@/hooks/use-toast";
import PageLoader from "@/components/page-loader";
import { clientFormSchema } from "@/schemas";
import { addClient } from "@/services/client";
import ClientInput from "@/components/client-input";

type ClientFormValues = {
  name: string;
  email: string;
  phoneCode: string;
  phone: string;
  pan: string;
  gstin: string;
  address: string;
};

const defaultValues: ClientFormValues = {
  name: "",
  email: "",
  phoneCode: "+91",
  phone: "",
  pan: "",
  gstin: "",
  address: "",
};

export default function NewClientPage() {
  const [isLoading, setIsLoading] = useState(false);
  const { showSuccess, showError } = useToast();
  const { userId } = useParams();
  const navigate = useNavigate();

  const form = useForm<ClientFormValues>({
    resolver: zodResolver(clientFormSchema),
    defaultValues,
  });

  const onSubmit = async (data: ClientFormValues) => {
    if (!userId) return;
    setIsLoading(true);
    try {
      const phoneCodeWithoutPlus = data.phoneCode.replace('+', '');
      const fullPhoneNumber = `${phoneCodeWithoutPlus}${data.phone}`;
      
      await addClient(userId, {
        ...data,
        phone: fullPhoneNumber,
      });
      showSuccess("Client created successfully");
      navigate(`/${userId}/clients`);
    } catch (error) {
      showError(error);
    } finally {
      setIsLoading(false);
    }
  };

  const goBack = () => {
    navigate(`/${userId}/clients`);
  };

  return (
    <div className="container mx-auto py-6 space-y-6">
      <PageLoader isLoading={isLoading} />
      <div className="flex items-center gap-4">
        <Button
          variant="ghost"
          size="icon"
          onClick={goBack}
          className="h-8 w-8 cursor-pointer"
          title="Back"
        >
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Add New Client</h1>
          <p className="text-muted-foreground">Create a new client</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="col-span-1 lg:col-span-2 shadow-sm">
          <CardHeader>
            <CardTitle>Client Information</CardTitle>
            <CardDescription>
              Enter the details for your new client
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form
                onSubmit={form.handleSubmit(onSubmit)}
                className="space-y-6"
              >
                <ClientInput form={form} />

                <div className="flex flex-col sm:flex-row gap-4 justify-end">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={goBack}
                    className="cursor-pointer"
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    disabled={isLoading}
                    className="cursor-pointer"
                  >
                    Create Client
                  </Button>
                </div>
              </form>
            </Form>
          </CardContent>
        </Card>
        <Card className="shadow-sm">
          <CardHeader>
            <CardTitle>Client Information</CardTitle>
            <CardDescription>Important details about clients</CardDescription>
          </CardHeader>
          <CardContent className="prose prose-sm">
            <p>
              A client represents a business or individual that you do business
              with. Each client has a name, email, phone, pan, gstin, and
              address.
            </p>
            <h4>Tips for creating clients:</h4>
            <ul className="list-disc pl-5 space-y-2">
              <li>
                Use meaningful names like "John Doe" for easy identification
              </li>
              <li>
                Set accurate email, phone, pan, gstin, and address for easy
                identification
              </li>
              <li>
                Add detailed notes about the purpose or special considerations
                for this client
              </li>
            </ul>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
