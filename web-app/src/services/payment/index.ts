import api from "../api";
import { IPaymentResponse, IUserSubscription } from "@/interfaces";

export const createPlanPayment = async (
  userId: string,
  planData: {
    planName: string;
    planPrice: number;
    duration?: number;
  }
) => {
  const response = await api.post<{ data: IPaymentResponse }>(
    `/api/v1/users/${userId}/subscriptions`,
    planData
  );
  return response.data;
};

export const getUserSubscription = async (userId: string) => {
  const response = await api.get<{ data: IUserSubscription }>(
    `/api/v1/users/${userId}/subscriptions`
  );
  return response.data;
};

export const checkPaymentStatus = async (
  userId: string,
  orderId: string
): Promise<any> => {
  const response = await api.get(
    `/api/v1/users/${userId}/subscriptions/status?orderId=${orderId}`
  );
  return response.data;
};

export const initiateCashfreePayment = async (paymentData: {
  paymentSessionId: string;
  orderToken: string;
  orderId: string;
}): Promise<any> => {
  return new Promise((resolve, reject) => {
    if (!window.Cashfree) {
      reject(new Error("Cashfree SDK not loaded"));
      return;
    }

    const cashfree = window.Cashfree({
      mode: process.env.NODE_ENV === "production" ? "production" : "sandbox",
    });

    cashfree
      .checkout({
        paymentSessionId: paymentData.paymentSessionId,
        returnUrl: `${window.location.origin}/payment/success?order_id=${paymentData.orderId}`,
      })
      .then((result: any) => {
        if (result.error) {
          reject(new Error(result.error.message));
        } else {
          resolve(result);
        }
      });
  });
};

export const downgradePlan = async (
  userId: string,
  planData: {
    planName: string;
  }
) => {
  const response = await api.post<{ data: IUserSubscription }>(
    `/api/v1/users/${userId}/subscriptions/downgrade`,
    planData
  );
  return response.data;
};

export const checkSubscriptionStatus = async (userId: string) => {
  try {
    const response = await getUserSubscription(userId);
    return {
      hasActiveSubscription: response.data?.status === "ACTIVE",
      subscription: response.data,
      planName: response.data?.planName || "Basic",
    };
  } catch (error) {
    return {
      hasActiveSubscription: false,
      subscription: null,
      planName: "Basic",
    };
  }
};
