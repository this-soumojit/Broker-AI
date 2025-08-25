import { useEffect, useState, useCallback } from "react";
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
import { bookFormSchema } from "@/schemas";
import { getBookById, updateBook } from "@/services/book";
import BookInput from "@/components/book-input";

export type BookFormValues = {
  name: string;
  startDate: Date | string;
  endDate: Date | string;
  openingBalance: number;
  closingBalance: number;
  notes?: string;
};

const defaultValues: BookFormValues = {
  name: "",
  startDate: new Date(),
  endDate: new Date(new Date().setMonth(new Date().getMonth() + 12)),
  openingBalance: 0,
  closingBalance: 0,
  notes: "",
};

export default function EditBookPage() {
  const [isLoading, setIsLoading] = useState(false);
  const { showSuccess, showError } = useToast();
  const { userId, bookId } = useParams();
  const navigate = useNavigate();

  const form = useForm<BookFormValues>({
    resolver: zodResolver(bookFormSchema),
    defaultValues,
  });

  const onSubmit = async (data: BookFormValues) => {
    if (!userId || !bookId) return;
    setIsLoading(true);
    try {
      await updateBook(userId, bookId, {
        ...data,
        startDate:
          data.startDate instanceof Date
            ? data.startDate.toISOString()
            : data.startDate,
        endDate:
          data.endDate instanceof Date
            ? data.endDate.toISOString()
            : data.endDate,
        notes: data.notes,
        status: "OPEN",
      });
      showSuccess("Book updated successfully");
      navigate(`/${userId}/books`);
    } catch (error) {
      showError(error);
    } finally {
      setIsLoading(false);
    }
  };

  const goBack = () => {
    navigate(`/${userId}/books`);
  };

  const loadBook = useCallback(async () => {
    if (!userId || !bookId) return;
    setIsLoading(true);
    try {
      const { data } = await getBookById(userId, bookId);
      form.reset(data);
    } catch (error) {
      showError(error);
    } finally {
      setIsLoading(false);
    }
  }, [userId, bookId, form]);

  useEffect(() => {
    if (userId && bookId) {
      loadBook();
    }
  }, [userId, bookId, loadBook]);

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
          <h1 className="text-3xl font-bold tracking-tight">Edit Book</h1>
          <p className="text-muted-foreground">Edit the details of your book</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="col-span-1 lg:col-span-2 shadow-sm">
          <CardHeader>
            <CardTitle>Book Information</CardTitle>
            <CardDescription>Edit the details for your book</CardDescription>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form
                onSubmit={form.handleSubmit(onSubmit)}
                className="space-y-6"
              >
                <BookInput form={form} />

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
                    Update Book
                  </Button>
                </div>
              </form>
            </Form>
          </CardContent>
        </Card>

        <Card className="shadow-sm">
          <CardHeader>
            <CardTitle>Book Information</CardTitle>
            <CardDescription>Important details about books</CardDescription>
          </CardHeader>
          <CardContent className="prose prose-sm">
            <p>
              A book represents a period of financial records. Each book has a
              start and end date, typically matching your financial year.
            </p>
            <h4>Tips for creating books:</h4>
            <ul className="list-disc pl-5 space-y-2">
              <li>
                Use meaningful names like "Financial Year 2023-2024" for easy
                identification
              </li>
              <li>
                Set accurate start and end dates to match your financial period
              </li>
              <li>
                Opening balance should match the closing balance of your
                previous book
              </li>
              <li>
                Add detailed notes about the purpose or special considerations
                for this book
              </li>
            </ul>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
