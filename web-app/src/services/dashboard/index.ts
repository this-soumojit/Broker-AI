import api from "@/services/api";

export interface DashboardStats {
  totalClients: number;
  totalSales: number;
  totalPurchases: number; // This will actually be total payments received
  totalCommission: number;
  totalAmountDue: number;
  totalCommissionDue: number;
}

export interface MonthlyData {
  month: string;
  sales: number;
  purchases: number; // This will actually be payments received for that month
}

export interface RecentInvoice {
  id: string;
  invoiceNumber: string;
  invoiceDate: string;
  buyer: { name: string; };
  seller: { name: string; };
  invoiceNetAmount: number;
  status: string;
  dueDate?: string;
}

export interface DashboardData {
  stats: DashboardStats;
  monthlyData: MonthlyData[];
  latestDueInvoices: RecentInvoice[];
}

export const getDashboardStats = async (userId: string, bookId: string): Promise<DashboardData> => {
  const response = await api.get(`/api/v1/users/${userId}/books/${bookId}/dashboard`);
  return response.data.data;
};

export const getUserDashboardStats = async (userId: string): Promise<DashboardData> => {
  const response = await api.get(`/api/v1/users/${userId}/dashboard`);
  return response.data.data;
};
