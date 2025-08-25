import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import {
  Eye,
  EyeOff,
  ShieldCheck,
  User,
  Mail,
  Phone,
  Check,
  ArrowLeft,
  ArrowRight,
} from "lucide-react";
import countryCodeData from "@/assets/phone-country-code.json";

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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  SignUpFormValues,
  signUpFormSchema,
} from "@/pages/auth/sign-up/interface";
import { useToast } from "@/hooks/use-toast";
import PageLoader from "@/components/page-loader";
import {
  registerUser,
  confirmSignUpOtp,
  requestResendSignUpOtp,
  getUserProfile,
} from "@/services/auth";

const defaultValues: Partial<SignUpFormValues> = {
  name: "",
  email: "",
  phone: "",
  phoneCode: "+91", // Default to India's country code
  password: "",
  otp: "",
};

export default function SignUpPage() {
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const { showError, showSuccess } = useToast();

  const form = useForm<SignUpFormValues>({
    resolver: zodResolver(signUpFormSchema),
    defaultValues,
  });

  const steps = ["Basic Information", "Verify OTP"];

  const onBasicInformationSubmit = async () => {
    setIsLoading(true);

    try {
      const formData = form.getValues();
      // Concatenate phone code (without +) with phone number
      const phoneCodeWithoutPlus = formData.phoneCode.replace('+', '');
      const fullPhoneNumber = `${phoneCodeWithoutPlus}${formData.phone}`;
      
      await registerUser({
        ...formData,
        phone: fullPhoneNumber,
      });
      
      showSuccess(
        "Account created successfully! Please check your email for the OTP."
      );
      
      // Reset form and preserve only necessary data
      form.reset({
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        phoneCode: formData.phoneCode,
        password: formData.password,
        otp: "",
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
      } = await confirmSignUpOtp({
        email: form.getValues("email"),
        otp,
      });

      localStorage.setItem("token", token);

      const { data } = await getUserProfile();

      if (data) {
        localStorage.setItem("user", JSON.stringify(data));
        showSuccess(
          "Registration successful! Welcome to MitraAI. Choose your plan to get started."
        );
        navigate(`/${data.id}/upgrade`);
      }
    } catch (error) {
      showError(error);
    } finally {
      setIsLoading(false);
    }
  };

  const onRequestSignUpOtp = async () => {
    setIsLoading(true);

    try {
      await requestResendSignUpOtp({
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
              onSubmit={form.handleSubmit(onBasicInformationSubmit, (data) => {
                console.log(data);
              })}
              className="space-y-4"
            >
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Full Name</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Input
                          placeholder="John Doe"
                          disabled={isLoading}
                          {...field}
                        />
                        <User className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="phone"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Phone Number</FormLabel>
                    <FormControl>
                      <div className="relative flex gap-2">
                        <FormField
                          control={form.control}
                          name="phoneCode"
                          render={({ field }) => (
                            <FormItem>
                              <Select
                                onValueChange={field.onChange}
                                value={field.value}
                                disabled={isLoading}
                              >
                                <SelectTrigger className="w-[120px]">
                                  <SelectValue placeholder="+91" />
                                </SelectTrigger>
                                <SelectContent side="bottom" className="max-h-[250px] overflow-y-auto">
                                  {countryCodeData.map((country) => (
                                    <SelectItem key={country.code} value={country.dial_code}>
                                      {country.name} ({country.dial_code})
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            </FormItem>
                          )}
                        />
                        <div className="relative flex-1">
                          <Input
                            placeholder="1234567890"
                            type="tel"
                            maxLength={10}
                            disabled={isLoading}
                            {...field}
                          />
                          <Phone className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        </div>
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

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
          <Form {...form} key="otp-form">
            <form
              onSubmit={form.handleSubmit(onOtpVerification)}
              className="space-y-4"
            >
              <div className="text-center mb-4">
                <p className="text-sm text-muted-foreground">
                  We've sent a 6-digit OTP to{" "}
                  <strong>{form.getValues("email")}</strong>. Please enter it
                  below to verify your account and complete your registration.
                </p>
              </div>

              <FormField
                key={`otp-field-${currentStep}`}
                control={form.control}
                name="otp"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>One-Time Password (OTP)</FormLabel>
                    <FormControl>
                      <Input
                        key="otp-input"
                        placeholder="123456"
                        type="text"
                        maxLength={6}
                        className="text-center text-lg tracking-widest"
                        disabled={isLoading}
                        autoComplete="one-time-code"
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
                      Signing you in...
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
                  onClick={onRequestSignUpOtp}
                  disabled={isLoading}
                >
                  Didn't receive OTP? Resend
                </Button>
              </div>
            </form>
          </Form>
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
            Create an Account
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            Join our platform to access enterprise features
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="text-2xl font-bold">Sign Up</CardTitle>
            <CardDescription>
              Complete the steps below to create your account
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
                Already have an account?{" "}
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
