import { ISalePayment } from "@/interfaces";
import api from "../api";

export const addSalePayment = async (
userId: string,
bookId: string,
saleId: string,
payload: ISalePayment
) => {
    const response = await api.post(
        `api/v1/users/${userId}/books/${bookId}/sales/${saleId}/payments`,
        payload
    );
    return response.data;
};

export const getSalePayments = async (
userId: string,
bookId: string,
saleId: string
) => {
    const response = await api.get(
        `api/v1/users/${userId}/books/${bookId}/sales/${saleId}/payments`
    );
    return response.data;
};

export const getSalePaymentById = async (
userId: string,
bookId: string,
saleId: string,
paymentId: string
) => {
    const response = await api.get(
        `api/v1/users/${userId}/books/${bookId}/sales/${saleId}/payments/${paymentId}`
    );
    return response.data;
};

export const updateSalePayment = async (
userId: string,
bookId: string,
saleId: string,
paymentId: string,
payload: ISalePayment
) => {
    const response = await api.put(
        `api/v1/users/${userId}/books/${bookId}/sales/${saleId}/payments/${paymentId}`,
        payload
    );
    return response.data;
};

export const deleteSalePayment = async (
userId: string,
bookId: string,
saleId: string,
paymentId: string
) => {
    const response = await api.delete(
        `api/v1/users/${userId}/books/${bookId}/sales/${saleId}/payments/${paymentId}`
    );
    return response.data;
};