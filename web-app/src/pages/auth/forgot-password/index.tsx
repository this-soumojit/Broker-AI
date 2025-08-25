import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import {
  Eye,
  EyeOff,
  ShieldCheck,
  Mail,
  Check,
  ArrowLeft,
  ArrowRight,
  AlertCircle,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import PageLoader from "@/components/page-loader";
import {
  initiateForgotPassword,
  confirmForgotPasswordOtp,
  requestResendForgotPasswordOtp,
  resetPassword,
} from "@/services/auth";
import {
  forgotPasswordFormSchema,
  ForgotPasswordFormValues,
} from "@/pages/auth/forgot-password/interface";

// FIXME: Remove this after testing
const defaultValues: Partial<ForgotPasswordFormValues> = {
  email: "",
  password: "Password@123",
  confirmPassword: "Password@123",
  otp: undefined,
};

export default function ForgotPasswordPage() {
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [isPasswordReset, setIsPasswordReset] = useState(false);

  const { showError, showSuccess } = useToast();

  const form = useForm<ForgotPasswordFormValues>({
    resolver: zodResolver(forgotPasswordFormSchema),
    defaultValues,
  });

  const steps = ["Enter Email", "Verify OTP", "Reset Password", "Success"];

  const onEmailSubmit = async () => {
    setIsLoading(true);

    try {
      await initiateForgotPassword({
        email: form.getValues("email"),
      });

      setCurrentStep(1);
    } catch (error) {
      showError(error);
    } finally {
      setIsLoading(false);
    }
  };

  const onOtpVerification = async () => {
    const otp = form.getValues("otp");

    if (!otp) {
      showError("Please enter your OTP.");
      return;
    }

    setIsLoading(true);

    try {
      const {
        data: { token },
      } = await confirmForgotPasswordOtp({
        email: form.getValues("email"),
        otp,
      });

      form.setValue("password", "");
      form.setValue("confirmPassword", "");

      localStorage.setItem("token", token);

      setCurrentStep(2);
    } catch (error) {
      showError(error);
    } finally {
      setIsLoading(false);
    }
  };

  const onNavigateToLogin = () => navigate("/auth/login");

  const onResetPassword = async () => {
    setIsLoading(true);

    try {
      await resetPassword({
        password: form.getValues("password"),
        confirmPassword: form.getValues("confirmPassword"),
      });

      setIsPasswordReset(true);
      setCurrentStep(3);
    } catch (error) {
      showError(error);
    } finally {
      setIsLoading(false);
    }
  };

  const onRequestForgotPasswordOtp = async () => {
    setIsLoading(true);

    try {
      await requestResendForgotPasswordOtp({
        email: form.getValues("email"),
      });

      showSuccess("OTP has been resent successfully.");
    } catch (error) {
      showError(error);
    } finally {
      setIsLoading(false);
    }
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 0:
        return (
          <Form {...form}>
            <form
              onSubmit={form.handleSubmit(onEmailSubmit, (errors) => {
                console.log(errors);
              })}
              className="space-y-4"
            >
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Input
                          placeholder="your.email@company.com"
                          type="email"
                          autoComplete="email"
                          disabled={isLoading}
                          {...field}
                        />
                        <Mail className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="pt-4">
                <Button
                  type="submit"
                  className="w-full hover:cursor-pointer"
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <>
                      <span className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-t-transparent" />
                      Sending OTP...
                    </>
                  ) : (
                    <>
                      Continue <ArrowRight className="ml-2 h-4 w-4" />
                    </>
                  )}
                </Button>
              </div>
            </form>
          </Form>
        );
      case 1:
        return (
          <Form {...form}>
            <form
              onSubmit={form.handleSubmit(onOtpVerification)}
              className="space-y-4"
            >
              <div className="text-center mb-4">
                <p className="text-sm text-muted-foreground">
                  We've sent a 6-digit OTP to your {form.getValues("email")}.
                  Please enter it below to verify your account.
                </p>
              </div>

              <FormField
                control={form.control}
                name="otp"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>One-Time Password (OTP)</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="123456"
                        type="text"
                        maxLength={6}
                        className="text-center text-lg tracking-widest"
                        disabled={isLoading}
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="flex justify-between pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setCurrentStep(0)}
                  disabled={isLoading}
                  className="hover:cursor-pointer"
                >
                  <ArrowLeft className="mr-2 h-4 w-4" /> Back
                </Button>
                <Button
                  type="submit"
                  disabled={isLoading}
                  className="hover:cursor-pointer"
                >
                  {isLoading ? (
                    <>
                      <span className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-t-transparent" />
                      Verifying...
                    </>
                  ) : (
                    <>
                      Verify OTP <ArrowRight className="ml-2 h-4 w-4" />
                    </>
                  )}
                </Button>
              </div>

              <div className="text-center mt-4">
                <Button
                  type="button"
                  variant="link"
                  size="sm"
                  className="text-xs hover:cursor-pointer"
                  onClick={onRequestForgotPasswordOtp}
                  disabled={isLoading}
                >
                  Didn't receive OTP? Resend
                </Button>
              </div>
            </form>
          </Form>
        );

      case 2:
        return (
          <Form {...form}>
            <form
              onSubmit={form.handleSubmit(onResetPassword, (errors) => {
                console.log(errors);
              })}
              className="space-y-4"
            >
              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Password</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Input
                          placeholder="••••••••"
                          type={showPassword ? "text" : "password"}
                          autoComplete="new-password"
                          disabled={isLoading}
                          {...field}
                        />
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          className="absolute right-2 top-1/2 -translate-y-1/2"
                          onClick={() => setShowPassword(!showPassword)}
                        >
                          {showPassword ? (
                            <EyeOff className="h-4 w-4" />
                          ) : (
                            <Eye className="h-4 w-4" />
                          )}
                          <span className="sr-only">
                            {showPassword ? "Hide password" : "Show password"}
                          </span>
                        </Button>
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="confirmPassword"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Confirm Password</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Input
                          placeholder="••••••••"
                          type={showPassword ? "text" : "password"}
                          autoComplete="new-password"
                          disabled={isLoading}
                          {...field}
                        />
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          className="absolute right-2 top-1/2 -translate-y-1/2"
                          onClick={() => setShowPassword(!showPassword)}
                        >
                          {showPassword ? (
                            <EyeOff className="h-4 w-4" />
                          ) : (
                            <Eye className="h-4 w-4" />
                          )}
                          <span className="sr-only">
                            {showPassword ? "Hide password" : "Show password"}
                          </span>
                        </Button>
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <div className="text-center mt-4">
                <Button
                  type="submit"
                  disabled={isLoading}
                  className="w-full hover:cursor-pointer"
                >
                  {isLoading ? (
                    <>
                      <span className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-t-transparent" />
                      Resetting...
                    </>
                  ) : (
                    "Reset Password"
                  )}
                </Button>
              </div>
            </form>
          </Form>
        );
      case 3:
        return (
          <div className="space-y-6 text-center">
            {isPasswordReset ? (
              <>
                <div className="mx-auto bg-green-100 rounded-full p-3 w-16 h-16 flex items-center justify-center">
                  <Check className="h-8 w-8 text-green-600" />
                </div>
                <div>
                  <h3 className="text-xl font-semibold">
                    Password Reset Successful!
                  </h3>
                  <p className="text-muted-foreground mt-2">
                    Your password has been reset successfully. You can now log
                    in with your new password.
                  </p>
                </div>
                <Button
                  onClick={onNavigateToLogin}
                  className="w-full hover:cursor-pointer"
                >
                  Go to Login
                </Button>
              </>
            ) : (
              <>
                <div className="mx-auto bg-red-100 rounded-full p-3 w-16 h-16 flex items-center justify-center">
                  <AlertCircle className="h-8 w-8 text-red-600" />
                </div>
                <div>
                  <h3 className="text-xl font-semibold">
                    Password Reset Failed
                  </h3>
                  <p className="text-muted-foreground mt-2">
                    There was an error resetting your password. Please try
                    again.
                  </p>
                </div>
                <Button
                  onClick={() => setCurrentStep(2)}
                  className="w-full hover:cursor-pointer"
                >
                  Try Again
                </Button>
              </>
            )}
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4 py-12 sm:px-6 lg:px-8">
      <PageLoader isLoading={isLoading} />
      <div className="w-full max-w-md space-y-8">
        <div className="text-center">
          <h2 className="mt-6 text-3xl font-extrabold text-gray-900">
            Forgot Password?
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            Enter your email to reset your password
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="text-2xl font-bold">Reset Password</CardTitle>
            <CardDescription>
              Complete the steps below to reset your password
            </CardDescription>
          </CardHeader>

          <div className="px-6 py-4">
            <div className="w-full flex justify-between mb-8">
              {steps.map((label, index) => (
                <div
                  key={label}
                  className={`flex flex-col items-center ${
                    index <= currentStep
                      ? "text-primary"
                      : "text-muted-foreground"
                  }`}
                >
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center mb-2 
                      ${
                        index < currentStep
                          ? "bg-primary text-white"
                          : index === currentStep
                          ? "border-2 border-primary"
                          : "border-2 border-muted"
                      }`}
                  >
                    {index < currentStep ? (
                      <Check className="h-4 w-4" />
                    ) : (
                      <span>{index + 1}</span>
                    )}
                  </div>
                  <span className="text-xs text-center">{label}</span>
                </div>
              ))}
            </div>
          </div>

          <CardContent>{renderStepContent()}</CardContent>

          <CardFooter className="flex flex-col gap-4">
            <div className="text-center text-sm">
              <span className="text-muted-foreground">
                Remember your password?{" "}
              </span>
              <a
                href="/auth/login"
                className="font-medium text-primary hover:text-primary/90"
              >
                Sign in
              </a>
            </div>
            <div className="flex items-center justify-center mt-2">
              <ShieldCheck className="h-4 w-4 text-muted-foreground mr-1" />
              <span className="text-xs text-muted-foreground">
                Your data is protected with enterprise-grade encryption
              </span>
            </div>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}
