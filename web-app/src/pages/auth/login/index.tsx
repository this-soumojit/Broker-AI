import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { Eye, EyeOff, ShieldCheck } from "lucide-react";

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
import PageLoader from "@/components/page-loader";
import { LoginFormValues, loginFormSchema } from "@/pages/auth/login/interface";
import { useToast } from "@/hooks/use-toast";
import { authenticateUser, getUserProfile } from "@/services/auth";
import { getUserSubscription } from "@/services/payment";

const defaultValues: Partial<LoginFormValues> = {
  email: "",
  password: "",
};

export default function LoginPage() {
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const { showError } = useToast();

  const form = useForm<LoginFormValues>({
    resolver: zodResolver(loginFormSchema),
    defaultValues,
  });

  async function onSubmit() {
    setIsLoading(true);

    try {
      const {
        data: { token: newToken },
      } = await authenticateUser(form.getValues());

      localStorage.setItem("token", newToken);

      const { data } = await getUserProfile();

      if (data) {
        localStorage.setItem("user", JSON.stringify(data));

        // Check if user has an active subscription
        try {
          const subscription = await getUserSubscription(data.id);
          if (subscription.data) {
            // User has subscription, go to dashboard
            navigate(`/${data.id}/dashboard`);
          } else {
            // New user without subscription, go to upgrade page
            navigate(`/${data.id}/upgrade`);
          }
        } catch (error) {
          // If subscription check fails, assume new user and redirect to upgrade
          console.log("No subscription found, redirecting to upgrade page");
          navigate(`/${data.id}/upgrade`);
        }
      }
    } catch (error) {
      showError(error);
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4 py-12 sm:px-6 lg:px-8">
      <PageLoader isLoading={isLoading} />
      <div className="w-full max-w-md space-y-8">
        <div className="text-center">
          <h2 className="mt-6 text-3xl font-extrabold text-gray-900">
            Welcome back
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            Sign in to access your account
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="text-2xl font-bold">Sign In</CardTitle>
            <CardDescription>
              Enter your credentials to access your account
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form
                onSubmit={form.handleSubmit(onSubmit)}
                className="space-y-6"
              >
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="your.email@company.com"
                          type="email"
                          autoComplete="email"
                          disabled={isLoading}
                          {...field}
                        />
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
                            autoComplete="current-password"
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

                <div className="pt-2">
                  <Button type="submit" className="w-full" disabled={isLoading}>
                    {isLoading ? (
                      <>
                        <span className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-t-transparent" />
                        Signing In...
                      </>
                    ) : (
                      "Sign In"
                    )}
                  </Button>
                </div>
              </form>
            </Form>
          </CardContent>
          <CardFooter className="flex flex-col gap-4">
            <div className="text-sm text-center">
              <a
                href="/auth/forgot-password"
                className="font-medium text-primary hover:text-primary/90"
              >
                Forgot your password?
              </a>
            </div>
            <div className="text-center text-sm">
              <span className="text-muted-foreground">
                Don't have an account?{" "}
              </span>
              <a
                href="/auth/sign-up"
                className="font-medium text-primary hover:text-primary/90"
              >
                Sign up
              </a>
            </div>
            <div className="flex items-center justify-center mt-2">
              <ShieldCheck className="h-4 w-4 text-muted-foreground mr-1" />
              <span className="text-xs text-muted-foreground">
                Secure login protected by enterprise-grade encryption
              </span>
            </div>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}
