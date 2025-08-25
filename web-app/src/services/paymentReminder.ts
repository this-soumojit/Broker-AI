import axios from "axios";
import { notificationService } from "./notifications";

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "http://localhost:8000/api/v1";

export interface PaymentReminderData {
  saleId: string;
  invoiceNumber: string;
  buyerName: string;
  buyerPhone: string;
  sellerName: string;
  amount: number;
  commissionRate: number;
  commissionAmount: number;
  dueDate: string;
  daysUntilDue: number;
  isOverdue: boolean;
  status: string;
}

export interface PaymentReminderStats {
  total: number;
  overdue: number;
  dueToday: number;
  dueSoon: number;
  payments: PaymentReminderData[];
}

export interface SendReminderResponse {
  success: number;
  failed: number;
  total: number;
  details?: Array<{
    invoiceNumber: string;
    buyer: string;
    whatsapp: boolean;
    email: { buyer: boolean; seller: boolean; broker: boolean };
  }>;
}

export interface SendSpecificReminderResponse {
  success: boolean;
  whatsapp: boolean;
  email: { buyer: boolean; seller: boolean; broker: boolean };
}

export interface SendReminderRequest {
  testMode?: boolean;
}

/**
 * Get upcoming due payments
 */
export const getUpcomingDuePayments = async (
  userId: string,
  token: string
): Promise<{ data: PaymentReminderStats }> => {
  const url = `${API_BASE_URL}/users/${userId}/payment-reminders/upcoming`;
  console.log("Making request to:", url);
  console.log("With token:", token.substring(0, 20) + "...");

  const response = await axios.get(url, {
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
  });

  console.log("API response:", response.data);
  return response.data;
};

/**
 * Send payment reminders to all users
 */
export const sendPaymentReminders = async (
  userId: string,
  token: string,
  options: SendReminderRequest = {}
): Promise<{ data: SendReminderResponse }> => {
  try {
    const response = await axios.post(
      `${API_BASE_URL}/users/${userId}/payment-reminders/send`,
      options,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      }
    );

    // Add notification for bulk reminder
    const result = response.data.data;
    notificationService.addBulkReminderNotification(result);

    return response.data;
  } catch (error) {
    notificationService.addNotification({
      type: "error",
      title: "Payment Reminders Failed",
      message: "Failed to send bulk payment reminders. Please try again.",
    });
    throw error;
  }
};

/**
 * Send reminder for specific sale
 */
export const sendSpecificReminder = async (
  userId: string,
  saleId: string,
  token: string,
  buyerName: string,
  invoiceNumber: string,
  options: { preferWhatsApp?: boolean } = {}
): Promise<{ data: SendSpecificReminderResponse }> => {
  try {
    const response = await axios.post(
      `${API_BASE_URL}/users/${userId}/payment-reminders/send/${saleId}`,
      options,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      }
    );

    // Add notification for specific reminder
    const result = response.data.data;
    notificationService.addPaymentReminderNotification(
      invoiceNumber,
      buyerName,
      result.success,
      {
        whatsapp: result.whatsapp,
        email: result.email,
      }
    );

    return response.data;
  } catch (error) {
    notificationService.addPaymentReminderNotification(
      invoiceNumber,
      buyerName,
      false
    );
    throw error;
  }
};
