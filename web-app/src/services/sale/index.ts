import { ICreateSale } from "@/interfaces";
import api from "@/services/api";

export const addSale = async (userId: string, payload: ICreateSale) => {
  const response = await api.post(`/api/v1/users/${userId}/sales`, payload);
  return response.data;
};

export const addSaleToBook = async (
  userId: string,
  bookId: string,
  payload: ICreateSale
) => {
  const response = await api.post(
    `/api/v1/users/${userId}/books/${bookId}/sales`,
    payload
  );
  return response.data;
};

export const getSales = async (
  userId: string,
  bookId: string,
  params: string
) => {
  const response = await api.get(
    `/api/v1/users/${userId}/books/${bookId}/sales?${params}`
  );
  return response.data;
};

export const getSaleById = async (
  userId: string,
  bookId: string,
  saleId: string
) => {
  const response = await api.get(
    `/api/v1/users/${userId}/books/${bookId}/sales/${saleId}`
  );
  return response.data;
};

export const updateSale = async (
  userId: string,
  bookId: string,
  saleId: string,
  payload: ICreateSale
) => {
  const response = await api.put(
    `/api/v1/users/${userId}/books/${bookId}/sales/${saleId}`,
    payload
  );
  return response.data;
};

export const deleteSale = async (
  userId: string,
  bookId: string,
  saleId: string
) => {
  const response = await api.delete(
    `/api/v1/users/${userId}/books/${bookId}/sales/${saleId}`
  );
  return response.data;
};

export const getSalesByClient = async (
  userId: string,
  clientId: string,
  params?: string
) => {
  const queryParams = params ? `?${params}` : "";
  const response = await api.get(
    `/api/v1/users/${userId}/clients/${clientId}/sales${queryParams}`
  );
  return response.data;
};

export const getSalesStats = async (userId: string) => {
  const response = await api.get(`/api/v1/users/${userId}/sales/stats`);
  return response.data;
};

export const getSalesStatsByBook = async (userId: string, bookId: string) => {
  const response = await api.get(
    `/api/v1/users/${userId}/books/${bookId}/sales/stats`
  );
  return response.data;
};

export const getSalesByBook = async (
  userId: string,
  bookId: string,
  params?: string
) => {
  const queryParams = params ? `?${params}` : "";
  const response = await api.get(
    `/api/v1/users/${userId}/books/${bookId}/sales${queryParams}`
  );
  return response.data;
};
