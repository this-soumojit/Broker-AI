import { useEffect, useState } from "react";
import {
  LogOut,
  User,
  Sparkles,
  Home,
  BookOpen,
  Users,
  Bell,
  Globe,
} from "lucide-react";
import { Lock } from "lucide-react";
import {
  Sidebar,
  SidebarProvider,
  SidebarContent,
  SidebarHeader,
  SidebarFooter,
  SidebarMenu,
  SidebarMenuItem,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { useAuth } from "@/hooks/use-auth";
import { getUserPlanPermissions, UserPlanData } from "@/services/user";
import { checkSubscriptionStatus } from "@/services/payment";
import { useNavigate, useParams, Outlet, useLocation } from "react-router-dom";
import { useTranslation } from "react-i18next";

const Layout = () => {
  const { user, token } = useAuth();
  const { userId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const { t, i18n } = useTranslation();
  const [userPlan, setUserPlan] = useState<UserPlanData | null>(null);
  const [isPlanLoading, setIsPlanLoading] = useState(false);
  const [hasSubscription, setHasSubscription] = useState<boolean | null>(null);

  useEffect(() => {
    // Add a small delay to prevent flash before redirect
    const timer = setTimeout(() => {
      if (!user?.id) {
        console.log(
          "No user ID found, redirecting to login. User object:",
          user
        );
        navigate("/auth/login");
      }
    }, 100);

    return () => clearTimeout(timer);
  }, [user, navigate]);

  useEffect(() => {
    // Load saved language from localStorage
    const savedLanguage = localStorage.getItem("language");
    if (savedLanguage && savedLanguage !== i18n.language) {
      i18n.changeLanguage(savedLanguage);
    }
  }, [i18n]);

  // Load user plan permissions and keep in state so we can gate navigation
  useEffect(() => {
    const load = async () => {
      if (!userId || !token) return;
      setIsPlanLoading(true);
      try {
        const resp = await getUserPlanPermissions(userId, token as string);
        setUserPlan(resp.data);
      } catch (err) {
        console.error("Error loading user plan in Layout:", err);
        setUserPlan(null);
      } finally {
        setIsPlanLoading(false);
      }
    };

    load();
  }, [userId, token]);

  // Also check whether the user has selected/activated a subscription
  useEffect(() => {
    const loadSubscription = async () => {
      if (!userId) return;
      try {
        const status = await checkSubscriptionStatus(userId);
        // consider subscription selected if subscription object exists or active
        const exists = !!status.subscription || !!status.hasActiveSubscription;
        setHasSubscription(exists);
      } catch (err) {
        console.error("Error checking subscription status in Layout:", err);
        setHasSubscription(false);
      }
    };

    loadSubscription();
  }, [userId]);

  const onLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/auth/login");
  };

  const handleUpgradeClick = () => {
    navigate(`/${userId}/upgrade`);
  };

  const handleLanguageChange = (language: string) => {
    i18n.changeLanguage(language);
    localStorage.setItem("language", language);
  };

  const navigationItems = [
    {
      icon: Home,
      label: t("dashboard"),
      path: `/${userId}/dashboard`,
      isActive: location.pathname === `/${userId}/dashboard`,
    },
    {
      icon: BookOpen,
      label: t("books"),
      path: `/${userId}/books`,
      isActive: location.pathname.startsWith(`/${userId}/books`),
    },
    {
      icon: Users,
      label: t("clients"),
      path: `/${userId}/clients`,
      isActive: location.pathname.startsWith(`/${userId}/clients`),
    },
    {
      icon: Bell,
      label: "Payment Reminders",
      path: `/${userId}/payment-reminders`,
      isActive: location.pathname.startsWith(`/${userId}/payment-reminders`),
    },
  ];

  const handleNavClick = (path: string) => {
    // If plan/subscription is still loading, do nothing to avoid accidental navigation
    if (isPlanLoading || hasSubscription === null) return;

    // Restrict access when user hasn't selected any subscription yet
    const isRestricted = !hasSubscription;
    if (isRestricted) {
      navigate(`/${userId}/upgrade`);
      return;
    }

    navigate(path);
  };

  // If user manually navigates (URL) to a restricted page, redirect them to upgrade
  useEffect(() => {
    if (hasSubscription === null) return; // still checking

    const restrictedPaths = [
      `/${userId}/dashboard`,
      `/${userId}/books`,
      `/${userId}/clients`,
      `/${userId}/payment-reminders`,
    ];

    const onRestricted = restrictedPaths.some((p) =>
      location.pathname.startsWith(p)
    );
    if (onRestricted && !hasSubscription) {
      navigate(`/${userId}/upgrade`);
    }
  }, [hasSubscription, location.pathname, navigate, userId]);

  return (
    <SidebarProvider>
      <div className="flex h-screen w-full">
        <Sidebar className="border-r">
          <SidebarHeader className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <h1 className="text-xl font-bold">{t("Broker")}</h1>
                {/* Show plan badge when available or a 'No Plan' lock badge when user has no subscription */}
                {userPlan ? (
                  <Badge
                    variant={
                      userPlan.planName === "Basic" ? "secondary" : "default"
                    }
                    className="text-[10px] py-0.5 px-2"
                  >
                    {userPlan.planName}
                  </Badge>
                ) : hasSubscription === false ? (
                  <Badge
                    variant="secondary"
                    className="text-[10px] py-0.5 px-2 flex items-center gap-1"
                  >
                    <Lock className="h-3 w-3" /> No Plan
                  </Badge>
                ) : null}
              </div>
              <SidebarTrigger />
            </div>
            {/* Language Selector */}
            <div className="mt-3">
              <Select
                value={i18n.language}
                onValueChange={handleLanguageChange}
              >
                <SelectTrigger className="w-full">
                  <div className="flex items-center gap-2">
                    <Globe className="h-4 w-4" />
                    <SelectValue />
                  </div>
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="en">
                    <div className="flex items-center gap-2">
                      {t("english")}
                    </div>
                  </SelectItem>
                  <SelectItem value="hi">
                    <div className="flex items-center gap-2">{t("hindi")}</div>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
          </SidebarHeader>
          <SidebarContent className="px-4">
            <SidebarMenu>
              {navigationItems.map((item) => (
                <SidebarMenuItem key={item.path}>
                  <Button
                    variant={item.isActive ? "secondary" : "ghost"}
                    className="w-full justify-start"
                    onClick={() => handleNavClick(item.path)}
                  >
                    <item.icon className="mr-2 h-4 w-4" />
                    {item.label}
                  </Button>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarContent>
          <SidebarFooter className="p-4">
            <div className="space-y-2">
              {/* Clickable user info */}
              <div
                className="flex items-center gap-3 px-3 py-2 text-sm cursor-pointer hover:bg-muted rounded-md transition"
                onClick={() => navigate(`/${userId}/profile`)}
              >
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10">
                  <User className="h-4 w-4 text-primary" />
                </div>
                <div className="flex flex-col">
                  <span className="font-medium">{user?.name}</span>
                  <span className="text-xs text-muted-foreground">
                    {user?.email}
                  </span>
                </div>
              </div>

              <Separator />
              <Button
                variant="outline"
                className="w-full justify-start rounded-md bg-green-100 border-green-300 hover:bg-green-200"
                onClick={handleUpgradeClick}
              >
                <Sparkles className="mr-2 h-5 w-5 text-green-600" />
                {t("upgrade")}
              </Button>
              <Separator className="my-2" />
              <Button
                variant="ghost"
                className="w-full justify-start text-destructive/80 hover:text-destructive hover:bg-destructive/10 rounded-md"
                onClick={onLogout}
              >
                <LogOut className="mr-2 h-5 w-5" />
                {t("logout")}
              </Button>
            </div>
          </SidebarFooter>
        </Sidebar>
        <main className="flex-1 overflow-auto bg-muted/5 p-6">
          <div className="mx-auto">
            <SidebarTrigger />
            <Outlet />
          </div>
        </main>
      </div>
    </SidebarProvider>
  );
};

export default Layout;
