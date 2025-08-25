import { IGoodsReturnProduct } from "@/interfaces";
import api from "../api";

// Goods Return Products
export const getGoodsReturnProducts = async (
  userId: string,
  bookId: string,
  saleId: string,
  goodsReturnId: string
) => {
  const response = await api.get(
    `/api/v1/users/${userId}/books/${bookId}/sales/${saleId}/goods-returns/${goodsReturnId}/products`
  );
  return response.data;
};

export const addGoodsReturnProducts = async (
  userId: string,
  bookId: string,
  saleId: string,
  goodsReturnId: string,
  payload: IGoodsReturnProduct
) => {
  const response = await api.post(
    `/api/v1/users/${userId}/books/${bookId}/sales/${saleId}/goods-returns/${goodsReturnId}/products`,
    payload
  );

  return response.data;
};

export const getGoodsReturnProductById = async (
  userId: string,
  bookId: string,
  saleId: string,
  goodsReturnId: string,
  productId: string
) => {
  const response = await api.get(
    `/api/v1/users/${userId}/books/${bookId}/sales/${saleId}/goods-returns/${goodsReturnId}/products/${productId}`
  );

  return response.data;
};

export const updateGoodsReturnProducts = async (
  userId: string,
  bookId: string,
  saleId: string,
  goodsReturnId: string,
  productId: string,
  payload: IGoodsReturnProduct
) => {
  const response = await api.put(
    `/api/v1/users/${userId}/books/${bookId}/sales/${saleId}/goods-returns/${goodsReturnId}/products/${productId}`,
    payload
  );

  return response.data;
};

export const deleteGoodsReturnProducts = async (
  userId: string,
  bookId: string,
  saleId: string,
  goodsReturnId: string,
  productId: string
) => {
  const response = await api.delete(
    `/api/v1/users/${userId}/books/${bookId}/sales/${saleId}/goods-returns/${goodsReturnId}/products/${productId}`
  );

  return response.data;
};
