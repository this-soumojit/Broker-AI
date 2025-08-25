import {
  IRegisterUserPayload,
  IAuthenticateUserPayload,
  IConfirmForgotPasswordOtpPayload,
  IConfirmSignUpOtpPayload,
  IInitiateForgotPasswordPayload,
  IRequestResendForgotPasswordOtpPayload,
  IRequestResendSignUpOtpPayload,
  IResetPasswordPayload,
} from "@/services/auth/interface";
import api from "@/services/api";

export const registerUser = async (payload: IRegisterUserPayload) => {
  const response = await api.post("/api/v1/auth/signup", payload);
  return response.data;
};

export const confirmSignUpOtp = async (payload: IConfirmSignUpOtpPayload) => {
  const response = await api.post("/api/v1/auth/signup/otp/verify", payload);
  return response.data;
};

export const requestResendSignUpOtp = async (
  payload: IRequestResendSignUpOtpPayload
) => {
  const response = await api.post("/api/v1/auth/signup/otp/resend", payload);
  return response.data;
};

export const authenticateUser = async (payload: IAuthenticateUserPayload) => {
  const response = await api.post("/api/v1/auth/login", payload);
  return response.data;
};

export const initiateForgotPassword = async (
  payload: IInitiateForgotPasswordPayload
) => {
  const response = await api.post("/api/v1/auth/forgot-password", payload);
  return response.data;
};

export const confirmForgotPasswordOtp = async (
  payload: IConfirmForgotPasswordOtpPayload
) => {
  const response = await api.post(
    "/api/v1/auth/forgot-password/otp/verify",
    payload
  );
  return response.data;
};

export const requestResendForgotPasswordOtp = async (
  payload: IRequestResendForgotPasswordOtpPayload
) => {
  const response = await api.post(
    "/api/v1/auth/forgot-password/otp/resend",
    payload
  );
  return response.data;
};

export const resetPassword = async (payload: IResetPasswordPayload) => {
  const response = await api.post(
    "/api/v1/auth/forgot-password/set-new-password",
    payload
  );
  return response.data;
};

export const getUserProfile = async () => {
  const response = await api.get("/api/v1/users/me");
  return response.data;
};

// services/auth.ts

export const updateUserProfile = async (
  userId: string,
  payload: {
    name: string;
    phone: string;
    currentPassword: string;
    newPassword: string;
  }
) => {
  const response = await api.put(`/api/v1/users/${userId}`, payload);
  return response.data;
};

