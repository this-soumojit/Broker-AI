import { IGoodsReturn } from "@/interfaces";
import api from "../api";

export const getGoodsReturns = async (
  userId: string,
  bookId: string,
  saleId: string  
) => {
  const response = await api.get(
    `/api/v1/users/${userId}/books/${bookId}/sales/${saleId}/goods-returns`
  );
  return response.data;
};

export const getGoodsReturnById = async (
  userId: string,
  bookId: string,
  saleId: string,
  goodsReturnId: string
) => {
  const response = await api.get(
    `/api/v1/users/${userId}/books/${bookId}/sales/${saleId}/goods-returns/${goodsReturnId}`
  );
  return response.data;
};

export const createGoodsReturn = async (
  userId: string,
  bookId: string,
  saleId: string,
  payload: IGoodsReturn
) => {
  const response = await api.post(
    `/api/v1/users/${userId}/books/${bookId}/sales/${saleId}/goods-returns`,
    payload
  );
  return response.data;
};

export const updateGoodsReturn = async (
  userId: string,
  bookId: string,
  saleId: string,
  goodsReturnId: string,
  payload: IGoodsReturn
) => {
  const response = await api.put(
    `/api/v1/users/${userId}/books/${bookId}/sales/${saleId}/goods-returns/${goodsReturnId}`,
    payload
  );
  return response.data;
};

export const deleteGoodsReturn = async (
  userId: string,
  bookId: string,
  saleId: string,
  goodsReturnId: string
) => {
  const response = await api.delete(
    `/api/v1/users/${userId}/books/${bookId}/sales/${saleId}/goods-returns/${goodsReturnId}`,
  );
  return response.data;
};

