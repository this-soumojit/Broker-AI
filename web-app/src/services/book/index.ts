import api from "@/services/api";
import { IBook } from "@/interfaces";

export const addBook = async (userId: string, payload: IBook) => {
  const response = await api.post(`/api/v1/users/${userId}/books`, payload);
  return response.data;
};

export const getBooks = async (userId: string, params: string) => {
  const response = await api.get(`/api/v1/users/${userId}/books?${params}`);
  return response.data;
};

export const getBookById = async (userId: string, bookId: string) => {
  const response = await api.get(`/api/v1/users/${userId}/books/${bookId}`);
  return response.data;
};

export const updateBook = async (
  userId: string,
  bookId: string,
  payload: IBook
) => {
  const response = await api.put(
    `/api/v1/users/${userId}/books/${bookId}`,
    payload
  );
  return response.data;
};

export const deleteBook = async (userId: string, bookId: string) => {
  const response = await api.delete(`/api/v1/users/${userId}/books/${bookId}`);
  return response.data;
};
export const getBookStats = async (userId: string) => {
  const response = await api.get(`/api/v1/users/${userId}/books/stats`);
  return response.data;
};

export const getAccessibleBooks = async (userId: string) => {
  const response = await api.get(`/api/v1/users/${userId}/books/accessible`);
  return response.data;
};
