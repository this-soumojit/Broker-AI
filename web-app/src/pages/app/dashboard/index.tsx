import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { ChartContainer, ChartConfig } from "@/components/ui/chart";
import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis, CartesianGrid, Tooltip } from "recharts";
import { 
  Users, 
  ShoppingCart, 
  Package, 
  DollarSign, 
  AlertCircle, 
  TrendingUp,
  Calendar,
  FileText
} from "lucide-react";
import { getUserDashboardStats, DashboardData } from "@/services/dashboard";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";

const chartConfig = {
  sales: {
    label: "Sales",
    color: "#87CEEB",
  },
  purchases: {
    label: "Purchases", 
    color: "#000080",
  },
} satisfies ChartConfig;

function Dashboard() {
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { showError } = useToast();
  const { userId } = useParams();

  useEffect(() => {
    const fetchDashboardData = async () => {
      console.log("Dashboard component mounted. userId:", userId);
      
      if (!userId) {
        console.log("Missing userId, not fetching data");
        setIsLoading(false);
        return;
      }
      
      setIsLoading(true);
      try {
        console.log("Fetching dashboard data from API...");
        const data = await getUserDashboardStats(userId);
        console.log("Dashboard data from API:", data);
        setDashboardData(data);
      } catch (error) {
        console.error("Error fetching dashboard data:", error);
        showError("Failed to load dashboard data. Please check your connection and try again.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchDashboardData();
  }, [userId]);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
    }).format(amount);
  };

  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case "PAID":
        return "default";
      case "PENDING":
        return "secondary";
      case "PARTIALLY_PAID":
        return "outline";
      case "OVERDUE":
        return "destructive";
      default:
        return "secondary";
    }
  };

  if (isLoading) {
    return (
      <div className="container mx-auto py-6 space-y-6">
        <div className="space-y-2">
          <Skeleton className="h-8 w-64" />
          <Skeleton className="h-4 w-96" />
        </div>
        
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
          {Array.from({ length: 6 }).map((_, i) => (
            <Card key={i}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <Skeleton className="h-4 w-20" />
                <Skeleton className="h-4 w-4" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-7 w-16 mb-1" />
                <Skeleton className="h-3 w-24" />
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <Card>
            <CardHeader>
              <Skeleton className="h-6 w-32" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-64 w-full" />
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <Skeleton className="h-6 w-32" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-64 w-full" />
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  if (!dashboardData) {
    return (
      <div className="container mx-auto py-6">
        <div className="text-center">
          <AlertCircle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-semibold">No Dashboard Data Available</h3>
          <p className="text-muted-foreground mb-4">
            Unable to load dashboard data. This could be due to:
          </p>
          <ul className="text-muted-foreground text-sm space-y-1 mb-4">
            <li>• No clients or sales data exists yet</li>
            <li>• Network connection issues</li>
            <li>• Server temporarily unavailable</li>
          </ul>
          <div className="space-x-2">
            <Button onClick={() => window.location.reload()}>
              Try Again
            </Button>
            <Button variant="outline" onClick={() => window.history.back()}>
              Go Back
            </Button>
          </div>
        </div>
      </div>
    );
  }

  const { stats, monthlyData, latestDueInvoices } = dashboardData;

  return (
    <div className="container mx-auto py-6 space-y-6">
      {/* Header */}
      <div className="space-y-2">
        <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground">
          Overview of your business performance and recent activities
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Clients</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalClients}</div>
            <p className="text-xs text-muted-foreground">Active business relationships</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Sales</CardTitle>
            <ShoppingCart className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(stats.totalSales)}</div>
            <p className="text-xs text-muted-foreground">Revenue generated</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Payments</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(stats.totalPurchases)}</div>
            <p className="text-xs text-muted-foreground">Payments received</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Commission</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(stats.totalCommission)}</div>
            <p className="text-xs text-muted-foreground">Commission earned</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Amount Due</CardTitle>
            <AlertCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">{formatCurrency(stats.totalAmountDue)}</div>
            <p className="text-xs text-muted-foreground">Pending payments</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Commission Due</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{formatCurrency(stats.totalCommissionDue)}</div>
            <p className="text-xs text-muted-foreground">Pending commission</p>
          </CardContent>
        </Card>
      </div>

      {/* Charts and Latest Due Invoices */}
      <div className="grid gap-4 md:grid-cols-2">
        {/* Monthly Sales and Purchases Bar Chart */}
        <Card>
          <CardHeader>
            <CardTitle>Monthly Sales & Purchases</CardTitle>
            <CardDescription>
              Comparison of sales amount vs purchases received over the last 12 months
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ChartContainer config={chartConfig}>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={monthlyData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip 
                    formatter={(value: number, name: string) => [
                      formatCurrency(value), 
                      chartConfig[name as keyof typeof chartConfig]?.label || name
                    ]}
                    labelStyle={{ color: 'black' }}
                  />
                  <Bar dataKey="sales" fill="var(--color-sales)" name="Sales" />
                  <Bar dataKey="purchases" fill="var(--color-purchases)" name="Purchases" />
                </BarChart>
              </ResponsiveContainer>
            </ChartContainer>
          </CardContent>
        </Card>

        {/* Latest Due Invoices */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              Latest Due Invoices
            </CardTitle>
            <CardDescription>
              Recent invoices approaching due date
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {latestDueInvoices.length > 0 ? (
                latestDueInvoices.map((invoice) => (
                  <div key={invoice.id} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="space-y-1">
                      <p className="text-sm font-medium">{invoice.invoiceNumber}</p>
                      <p className="text-xs text-muted-foreground">
                        {invoice.buyer.name} ← {invoice.seller.name}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        Due: {format(new Date(invoice.dueDate!), "MMM d, yyyy")}
                      </p>
                    </div>
                    <div className="text-right space-y-1">
                      <p className="text-sm font-semibold">{formatCurrency(invoice.invoiceNetAmount)}</p>
                      <Badge variant={getStatusBadgeVariant(invoice.status)}>
                        {invoice.status.replace(/_/g, " ")}
                      </Badge>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-8">
                  <FileText className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
                  <p className="text-sm text-muted-foreground">No due invoices</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

export default Dashboard;
