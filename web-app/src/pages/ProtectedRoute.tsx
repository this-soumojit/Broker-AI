import { Navigate } from "react-router-dom";
import { getUserSubscription } from "@/services/payment";
import { useEffect, useState } from "react";
import PageLoader from "@/components/page-loader";

const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const token = localStorage.getItem("token");
  const user = localStorage.getItem("user")
    ? JSON.parse(localStorage.getItem("user") || "{}")
    : null;

  const [hasSubscription, setHasSubscription] = useState<boolean | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      if (!token || !user) {
        setLoading(false);
        return;
      }

      // Check subscription for all routes except upgrade and profile
      const currentPath = window.location.pathname;
      const isUpgradePage = currentPath.includes("/upgrade");
      const isProfilePage = currentPath.includes("/profile");

      if (isUpgradePage || isProfilePage) {
        setHasSubscription(true); // Allow access to these pages
        setLoading(false);
        return;
      }

      try {
        const subscription = await getUserSubscription(user.id);
        setHasSubscription(!!subscription.data);
      } catch (error) {
        setHasSubscription(false);
      }
      setLoading(false);
    };

    checkAuth();
  }, [token, user]);

  if (!token || !user) {
    return <Navigate to="/auth/login" />;
  }

  if (loading) {
    return <PageLoader isLoading={true} />;
  }

  if (!hasSubscription && user) {
    return <Navigate to={`/${user.id}/upgrade`} replace />;
  }

  return children;
};

export default ProtectedRoute;
