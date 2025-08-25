import { IClient, IAccessibleClientsResponse } from "@/interfaces";
import api from "@/services/api";

export const addClient = async (userId: string, payload: IClient) => {
  const response = await api.post(`/api/v1/users/${userId}/clients`, payload);
  return response.data;
};

export const getClients = async (userId: string, params: string) => {
  const response = await api.get(`/api/v1/users/${userId}/clients?${params}`);
  return response.data;
};

export const getClientById = async (userId: string, clientId: string) => {
  const response = await api.get(`/api/v1/users/${userId}/clients/${clientId}`);
  return response.data;
};

export const updateClient = async (
  userId: string,
  clientId: string,
  payload: IClient
) => {
  const response = await api.put(
    `/api/v1/users/${userId}/clients/${clientId}`,
    payload
  );
  return response.data;
};

export const getClientStats = async (userId: string) => {
  const response = await api.get(`/api/v1/users/${userId}/clients/stats`);
  return response.data;
};

export const deleteClient = async (userId: string, clientId: string) => {
  const response = await api.delete(
    `/api/v1/users/${userId}/clients/${clientId}`
  );
  return response.data;
};

export const getAccessibleClients = async (
  userId: string
): Promise<IAccessibleClientsResponse> => {
  const response = await api.get(`/api/v1/users/${userId}/clients/accessible`);
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
