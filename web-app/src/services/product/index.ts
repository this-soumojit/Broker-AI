import { IProduct } from "@/interfaces";
import api from "../api";

export const addProducts = async (
  userId: string,
  bookId: string,
  saleId: string,
  payload: IProduct
) => {
  const response = await api.post(
    `/api/v1/users/${userId}/books/${bookId}/sales/${saleId}/products`,
    payload
  );
  return response.data;
};

export const getProducts = async (
  userId: string,
  bookId: string,
  saleId: string
) => {
  const response = await api.get(
    `/api/v1/users/${userId}/books/${bookId}/sales/${saleId}/products`
  );
  return response.data;
};

export const getProductById = async (
  userId: string,
  bookId: string,
  saleId: string,
  productId: string
) => {
  const response = await api.get(
    `/api/v1/users/${userId}/books/${bookId}/sales/${saleId}/products/${productId}`
  );
  return response.data;
};

export const updateProduct = async (
  userId: string,
  bookId: string,
  saleId: string,
  productId: string,
  payload: IProduct
) => {
  const response = await api.put(
    `/api/v1/users/${userId}/books/${bookId}/sales/${saleId}/products/${productId}`,
    payload
  );

  return response.data;
};

export const deleteProduct = async (
  userId: string,
  bookId: string,
  saleId: string,
  productId: string
) => {
  const response = await api.delete(
    `/api/v1/users/${userId}/books/${bookId}/sales/${saleId}/products/${productId}`
  );
  return response.data;
};
