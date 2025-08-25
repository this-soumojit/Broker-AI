import { Navigate } from "react-router-dom";
import { useAuth } from "@/hooks/use-auth";
import { getUserSubscription } from "@/services/payment";
import { useEffect, useState } from "react";
import PageLoader from "@/components/page-loader";

const RootRedirect = () => {
  const { isAuthenticated, user } = useAuth();
  const [hasSubscription, setHasSubscription] = useState<boolean | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkSubscription = async () => {
      if (isAuthenticated && user) {
        try {
          const subscription = await getUserSubscription(user.id);
          setHasSubscription(!!subscription.data);
        } catch (error) {
          console.log("No subscription found");
          setHasSubscription(false);
        }
      }
      setLoading(false);
    };

    checkSubscription();
  }, [isAuthenticated, user]);

  if (loading) {
    return <PageLoader isLoading={true} />;
  }

  if (isAuthenticated && user) {
    if (hasSubscription) {
      return <Navigate to={`/${user.id}/dashboard`} replace />;
    } else {
      return <Navigate to={`/${user.id}/upgrade`} replace />;
    }
  }

  return <Navigate to="/auth/login" replace />;
};

export default RootRedirect;
