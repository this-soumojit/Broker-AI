import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  ArrowLeft,
  User,
  Mail,
  Phone,
  MapPin,
  CreditCard,
  Building,
  ShoppingCart,
  IndianRupee,
  Calendar,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useNavigate, useParams } from "react-router-dom";
import { getClientById, getSalesByClient } from "@/services/client";
import { IClient } from "@/interfaces";
import { CustomPagination } from "@/components/pagination";

interface SalesSummary {
  totalOrders: number;
  totalSales: number;
  lastPurchaseDate: string | null;
}

interface SaleItem {
  id: string;
  invoiceNumber: string;
  invoiceDate: string;
  invoiceNetAmount: number;
  status: string;
  buyer: {
    id: string;
    name: string;
    email: string;
    phone: string;
  };
  seller: {
    id: string;
    name: string;
    email: string;
    phone: string;
  };
  createdAt: string;
}

interface SalesData {
  sales: SaleItem[];
  summary: SalesSummary;
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}

function ClientDetailsPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [client, setClient] = useState<IClient | null>(null);
  const [salesData, setSalesData] = useState<SalesData | null>(null);
  const [salesSummary, setSalesSummary] = useState<SalesSummary>({
    totalOrders: 0,
    totalSales: 0,
    lastPurchaseDate: null,
  });
  const [currentPage, setCurrentPage] = useState(1);
  const [salesPerPage] = useState(5);
  const { showError } = useToast();
  const { userId, clientId } = useParams();
  const navigate = useNavigate();

  const loadClientDetails = async () => {
    if (!userId || !clientId) return;
    setIsLoading(true);
    try {
      // Load client details
      const clientResponse = await getClientById(userId, clientId);
      setClient(clientResponse.data);

      // Load sales summary
      try {
        console.log("Attempting to load sales data for client:", clientId);
        const salesResponse = await getSalesByClient(userId, clientId);
        console.log("Sales response:", salesResponse);
        setSalesData(salesResponse.data);
        setSalesSummary(salesResponse.data.summary);
      } catch (salesError) {
        console.error("Could not load sales data:", salesError);
        // Keep default empty summary if sales endpoint fails
      }
    } catch (error) {
      showError(error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoBack = () => {
    navigate(`/${userId}/clients`);
  };

  useEffect(() => {
    if (userId && clientId && !isLoading) {
      loadClientDetails();
    }
  }, [userId, clientId]); // Only depend on userId and clientId

  if (isLoading) {
    return (
      <div className="w-full h-full">
        <div className="container mx-auto py-6 space-y-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 bg-muted rounded animate-pulse flex-shrink-0" />
              <div>
                <div className="w-48 h-8 bg-muted rounded animate-pulse mb-2" />
                <div className="w-32 h-4 bg-muted rounded animate-pulse" />
              </div>
            </div>
            <div className="w-24 h-10 bg-muted rounded animate-pulse flex-shrink-0" />
          </div>
          <div className="space-y-6">
            <div className="h-64 bg-muted rounded animate-pulse" />
            <div className="h-48 bg-muted rounded animate-pulse" />
            <div className="h-32 bg-muted rounded animate-pulse" />
          </div>
        </div>
      </div>
    );
  }

  if (!client) {
    return (
      <div className="container mx-auto py-6 min-h-screen">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-muted-foreground">
            Client Not Found
          </h1>
          <Button onClick={handleGoBack} className="mt-4">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Clients
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-6 space-y-6 min-h-screen">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={handleGoBack}
            className="text-muted-foreground hover:text-foreground"
            title="Go Back"
          >
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">
              Client Details
            </h1>
            <p className="text-muted-foreground">View client information</p>
          </div>
        </div>
      </div>

      {/* Client Information Card */}
      <Card className="shadow-sm">
        <CardHeader className="bg-muted/50">
          <CardTitle className="flex items-center gap-2">
            <User className="w-5 h-5" />
            Client Information
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <User className="w-5 h-5 text-muted-foreground" />
                <div>
                  <p className="text-sm text-muted-foreground">Name</p>
                  <p className="font-medium">{client.name}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Mail className="w-5 h-5 text-muted-foreground" />
                <div>
                  <p className="text-sm text-muted-foreground">Email</p>
                  <p className="font-medium">{client.email}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Phone className="w-5 h-5 text-muted-foreground" />
                <div>
                  <p className="text-sm text-muted-foreground">Phone</p>
                  <p className="font-medium">{client.phone}</p>
                </div>
              </div>
            </div>
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <CreditCard className="w-5 h-5 text-muted-foreground" />
                <div>
                  <p className="text-sm text-muted-foreground">PAN</p>
                  <p className="font-medium">{client.pan || "Not provided"}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Building className="w-5 h-5 text-muted-foreground" />
                <div>
                  <p className="text-sm text-muted-foreground">GSTIN</p>
                  <p className="font-medium">
                    {client.gstin || "Not provided"}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <MapPin className="w-5 h-5 text-muted-foreground" />
                <div>
                  <p className="text-sm text-muted-foreground">Address</p>
                  <p className="font-medium">
                    {client.address || "Not provided"}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Sales Summary Card */}
      <Card className="shadow-sm">
        <CardHeader className="bg-muted/50">
          <CardTitle className="flex items-center gap-2">
            <IndianRupee className="w-5 h-5" />
            Sales Summary
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center p-4 bg-primary/10 rounded-lg min-h-[120px] flex flex-col justify-center">
              <ShoppingCart className="w-8 h-8 text-primary mx-auto mb-2" />
              <p className="text-2xl font-bold">{salesSummary.totalOrders}</p>
              <p className="text-sm text-muted-foreground">Total Orders</p>
            </div>
            <div className="text-center p-4 bg-green-100 rounded-lg min-h-[120px] flex flex-col justify-center">
              <IndianRupee className="w-8 h-8 text-green-600 mx-auto mb-2" />
              <p className="text-2xl font-bold flex items-center justify-center gap-1">
                <IndianRupee className="w-5 h-5" />
                {salesSummary.totalSales.toLocaleString()}
              </p>
              <p className="text-sm text-muted-foreground">Total Sales</p>
            </div>
            <div className="text-center p-4 bg-blue-100 rounded-lg min-h-[120px] flex flex-col justify-center">
              <Calendar className="w-8 h-8 text-blue-600 mx-auto mb-2" />
              <p className="text-2xl font-bold">
                {salesSummary.lastPurchaseDate
                  ? new Date(salesSummary.lastPurchaseDate).toLocaleDateString()
                  : "N/A"}
              </p>
              <p className="text-sm text-muted-foreground">Last Purchase</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Orders Breakdown */}
      <Card className="shadow-sm">
        <CardHeader className="bg-muted/50">
          <CardTitle className="flex items-center gap-2">
            <ShoppingCart className="w-5 h-5" />
            Orders Breakdown
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          {salesData && salesData.sales.length > 0 ? (
            <div className="space-y-4">
              <div className="grid grid-cols-1 gap-4">
                {(() => {
                  const lastSaleIndex = currentPage * salesPerPage;
                  const firstSaleIndex = lastSaleIndex - salesPerPage;
                  const currentSales = salesData.sales.slice(
                    firstSaleIndex,
                    lastSaleIndex
                  );

                  return currentSales.map((sale) => (
                    <div
                      key={sale.id}
                      className="border rounded-lg p-4 hover:bg-muted/50 transition-colors"
                    >
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <h4 className="font-medium text-sm">
                              Invoice: {sale.invoiceNumber || "N/A"}
                            </h4>
                            <span
                              className={`px-2 py-1 text-xs rounded-full ${
                                sale.status === "PAID"
                                  ? "bg-green-100 text-green-800"
                                  : sale.status === "PENDING"
                                  ? "bg-yellow-100 text-yellow-800"
                                  : sale.status === "OVERDUE"
                                  ? "bg-red-100 text-red-800"
                                  : "bg-gray-100 text-gray-800"
                              }`}
                            >
                              {sale.status.replace(/_/g, " ")}
                            </span>
                          </div>
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm text-muted-foreground">
                            <div>
                              <p className="flex items-center gap-1">
                                <Calendar className="w-3 h-3" />
                                Date:{" "}
                                {sale.invoiceDate
                                  ? new Date(
                                      sale.invoiceDate
                                    ).toLocaleDateString()
                                  : "N/A"}
                              </p>
                            </div>
                            <div>
                              <p className="flex items-center gap-1">
                                Amount:
                                <IndianRupee className="w-3 h-3" />
                                {sale.invoiceNetAmount?.toLocaleString() || "0"}
                              </p>
                            </div>
                          </div>
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-2 text-sm">
                            <div>
                              <p className="text-muted-foreground">Seller:</p>
                              <Button
                                variant="link"
                                className="p-0 h-auto font-medium text-left justify-start"
                                onClick={() =>
                                  navigate(
                                    `/${userId}/clients/${sale.seller.id}`
                                  )
                                }
                              >
                                {sale.seller?.name || "N/A"}
                              </Button>
                              <div className="text-xs text-muted-foreground mt-1">
                                {sale.seller?.email && (
                                  <p className="flex items-center gap-1">
                                    <Mail className="w-3 h-3" />
                                    {sale.seller.email}
                                  </p>
                                )}
                                {sale.seller?.phone && (
                                  <p className="flex items-center gap-1">
                                    <Phone className="w-3 h-3" />
                                    {sale.seller.phone}
                                  </p>
                                )}
                              </div>
                            </div>
                            <div>
                              <p className="text-muted-foreground">Buyer:</p>
                              <Button
                                variant="link"
                                className="p-0 h-auto font-medium text-left justify-start"
                                onClick={() =>
                                  navigate(
                                    `/${userId}/clients/${sale.buyer.id}`
                                  )
                                }
                              >
                                {sale.buyer?.name || "N/A"}
                              </Button>
                              <div className="text-xs text-muted-foreground mt-1">
                                {sale.buyer?.email && (
                                  <p className="flex items-center gap-1">
                                    <Mail className="w-3 h-3" />
                                    {sale.buyer.email}
                                  </p>
                                )}
                                {sale.buyer?.phone && (
                                  <p className="flex items-center gap-1">
                                    <Phone className="w-3 h-3" />
                                    {sale.buyer.phone}
                                  </p>
                                )}
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  ));
                })()}
              </div>

              {/* Pagination */}
              {Math.ceil(salesData.sales.length / salesPerPage) > 1 && (
                <CustomPagination
                  totalItems={salesData.sales.length}
                  itemsPerPage={salesPerPage}
                  setCurrentPage={setCurrentPage}
                  currentPage={currentPage}
                />
              )}
            </div>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              <ShoppingCart className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p className="text-lg font-medium">No Orders Found</p>
              <p className="text-sm">
                This client has no sales transactions yet
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

export default ClientDetailsPage;
