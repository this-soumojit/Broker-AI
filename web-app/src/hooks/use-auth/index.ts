import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

const useAuth = () => {
  const navigate = useNavigate();

  const [authState, setAuthState] = useState(() => {
    const token = localStorage.getItem("token");
    const user = localStorage.getItem("user")
      ? JSON.parse(localStorage.getItem("user") || "{}")
      : null;
    return { token, user };
  });

  const isAuthenticated = !!authState.token && !!authState.user;

  // Listen for custom auth update events
  useEffect(() => {
    const handleAuthUpdate = () => {
      const token = localStorage.getItem("token");
      const user = localStorage.getItem("user")
        ? JSON.parse(localStorage.getItem("user") || "{}")
        : null;
      setAuthState({ token, user });
    };

    // Listen for custom auth update events
    window.addEventListener("authUpdate", handleAuthUpdate);

    // Also listen for storage events (when localStorage changes from other tabs)
    window.addEventListener("storage", handleAuthUpdate);

    return () => {
      window.removeEventListener("authUpdate", handleAuthUpdate);
      window.removeEventListener("storage", handleAuthUpdate);
    };
  }, []);

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setAuthState({ token: null, user: null });
    navigate("/auth/login");
  };

  const updateUser = (updatedUser: any) => {
    localStorage.setItem("user", JSON.stringify(updatedUser));
    setAuthState((prev) => ({ ...prev, user: updatedUser }));
    // Dispatch custom event to notify other components
    window.dispatchEvent(new CustomEvent("authUpdate"));
  };

  return {
    token: authState.token,
    user: authState.user,
    isAuthenticated,
    logout,
    updateUser,
  };
};

export { useAuth };
