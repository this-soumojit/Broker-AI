import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { CheckCircle2, Crown, X, AlertTriangle } from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";
import {
  createPlanPayment,
  initiateCashfreePayment,
  getUserSubscription,
  downgradePlan,
} from "@/services/payment";
import { useToast } from "@/hooks/use-toast";
import PageLoader from "@/components/page-loader";
import { Badge } from "@/components/ui/badge";
import CountdownButton from "@/components/countdown-button";

const UpgradePlans = () => {
  const navigate = useNavigate();
  const { userId: urlUserId } = useParams();
  const [paymentLoading, setPaymentLoading] = useState(false);
  const [downgradeLoading, setDowngradeLoading] = useState(false);
  const [currentSubscription, setCurrentSubscription] = useState<any>(null);
  const [subscriptionLoading, setSubscriptionLoading] = useState(true);
  const { showSuccess, showError } = useToast();

  // Get userId from localStorage if not in URL params
  const getUserId = () => {
    if (urlUserId && urlUserId !== "payment") {
      return urlUserId;
    }

    const user = localStorage.getItem("user");
    if (user) {
      try {
        const userData = JSON.parse(user);
        const actualUserId = userData.id || userData._id || userData.userId;
        return actualUserId;
      } catch (error) {
        console.error("Failed to parse user data:", error);
      }
    }

    return null;
  };

  const userId = getUserId();

  // Fetch current subscription on component mount
  useEffect(() => {
    const fetchCurrentSubscription = async () => {
      if (userId) {
        try {
          setSubscriptionLoading(true);
          const subscription = await getUserSubscription(userId);
          setCurrentSubscription(subscription.data);
        } catch (error) {
          console.error("Failed to fetch subscription:", error);
        } finally {
          setSubscriptionLoading(false);
        }
      } else {
        setSubscriptionLoading(false);
      }
    };

    fetchCurrentSubscription();
  }, [userId]);

  // Redirect to correct URL if accessed via /payment/upgrade
  useEffect(() => {
    if (urlUserId === "payment" && userId) {
      navigate(`/${userId}/upgrade`, { replace: true });
    } else if (urlUserId === "payment" && !userId) {
      navigate("/auth/login", { replace: true });
    }
  }, [urlUserId, userId, navigate]);

  if (urlUserId === "payment" || !userId) {
    return <PageLoader isLoading={true} />;
  }

  // const handleGoBack = () => {
  //   navigate(-1);
  // };

  const handlePlanSelect = async (plan: any) => {
    if (!userId) {
      showError("User ID not found. Please log in again.");
      return;
    }

    if (plan.price === "Free") {
      try {
        setPaymentLoading(true);
        await createPlanPayment(userId, {
          planName: "Basic",
          planPrice: 0,
          duration: 0,
        });
        showSuccess("Basic plan activated successfully!");
        setTimeout(() => window.location.reload(), 1000);
      } catch (error: any) {
        console.error("Basic plan error:", error);
        showError(
          error.response?.data?.message || "Failed to activate basic plan"
        );
      } finally {
        setPaymentLoading(false);
      }
      return;
    }

    if (plan.cta === "Contact Support") {
      window.location.href = "mailto:sales@yourcompany.com";
      return;
    }

    try {
      setPaymentLoading(true);
      const priceNumber = parseFloat(plan.price.replace("₹", ""));
      const response = await createPlanPayment(userId, {
        planName: plan.name,
        planPrice: priceNumber,
        duration: 1,
      });

      if (response.data) {
        const paymentResult = await initiateCashfreePayment({
          paymentSessionId: response.data.paymentSessionId,
          orderToken: response.data.orderToken,
          orderId: response.data.orderId,
        });

        if (paymentResult && paymentResult.status === "success") {
          showSuccess(`${plan.name} plan payment completed!`);
          setTimeout(() => window.location.reload(), 2000);
        }
      }
    } catch (error: any) {
      console.error("Payment error:", error);
      showError(error.response?.data?.message || "Failed to initiate payment");
    } finally {
      setPaymentLoading(false);
    }
  };

  const handleDowngrade = async (planName: string) => {
    if (!userId) {
      showError("User ID not found. Please log in again.");
      return;
    }

    try {
      setDowngradeLoading(true);
      await downgradePlan(userId, { planName });
      showSuccess(`Successfully downgraded to ${planName} plan!`);
      setTimeout(() => window.location.reload(), 1000);
    } catch (error: any) {
      console.error("Downgrade error:", error);
      console.error("Error response:", error.response);
      console.error("Error data:", error.response?.data);
      showError(
        error.response?.data?.message ||
          error.message ||
          "Failed to downgrade plan"
      );
    } finally {
      setDowngradeLoading(false);
    }
  };

  const plans = [
    {
      name: "Basic",
      price: "Free",
      period: "forever",
      description:
        "Essential tools for individual sellers and small businesses",
      features: [
        { text: "Up to 5 clients", included: true },
        { text: "1 book/product in inventory", included: true },
        { text: "Up to 20 invoices/month", included: true },
        { text: "Email support (48hr response)", included: true },
        { text: "Payment reminders", included: false },
        { text: "AI-powered insights", included: false },
        { text: "WhatsApp/email automation", included: false },
      ],
      cta: "Start Free",
      recommended: false,
    },
    {
      name: "Professional",
      subtitle: "Pay As You Go",
      price: "₹999",
      period: "/month",
      description: "For growing businesses needing full flexibility",
      features: [
        { text: "Unlimited clients", included: true },
        { text: "Unlimited books/products", included: true },
        { text: "Unlimited invoices", included: true },
        { text: "AI-powered business insights", included: true },
        { text: "Automated payment reminders", included: true },
        { text: "Bulk send to WhatsApp/email", included: true },
        { text: "Priority call & chat support", included: true },
      ],
      cta: "Upgrade Now",
      recommended: true,
    },
    {
      name: "Enterprise",
      price: "₹2999",
      period: "/month",
      description: "Complete solution for established businesses",
      features: [
        { text: "Everything in Professional", included: true },
        { text: "Multi-user access with roles", included: true },
        { text: "API for custom integrations", included: true },
        { text: "Advanced analytics dashboard", included: true },
        { text: "White-label branding", included: true },
        { text: "Dedicated account manager", included: true },
        { text: "Custom onboarding & training", included: true },
      ],
      cta: "Contact Support",
      recommended: false,
    },
  ];

  return (
    <div className="container mx-auto py-6 space-y-6">
      <PageLoader isLoading={paymentLoading || downgradeLoading} />

      {/* Back button */}
      {/* <div className="mb-6">
        <Button
          variant="ghost"
          size="icon"
          onClick={handleGoBack}
          className="text-muted-foreground hover:text-foreground"
          title="Go Back"
        >
          <ArrowLeft className="w-5 h-5" />
        </Button>
      </div> */}

      {/* Current Subscription Status */}
      {!subscriptionLoading && currentSubscription && (
        <Card className="shadow-sm">
          <CardHeader className="bg-muted/50">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Crown className="w-5 h-5 text-primary" />
                <CardTitle className="text-lg">Your Current Plan</CardTitle>
              </div>
              <Badge
                variant={
                  currentSubscription.status === "ACTIVE"
                    ? "default"
                    : "secondary"
                }
                className="cursor-default"
              >
                {currentSubscription.status}
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <p className="text-xl font-semibold">
                  {currentSubscription.planName}
                </p>
                <p className="text-sm text-muted-foreground">
                  {currentSubscription.planPrice > 0
                    ? `₹${currentSubscription.planPrice}/month`
                    : "Free plan"}
                </p>
                {currentSubscription.endDate && (
                  <p className="text-sm text-muted-foreground">
                    Renews on:{" "}
                    {new Date(currentSubscription.endDate).toLocaleDateString()}
                  </p>
                )}
              </div>
              <CheckCircle2 className="w-8 h-8 text-green-500" />
            </div>
          </CardContent>
        </Card>
      )}

      {/* Page Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            Choose Your Perfect Plan
          </h1>
          <p className="text-muted-foreground">
            Select the package that matches your business needs and scale
            effortlessly
          </p>
        </div>
      </div>

      <div
        className={`grid gap-8 ${
          currentSubscription?.planName === "Professional" ||
          currentSubscription?.planName === "Enterprise"
            ? "md:grid-cols-1 lg:grid-cols-2" // Only 2 plans when Professional/Enterprise user
            : "md:grid-cols-2 lg:grid-cols-3" // All 3 plans for Basic users or no subscription
        }`}
      >
        {plans
          .filter((plan) => {
            // Hide Basic plan if user has Professional or Enterprise subscription
            if (plan.name === "Basic" && currentSubscription) {
              return (
                currentSubscription.planName === "Basic" ||
                !currentSubscription.planName
              );
            }
            return true;
          })
          .map((plan) => (
            <Card
              key={plan.name}
              className={`h-full flex flex-col ${
                plan.recommended ? "border-2 border-primary" : ""
              } ${
                currentSubscription?.planName === plan.name
                  ? "border-2 border-green-500 bg-green-50/30"
                  : ""
              }`}
            >
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="text-2xl">{plan.name}</CardTitle>
                    {plan.subtitle && (
                      <p className="text-sm text-muted-foreground font-medium mt-1">
                        {plan.subtitle}
                      </p>
                    )}
                    <CardDescription>{plan.description}</CardDescription>
                  </div>
                  {currentSubscription?.planName === plan.name && (
                    <Badge variant="outline">Current Plan</Badge>
                  )}
                </div>
                {plan.recommended && (
                  <div className="w-fit px-3 py-1 text-sm font-medium bg-primary/10 text-primary rounded-full">
                    Most Popular
                  </div>
                )}
              </CardHeader>
              <CardContent className="flex-grow">
                <div className="mb-6">
                  <p className="text-4xl font-bold">
                    {plan.price}
                    {plan.period && (
                      <span className="text-base font-normal text-muted-foreground">
                        {plan.period}
                      </span>
                    )}
                  </p>
                </div>

                <ul className="space-y-3 mb-8">
                  {plan.features.map((feature, index) => (
                    <li key={index} className="flex items-start">
                      {feature.included ? (
                        <CheckCircle2 className="h-5 w-5 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                      ) : (
                        <X className="h-5 w-5 text-red-500 mr-2 mt-0.5 flex-shrink-0" />
                      )}
                      <span
                        className={
                          feature.included ? "" : "text-muted-foreground"
                        }
                      >
                        {feature.text}
                      </span>
                    </li>
                  ))}
                </ul>

                <Button
                  variant={
                    currentSubscription?.planName === plan.name
                      ? "secondary"
                      : "default"
                  }
                  size="lg"
                  className="w-full"
                  onClick={() => handlePlanSelect(plan)}
                  disabled={
                    paymentLoading ||
                    downgradeLoading ||
                    currentSubscription?.planName === plan.name
                  }
                >
                  {paymentLoading
                    ? "Processing..."
                    : currentSubscription?.planName === plan.name
                    ? "Current Plan"
                    : plan.cta}
                </Button>
              </CardContent>
            </Card>
          ))}
      </div>

      {/* Downgrade Section - Bottom of page */}
      {currentSubscription &&
        currentSubscription.status === "ACTIVE" &&
        (currentSubscription.planName === "Professional" ||
          currentSubscription.planName === "Enterprise") &&
        !subscriptionLoading && (
          <Card className="border-amber-200 bg-amber-50/30 mt-8">
            <CardContent className="pt-6">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div className="flex items-start gap-3">
                  <AlertTriangle className="w-5 h-5 text-amber-600 mt-0.5 flex-shrink-0" />
                  <div>
                    <h3 className="font-semibold text-amber-800 mb-1">
                      Want to downgrade your plan?
                    </h3>
                    <p className="text-sm text-amber-700">
                      You can downgrade to a lower tier plan. Please note that
                      no refunds will be processed.
                    </p>
                  </div>
                </div>
                <div className="flex flex-wrap gap-3 flex-shrink-0">
                  {currentSubscription.planName === "Enterprise" && (
                    <CountdownButton
                      onConfirm={() => handleDowngrade("Professional")}
                      disabled={paymentLoading || downgradeLoading}
                      countdownSeconds={5}
                      variant="default"
                      warningMessage={`⚠️ No refund will be processed for your current ${currentSubscription?.planName} plan (₹${currentSubscription?.planPrice}). You will lose access to Enterprise features immediately.`}
                    >
                      Downgrade to Professional
                    </CountdownButton>
                  )}
                  <CountdownButton
                    onConfirm={() => handleDowngrade("Basic")}
                    disabled={paymentLoading || downgradeLoading}
                    countdownSeconds={5}
                    variant="default"
                    warningMessage={`⚠️ No refund will be processed for your current ${currentSubscription?.planName} plan (₹${currentSubscription?.planPrice}). You will lose access to premium features immediately.`}
                  >
                    Downgrade to Basic
                  </CountdownButton>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
    </div>
  );
};

export default UpgradePlans;
