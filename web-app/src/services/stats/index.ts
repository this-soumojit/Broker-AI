import api from "../api";

export interface SaleStats {
  currentCount: number;
  totalCount: number;
  limit: number | null;
  isUnlimited: boolean;
  planName: string;
  canAddMore: boolean;
  remainingSlots: number | null;
  isBookSpecific?: boolean;
}

export interface BookStats {
  currentCount: number;
  limit: number | null;
  isUnlimited: boolean;
  planName: string;
  canAddMore: boolean;
  remainingSlots: number | null;
}

export interface CombinedStats {
  sales: SaleStats;
  books: BookStats;
  planName: string;
}

export const getCombinedStats = async (userId: string, token: string) => {
  const [salesResponse, booksResponse] = await Promise.all([
    api.get(`/api/v1/users/${userId}/sales/stats`, {
      headers: { Authorization: `Bearer ${token}` },
    }),
    api.get(`/api/v1/users/${userId}/books/stats`, {
      headers: { Authorization: `Bearer ${token}` },
    }),
  ]);

  const salesStats = salesResponse.data.data;
  const booksStats = booksResponse.data.data;

  return {
    data: {
      sales: salesStats,
      books: booksStats,
      planName: salesStats.planName,
    },
  };
};
