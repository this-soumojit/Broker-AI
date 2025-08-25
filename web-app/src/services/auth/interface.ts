export interface IRegisterUserPayload {
  name: string;
  email: string;
  phone: string;
  password: string;
}

export interface IConfirmSignUpOtpPayload {
  email: string;
  otp: string;
}

export interface IRequestResendSignUpOtpPayload {
  email: string;
}

export interface IAuthenticateUserPayload {
  email: string;
  password: string;
}

export interface IInitiateForgotPasswordPayload {
  email: string;
}

export interface IConfirmForgotPasswordOtpPayload {
  email: string;
  otp: string;
}

export interface IRequestResendForgotPasswordOtpPayload {
  email: string;
}

export interface IResetPasswordPayload {
  password: string;
  confirmPassword: string;
}

export interface IUser {
  id: string;
  name: string;
  email: string;
  phone: string;
}
