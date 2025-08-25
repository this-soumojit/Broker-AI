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
import { getSalesByBook, getSalesStatsByBook } from "@/services/sale";
import { ISale } from "@/interfaces";
import { CustomPagination } from "@/components/pagination";

function SalesPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [sales, setSales] = useState<ISale[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [salePerPage, _] = useState(10);
  const [salesStats, setSalesStats] = useState<any>(null);
  const { showError } = useToast();
  const { userId, bookId } = useParams();
  const navigate = useNavigate();

  const lastSaleIndex = currentPage * salePerPage;
  const firstSaleIndex = lastSaleIndex - salePerPage;
  const currentSales = sales.slice(firstSaleIndex, lastSaleIndex);

  const loadSales = useCallback(async () => {
    if (!userId || !bookId) return;
    setIsLoading(true);
    try {
      const query = {
        q: searchTerm || "",
      };
      const queryString = new URLSearchParams(query).toString();
      const { data } = await getSalesByBook(userId, bookId, queryString);
      setSales(data);
      // Reset to first page when search results change
      setCurrentPage(1);
    } catch (error) {
      showError(error);
    } finally {
      setIsLoading(false);
    }
  }, [userId, bookId, searchTerm]);

  const loadSalesStats = useCallback(async () => {
    if (!userId || !bookId) return;
    try {
      console.log("Loading book-specific sales stats for:", { userId, bookId });
      const { data } = await getSalesStatsByBook(userId, bookId);
      console.log("Sales stats loaded:", data);
      setSalesStats(data);
    } catch (error) {
      console.error("Failed to load sales stats:", error);
    }
  }, [userId, bookId]);

  const addNewSale = () => {
    if (salesStats && !salesStats.canAddMore) {
      showError(
        `You have reached the maximum number of sales (${salesStats.limit}) for your ${salesStats.planName} plan. Please upgrade to add more sales.`
      );
      return;
    }
    navigate(`/${userId}/books/${bookId}/sales/new`);
  };

  const onEditSale = (sale: ISale) =>
    navigate(`/${userId}/books/${bookId}/sales/${sale.id}`);

  const onViewSale = (sale: ISale) =>
    navigate(`/${userId}/books/${bookId}/sales/${sale.id}/view`);

  const onSearch = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    loadSales();
  };

  useEffect(() => {
    if (userId && bookId) {
      loadSales();
      loadSalesStats();
    }
  }, [userId, bookId, loadSales, loadSalesStats]);

  useEffect(() => {
    if (!searchTerm) {
      loadSales();
    }
  }, [searchTerm, loadSales]);

  return (
    <div className="container mx-auto py-6 space-y-6">
      <PageLoader isLoading={isLoading} />
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Sales</h1>
          <div className="flex flex-col gap-1">
            <p className="text-muted-foreground">
              Manage your sales and records
            </p>
            {salesStats ? (
              <p className="text-sm text-muted-foreground">
                {salesStats.isUnlimited ? (
                  <span className="text-green-600">
                    {salesStats.currentCount} sales in this book •{" "}
                    {salesStats.totalCount || salesStats.currentCount} total
                    sales • {salesStats.planName} plan (Unlimited)
                  </span>
                ) : (
                  <span
                    className={
                      salesStats.canAddMore
                        ? "text-green-600"
                        : "text-amber-600"
                    }
                  >
                    {salesStats.currentCount} sales in this book •{" "}
                    {salesStats.totalCount || salesStats.currentCount} /{" "}
                    {salesStats.limit} total sales used on {salesStats.planName}{" "}
                    plan
                    {!salesStats.canAddMore && " (Limit reached)"}
                  </span>
                )}
              </p>
            ) : (
              <p className="text-xs text-muted-foreground">Loading stats...</p>
            )}
          </div>
        </div>
        <Button
          className="cursor-pointer"
          onClick={addNewSale}
          disabled={salesStats && !salesStats.canAddMore}
        >
          Add New Sale
        </Button>
      </div>

      {/* Sales Limit Warning - Show for non-unlimited plans */}
      {salesStats &&
        !salesStats.isUnlimited &&
        salesStats.remainingSlots !== null &&
        salesStats.remainingSlots <= 1 && (
          <Card className="border-amber-200 bg-amber-50">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-semibold text-amber-800">
                    {salesStats.remainingSlots === 0
                      ? "Sales Limit Reached"
                      : "Almost at Sales Limit"}
                  </h3>
                  <p className="text-sm text-amber-700 mt-1">
                    {salesStats.remainingSlots === 0
                      ? `You've reached your ${salesStats.planName} plan limit of ${salesStats.limit} total sales across all books.`
                      : `You have only ${salesStats.remainingSlots} sales slots remaining on your ${salesStats.planName} plan across all books.`}{" "}
                    Upgrade to Professional for unlimited sales.
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
            <CardTitle>Sale List</CardTitle>
            <div className="relative w-full sm:w-64">
              <form onSubmit={onSearch}>
                <SearchIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search sales..."
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
                  <TableHead>Invoice Number</TableHead>
                  <TableHead>Invoice Date</TableHead>
                  <TableHead>Buyer</TableHead>
                  <TableHead className="hidden md:table-cell">Seller</TableHead>
                  <TableHead className="hidden md:table-cell">Amount</TableHead>
                  <TableHead className="hidden sm:table-cell">
                    Due Days
                  </TableHead>
                  <TableHead className="hidden sm:table-cell">Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {currentSales.length === 0 ? (
                  <TableRow>
                    <TableCell
                      colSpan={8}
                      className="text-center py-8 text-muted-foreground"
                    >
                      No Sales Found
                    </TableCell>
                  </TableRow>
                ) : (
                  currentSales.map((sale) => (
                    <TableRow key={sale.id} className="hover:bg-muted/20">
                      <TableCell className="font-medium">
                        {sale.invoiceNumber}
                      </TableCell>
                      <TableCell>
                        {format(new Date(sale.invoiceDate), "MMM d, yyyy")}
                      </TableCell>
                      <TableCell>
                            <div className="flex flex-col items-start">
                            <span onClick={() =>
                            navigate(`/${userId}/clients/${sale.buyer.id}`)
                          }>Name:
                          <span className="hover:cursor-pointer hover:underline">
                           {sale.buyer.name}
                          </span>
                           </span>
                            {sale.buyer.phone && (
                              <span className="text-xs text-muted-foreground">
                              Phone: {sale.buyer.phone}
                              </span>
                            )}
                            {sale.buyer.pan && (
                              <span className="text-xs text-muted-foreground">
                              PAN: {sale.buyer.pan}
                              </span>
                            )}
                            {sale.buyer.gstin && (
                              <span className="text-xs text-muted-foreground">
                                GSTIN: {sale.buyer.gstin}
                              </span>
                            )}
                            {sale.buyer.address && (
                              <span className="text-xs text-muted-foreground">
                              Address: {sale.buyer.address}
                              </span>
                            )}
                            </div>
                      </TableCell>
                      <TableCell className="hidden md:table-cell">
                            <div className="flex flex-col items-start">
                            <span
                            onClick={() =>
                              navigate(`/${userId}/clients/${sale.seller.id}`)
                            }>Name: 
                          <span
                            className="hover:cursor-pointer hover:underline"
                          >
                          {sale.seller.name}
                          </span>
                          
                          </span>
                            {sale.seller.phone && (
                              <span className="text-xs text-muted-foreground">
                              Phone: {sale.seller.phone}
                              </span>
                            )}
                            {sale.seller.pan && (
                              <span className="text-xs text-muted-foreground">
                              PAN: {sale.seller.pan}
                              </span>
                            )}
                            {sale.seller.gstin && (
                              <span className="text-xs text-muted-foreground">
                                GSTIN: {sale.seller.gstin}
                              </span>
                            )}
                            {sale.seller.address && (
                              <span className="text-xs text-muted-foreground">
                              Address: {sale.seller.address}
                              </span>
                            )}
                            </div>
                      </TableCell>
                      <TableCell className="hidden md:table-cell">
                        ₹ {sale.invoiceNetAmount}
                      </TableCell>
                      <TableCell className="hidden sm:table-cell">
                        {sale.invoiceDueDays}
                      </TableCell>
                      <TableCell className="hidden sm:table-cell">
                        <Badge
                          variant={
                            sale.status === "PENDING" ? "default" : "secondary"
                          }
                          className="cursor-default"
                        >
                          {sale.status.replace(/_/g, " ")}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button
                            variant="secondary"
                            size="icon"
                            onClick={() => onViewSale(sale)}
                            className="hidden sm:flex h-8 w-8 hover:cursor-pointer"
                            title="View"
                          >
                            <EyeIcon className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="secondary"
                            size="icon"
                            className="hidden sm:flex h-8 w-8 hover:cursor-pointer"
                            title="Edit"
                            onClick={() => onEditSale(sale)}
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
                                onClick={() => onViewSale(sale)}
                                className="cursor-pointer"
                              >
                                <EyeIcon className="h-4 w-4 mr-2" />
                                View
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                onClick={() => onEditSale(sale)}
                                className="cursor-pointer"
                              >
                                <PencilIcon className="h-4 w-4 mr-2" />
                                Edit
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
      {Math.ceil(sales.length / salePerPage) > 1 && (
        <CustomPagination
          totalItems={sales.length}
          itemsPerPage={salePerPage}
          setCurrentPage={setCurrentPage}
          currentPage={currentPage}
        />
      )}
    </div>
  );
}

export default SalesPage;
