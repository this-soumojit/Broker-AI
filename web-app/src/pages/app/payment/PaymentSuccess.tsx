import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { checkPaymentStatus } from "@/services/payment";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckCircle, XCircle, Loader2 } from "lucide-react";

const PaymentSuccess = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [status, setStatus] = useState<"checking" | "success" | "failed">("checking");
  const [subscription, setSubscription] = useState<any>(null);

  const orderId = searchParams.get("order_id");

  useEffect(() => {
    const checkStatus = async () => {
      if (!orderId || !user?.id) {
        setStatus("failed");
        return;
      }

      try {
        console.log("Checking payment status for order:", orderId);
        
        // Check status multiple times with delay to handle processing time
        let attempts = 0;
        const maxAttempts = 5;
        
        const checkWithRetry = async () => {
          attempts++;
          console.log(`Payment status check attempt ${attempts}/${maxAttempts}`);
          
          const response = await checkPaymentStatus(user.id, orderId);
          console.log("Payment status response:", response);
          
          if (response.data.orderStatus === "PAID") {
            setStatus("success");
            setSubscription(response.data.subscription);
            return;
          }
          
          if (response.data.orderStatus === "FAILED" || response.data.orderStatus === "CANCELLED") {
            setStatus("failed");
            return;
          }
          
          // If still processing and we have attempts left, retry after delay
          if (attempts < maxAttempts) {
            setTimeout(checkWithRetry, 3000); // Wait 3 seconds before retry
          } else {
            // Final attempt failed, but payment might still be processing
            setStatus("failed");
          }
        };
        
        await checkWithRetry();
        
      } catch (error) {
        console.error("Error checking payment status:", error);
        setStatus("failed");
      }
    };

    checkStatus();
  }, [orderId, user?.id]);

  const handleRetry = () => {
    setStatus("checking");
    // Trigger the effect again by changing a state that causes re-render
    window.location.reload();
  };

  const goToDashboard = () => {
    navigate(`/${user?.id}/dashboard`);
  };

  const goToUpgrade = () => {
    navigate(`/${user?.id}/upgrade`);
  };

  if (status === "checking") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle className="text-center flex items-center justify-center gap-2">
              <Loader2 className="h-6 w-6 animate-spin" />
              Processing Payment
            </CardTitle>
          </CardHeader>
          <CardContent className="text-center">
            <p className="text-gray-600 mb-4">
              We're verifying your payment. This may take a few moments...
            </p>
            <p className="text-sm text-gray-500">
              Order ID: {orderId}
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (status === "success") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle className="text-center flex items-center justify-center gap-2 text-green-600">
              <CheckCircle className="h-6 w-6" />
              Payment Successful!
            </CardTitle>
          </CardHeader>
          <CardContent className="text-center space-y-4">
            <p className="text-gray-600">
              Your subscription has been activated successfully.
            </p>
            {subscription && (
              <div className="bg-green-50 p-4 rounded-lg">
                <p className="font-semibold">{subscription.planName} Plan</p>
                <p className="text-sm text-gray-600">
                  ₹{subscription.planPrice}
                </p>
              </div>
            )}
            <div className="space-y-2">
              <Button onClick={goToDashboard} className="w-full">
                Go to Dashboard
              </Button>
              <p className="text-sm text-gray-500">
                Order ID: {orderId}
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-center flex items-center justify-center gap-2 text-red-600">
            <XCircle className="h-6 w-6" />
            Payment Status Unknown
          </CardTitle>
        </CardHeader>
        <CardContent className="text-center space-y-4">
          <p className="text-gray-600">
            We couldn't verify your payment status. This doesn't mean your payment failed.
          </p>
          <p className="text-sm text-gray-500 mb-4">
            Order ID: {orderId}
          </p>
          <div className="space-y-2">
            <Button onClick={handleRetry} variant="outline" className="w-full">
              Check Again
            </Button>
            <Button onClick={goToUpgrade} className="w-full">
              Back to Plans
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default PaymentSuccess;
