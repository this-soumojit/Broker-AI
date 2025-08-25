import { ISalePayment } from "@/interfaces";
import api from "../api";

export const addSaleCommission = async (
userId: string,
bookId: string,
saleId: string,
salePaymentId: string,
payload: ISalePayment
) => {
    const response = await api.post(
        `api/v1/users/${userId}/books/${bookId}/sales/${saleId}/payments/${salePaymentId}/commissions`,
        payload
    );
    return response.data;
};

export const getSaleCommissions = async (
userId: string,
bookId: string,
saleId: string,
salePaymentId: string
) => {
    const response = await api.get(
        `api/v1/users/${userId}/books/${bookId}/sales/${saleId}/payments/${salePaymentId}/commissions`
    );
    return response.data;
};

export const getSaleCommissionById = async (
userId: string,
bookId: string,
saleId: string,
salePaymentId: string,
commissionId: string
) => {
    const response = await api.get(
        `api/v1/users/${userId}/books/${bookId}/sales/${saleId}/payments/${salePaymentId}/commissions/${commissionId}`
    );
    return response.data;
};

export const updateSalePayment = async (
userId: string,
bookId: string,
saleId: string,
salePaymentId: string,
commissionId: string,
payload: ISalePayment
) => {
    const response = await api.put(
        `api/v1/users/${userId}/books/${bookId}/sales/${saleId}/payments/${salePaymentId}/commissions/${commissionId}`,
        payload
    );
    return response.data;
};

export const deleteSalePayment = async (
userId: string,
bookId: string,
saleId: string,
salePaymentId: string,
commissionId: string
) => {
    const response = await api.delete(
        `api/v1/users/${userId}/books/${bookId}/sales/${saleId}/payments/${salePaymentId}/commissions/${commissionId}`
    );
    return response.data;
};