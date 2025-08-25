import { Navigate, Outlet, useLocation } from "react-router-dom";

const AuthLayout = () => {
  const token = localStorage.getItem("token");
  const user = localStorage.getItem("user")
    ? JSON.parse(localStorage.getItem("user") || "{}")
    : null;

  const location = useLocation();

  // If user is authenticated, redirect to dashboard for auth pages
  // except allow access to the forgot-password route so users can reset passwords
  if (token && user) {
    const isForgotPasswordRoute = location.pathname.includes(
      "/auth/forgot-password"
    );
    if (!isForgotPasswordRoute) {
      return <Navigate to={`/${user.id}/dashboard`} />;
    }
  }

  return <Outlet />;
};

export default AuthLayout;
