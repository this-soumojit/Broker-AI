import { useEffect, useState, useCallback } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  SearchIcon,
  EyeIcon,
  PencilIcon,
  MoreHorizontalIcon,
  Lock,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import PageLoader from "@/components/page-loader";
import { useToast } from "@/hooks/use-toast";
import { useNavigate, useParams } from "react-router-dom";
import { getBookStats, getAccessibleBooks } from "@/services/book";
import { IBook } from "@/interfaces";
import { CustomPagination } from "@/components/pagination";

function BooksPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [books, setBooks] = useState<IBook[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [bookStats, setBookStats] = useState<any>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [bookPerPage, _] = useState(5);
  const { showError } = useToast();
  const { userId } = useParams();
  const navigate = useNavigate();

  const loadBooks = useCallback(async () => {
    if (!userId) return;
    setIsLoading(true);
    try {
      // Get accessible books with lock status
      const { data: accessibleData } = await getAccessibleBooks(userId);

      // Filter if there's a search term
      const filteredBooks = searchTerm
        ? accessibleData.books.filter((book: any) =>
            book.name.toLowerCase().includes(searchTerm.toLowerCase())
          )
        : accessibleData.books;

      setBooks(filteredBooks);
    } catch (error) {
      showError(error);
    } finally {
      setIsLoading(false);
    }
  }, [userId, searchTerm]);
  const loadBookStats = useCallback(async () => {
    if (!userId) return;
    try {
      const { data } = await getBookStats(userId);
      setBookStats(data);
    } catch (error) {
      console.error("Failed to load book stats:", error);
    }
  }, [userId]);

  const addNewBook = () => {
    if (bookStats && !bookStats.canAddMore) {
      showError(
        `You have reached the maximum number of books (${bookStats.limit}) for your ${bookStats.planName} plan. Please upgrade to add more books.`
      );
      return;
    }
    navigate(`/${userId}/books/new`);
  };
  const onEditBook = (book: IBook) => navigate(`/${userId}/books/${book.id}`);

  const onViewBook = (book: IBook) =>
    navigate(`/${userId}/books/${book.id}/sales`);

  const onSearch = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    loadBooks();
  };

  useEffect(() => {
    if (userId) {
      loadBooks();
      loadBookStats();
    }
  }, [userId, loadBooks, loadBookStats]);

  useEffect(() => {
    if (!searchTerm) {
      loadBooks();
    }
  }, [searchTerm, loadBooks]);

  // Calculate the books to display on the current page
  const indexOfLastBook = currentPage * bookPerPage;
  const indexOfFirstBook = indexOfLastBook - bookPerPage;
  const currentBooks = books.slice(indexOfFirstBook, indexOfLastBook);

  return (
    <div className="container mx-auto py-6 space-y-6">
      <PageLoader isLoading={isLoading} />
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Books</h1>
          <div className="flex flex-col gap-1">
            <p className="text-muted-foreground">
              Manage your books and records
            </p>
            {bookStats && (
              <p className="text-muted-foreground">
                {bookStats.isUnlimited ? (
                  <span className="text-green-600">
                    {bookStats.currentCount} books • Unlimited plan
                  </span>
                ) : (
                  <span
                    className={
                      bookStats.canAddMore ? "text-green-600" : "text-amber-600"
                    }
                  >
                    {bookStats.currentCount} / {bookStats.limit} books{" "}
                    {bookStats.canAddMore && " (Limit reached)"}
                  </span>
                )}
              </p>
            )}
          </div>
        </div>
        <Button
          className="cursor-pointer"
          onClick={addNewBook}
          disabled={bookStats && !bookStats.canAddMore}
        >
          Add New Book
        </Button>
      </div>

      {/* Book Limit Warning */}
      {bookStats &&
        !bookStats.isUnlimited &&
        bookStats.remainingSlots !== null &&
        bookStats.remainingSlots <= 1 && (
          <Card className="border-amber-200 bg-amber-50">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-semibold text-amber-800">
                    {bookStats.remainingSlots === 0
                      ? "Book Limit Reached"
                      : "Almost at Book Limit"}
                  </h3>
                  <p className="text-sm text-amber-700 mt-1">
                    {bookStats.remainingSlots === 0
                      ? `You've reached your ${bookStats.planName} plan limit of ${bookStats.limit} books.`
                      : `You have only ${bookStats.remainingSlots} book slot remaining on your ${bookStats.planName} plan.`}{" "}
                    Upgrade to Professional for unlimited books.
                  </p>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => navigate(`/${userId}/upgrade`)}
                  className="border-amber-300 text-amber-800 hover:bg-amber-100"
                >
                  Upgrade Plan
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

      <Card className="shadow-sm">
        <CardHeader className="bg-muted/50">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <CardTitle>Book List</CardTitle>
            <div className="relative w-full sm:w-64">
              <form onSubmit={onSearch}>
                <SearchIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search books..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </form>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <div className="rounded-md overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/30 hover:bg-muted/30">
                  <TableHead>Name</TableHead>
                  <TableHead>Duration</TableHead>
                  <TableHead className="hidden md:table-cell">
                    Opening Balance
                  </TableHead>
                  <TableHead className="hidden md:table-cell">
                    Closing Balance
                  </TableHead>
                  <TableHead className="hidden sm:table-cell">Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {books.length === 0 ? (
                  <TableRow>
                    <TableCell
                      colSpan={6}
                      className="text-center py-8 text-muted-foreground"
                    >
                      No Books Found
                    </TableCell>
                  </TableRow>
                ) : (
                  currentBooks.map((book: any) => (
                    <TableRow
                      key={book.id}
                      className={`hover:bg-muted/20 ${
                        book.isLocked ? "opacity-60" : ""
                      }`}
                    >
                      <TableCell className="font-medium">
                        <div className="flex items-center gap-2">
                          <div>
                            {book.name}
                            {book.isLocked && (
                              <span className="ml-2 inline-flex items-center">
                                <Lock className="h-4 w-4 text-muted-foreground" />
                              </span>
                            )}
                            <p className="text-sm text-muted-foreground hidden sm:block">
                              {book.notes}
                            </p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-col space-y-1">
                          <span>
                            {format(new Date(book.startDate), "MMM d, yyyy")}
                          </span>
                          <span className="text-muted-foreground">to</span>
                          <span>
                            {format(new Date(book.endDate), "MMM d, yyyy")}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell className="hidden md:table-cell">
                        ₹ {book.openingBalance}
                      </TableCell>
                      <TableCell className="hidden md:table-cell">
                        ₹ {book.closingBalance}
                      </TableCell>
                      <TableCell className="hidden sm:table-cell">
                        <Badge
                          variant={
                            book.status === "OPEN" ? "default" : "secondary"
                          }
                          className="cursor-default"
                        >
                          {book.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button
                            variant="secondary"
                            size="icon"
                            onClick={() =>
                              book.isLocked
                                ? navigate(`/${userId}/upgrade`)
                                : onViewBook(book)
                            }
                            className="hidden sm:flex h-8 w-8 hover:cursor-pointer"
                            title={
                              book.isLocked
                                ? "Upgrade to access this book"
                                : "View Book"
                            }
                          >
                            <EyeIcon className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="secondary"
                            size="icon"
                            className="hidden sm:flex h-8 w-8 hover:cursor-pointer"
                            title={
                              book.isLocked
                                ? "Upgrade to edit this book"
                                : "Edit"
                            }
                            onClick={() =>
                              book.isLocked
                                ? navigate(`/${userId}/upgrade`)
                                : onEditBook(book)
                            }
                          >
                            <PencilIcon className="h-4 w-4" />
                          </Button>

                          {/* Mobile dropdown menu */}
                          <DropdownMenu>
                            <DropdownMenuTrigger>
                              <Button size="icon" className="sm:hidden h-8 w-8">
                                <MoreHorizontalIcon className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem
                                onClick={() =>
                                  book.isLocked
                                    ? navigate(`/${userId}/upgrade`)
                                    : onViewBook(book)
                                }
                                className="cursor-pointer"
                              >
                                <>
                                  <EyeIcon className="h-4 w-4 mr-2" />
                                  {book.isLocked ? "Upgrade to Access" : "View"}
                                </>
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                onClick={() =>
                                  book.isLocked
                                    ? navigate(`/${userId}/upgrade`)
                                    : onEditBook(book)
                                }
                                className="cursor-pointer"
                              >
                                <>
                                  <PencilIcon className="h-4 w-4 mr-2" />
                                  {book.isLocked ? "Upgrade to Edit" : "Edit"}
                                </>
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
      {Math.ceil(books.length / bookPerPage) > 1 && (
        <CustomPagination
          currentPage={currentPage}
          totalItems={books.length}
          setCurrentPage={setCurrentPage}
          itemsPerPage={bookPerPage}
        />
      )}
    </div>
  );
}

export default BooksPage;
