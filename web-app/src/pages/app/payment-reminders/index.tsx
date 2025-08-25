import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/use-auth";
import PageLoader from "@/components/page-loader";
import {
  getUpcomingDuePayments,
  sendPaymentReminders,
  sendSpecificReminder,
  PaymentReminderData,
  PaymentReminderStats,
} from "@/services/paymentReminder";
import { getUserPlanPermissions, UserPlanData } from "@/services/user";
import {
  notificationService,
  NotificationData,
} from "@/services/notifications";
import {
  MessageSquare,
  Send,
  AlertTriangle,
  Clock,
  CheckCircle,
  X,
  Bell,
  Loader2,
  Lock,
} from "lucide-react";
import { CustomPagination } from "@/components/pagination";

export default function PaymentRemindersPage() {
  const { userId } = useParams();
  const navigate = useNavigate();
  const { token } = useAuth();
  const { showSuccess, showError } = useToast();

  const [isLoading, setIsLoading] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [sendingStates, setSendingStates] = useState<Record<string, boolean>>(
    {}
  );
  const [reminderData, setReminderData] = useState<PaymentReminderStats | null>(
    null
  );
  const [notifications, setNotifications] = useState<NotificationData[]>([]);
  const [showNotifications, setShowNotifications] = useState(true);
  const [userPlan, setUserPlan] = useState<UserPlanData | null>(null);

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);

  // Load user plan permissions
  const loadUserPlanPermissions = async () => {
    if (!userId || !token) return;

    try {
      const response = await getUserPlanPermissions(userId, token);
      setUserPlan(response.data);
    } catch (error: any) {
      console.error("❌ Error loading user plan permissions:", error);
      console.error("❌ Error details:", error.response?.data);
    }
  };

  // Load upcoming due payments
  const loadUpcomingPayments = async () => {
    if (!userId || !token) {
      showError("Authentication required. Please log in again.");
      return;
    }

    setIsLoading(true);
    try {
      const response = await getUpcomingDuePayments(userId, token);
      setReminderData(response.data);
    } catch (error) {
      console.error("Error loading upcoming payments:", error);
      showError("Failed to load upcoming payments");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadUpcomingPayments();
    loadUserPlanPermissions();

    // Load existing notifications
    const existingNotifications = notificationService.getNotifications();
    setNotifications(existingNotifications);

    // Subscribe to notification updates
    const unsubscribe = notificationService.subscribe(
      (updatedNotifications) => {
        setNotifications(updatedNotifications);
      }
    );

    return () => unsubscribe();
  }, [userId, token]);

  // Send all reminders
  const handleSendAllReminders = async () => {
    if (!userId || !token) return;

    setIsSending(true);
    try {
      const response = await sendPaymentReminders(userId, token, {
        testMode: false,
      });

      // The notification is already added by the service
      showSuccess(
        `Reminders sent: ${response.data.success} successful, ${response.data.failed} failed`
      );
      await loadUpcomingPayments(); // Refresh data
    } catch (error: any) {
      console.error("Error sending reminders:", error);
      if (error?.response?.status === 403) {
        showError(
          "Payment reminders are not available for Basic plan users. Please upgrade to Professional or Enterprise plan."
        );
      } else {
        showError("Failed to send reminders");
      }
    } finally {
      setIsSending(false);
    }
  };

  // Send specific reminder
  const handleSendSpecificReminder = async (
    saleId: string,
    buyerName: string,
    invoiceNumber: string
  ) => {
    if (!userId || !token) return;

    // Set loading state for this specific button
    setSendingStates((prev) => ({ ...prev, [saleId]: true }));

    try {
      await sendSpecificReminder(
        userId,
        saleId,
        token,
        buyerName,
        invoiceNumber,
        {}
      );

      // The notification is already added by the service
      showSuccess(`Reminder sent successfully`);
    } catch (error: any) {
      console.error("Error sending specific reminder:", error);
      if (error?.response?.status === 403) {
        showError(
          "Payment reminders are not available for Basic plan users. Please upgrade to Professional or Enterprise plan."
        );
      } else {
        showError(`Failed to send reminder`);
      }
    } finally {
      // Remove loading state for this specific button
      setSendingStates((prev) => {
        const newState = { ...prev };
        delete newState[saleId];
        return newState;
      });
    }
  };

  // Get badge variant based on status
  const getStatusBadge = (payment: PaymentReminderData) => {
    if (payment.isOverdue) {
      return (
        <Badge variant="destructive" className="gap-1">
          <AlertTriangle className="h-3 w-3" />
          Overdue ({Math.abs(payment.daysUntilDue)} days)
        </Badge>
      );
    } else if (payment.daysUntilDue === 0) {
      return (
        <Badge variant="secondary" className="gap-1">
          <Clock className="h-3 w-3" />
          Due Today
        </Badge>
      );
    } else if (payment.daysUntilDue <= 5) {
      return (
        <Badge variant="outline" className="gap-1">
          <Clock className="h-3 w-3" />
          Due in {payment.daysUntilDue} days
        </Badge>
      );
    } else {
      return (
        <Badge variant="default" className="gap-1">
          <CheckCircle className="h-3 w-3" />
          Due in {payment.daysUntilDue} days
        </Badge>
      );
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
    }).format(amount);
  };

  // Pagination logic
  const totalItems = reminderData?.payments?.length || 0;
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentItems =
    reminderData?.payments?.slice(startIndex, endIndex) || [];

  // Check if the user is on the Basic plan or cannot send reminders
  // const isBasicPlan =
  //   userPlan?.planName === "Basic" || !userPlan?.canSendReminders;
  // const upgradeMessage =
  //   "Upgrade to Professional or Enterprise to send reminders";

  return (
    <div className="container mx-auto py-6 space-y-6">
      <PageLoader isLoading={isLoading} />

      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl md:text-3xl font-bold tracking-tight">
              Payment Reminders
            </h1>
            {userPlan && (
              <Badge
                variant={userPlan.canSendReminders ? "default" : "secondary"}
                className="text-xs"
              >
                {userPlan.planName} Plan
                {!userPlan.canSendReminders && (
                  <Lock className="h-3 w-3 ml-1" />
                )}
              </Badge>
            )}
          </div>
          <p className="text-muted-foreground">
            {userPlan?.canSendReminders
              ? "Manage and send payment reminders to clients"
              : "View payment data - upgrade to send reminders"}
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
          {/* Notification Bell Icon */}
          <div className="relative">
            <Button
              variant="outline"
              size="sm"
              className="relative w-full sm:w-auto"
              onClick={() => setShowNotifications(!showNotifications)}
              title={`${notifications.length} notifications`}
            >
              <Bell className="h-4 w-4" />
              {notifications.length > 0 && (
                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                  {notifications.length > 9 ? "9+" : notifications.length}
                </span>
              )}
            </Button>
          </div>
          {/* This button will only work if there are any due invoices for commission within 10,5,1 and on the same day */}
          <Button
            className="w-full sm:w-auto"
            onClick={() => handleSendAllReminders()}
            disabled={
              isSending || !reminderData?.total || !userPlan?.canSendReminders
            }
            title={
              !userPlan?.canSendReminders
                ? "Upgrade to Professional or Enterprise to send reminders"
                : ""
            }
          >
            {!userPlan?.canSendReminders && <Lock className="h-4 w-4 mr-2" />}
            {userPlan?.canSendReminders && <Send className="h-4 w-4 mr-2" />}
            {isSending
              ? "Sending..."
              : !userPlan?.canSendReminders
              ? "Upgrade to Send Reminders"
              : "Send All Reminders"}
          </Button>
        </div>
      </div>

      {/* Page-specific Notifications */}
      {notifications.length > 0 && showNotifications && (
        <div className="space-y-2">
          {notifications.slice(0, 5).map((notification) => (
            <Card
              key={notification.id}
              className="border-l-4 border-l-blue-500"
            >
              <CardContent className="pt-4">
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-3">
                    <MessageSquare className="h-5 w-5 text-blue-500 mt-0.5" />
                    <div>
                      <p className="font-medium">{notification.title}</p>
                      <p className="text-sm text-muted-foreground">
                        {notification.message}
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">
                        {new Date(notification.timestamp).toLocaleString()}
                      </p>
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      notificationService.removeNotification(notification.id);
                    }}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
          {notifications.length > 5 && (
            <p className="text-sm text-muted-foreground text-center">
              ... and {notifications.length - 5} more notifications
            </p>
          )}
        </div>
      )}

      {/* Plan Upgrade Banner - Only for Basic Plan */}
      {userPlan &&
        (userPlan.planName === "Basic" || !userPlan.canSendReminders) && (
          <Card className="border-amber-200 bg-amber-50">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-semibold text-amber-800">
                    Upgrade to Send Payment Reminders
                  </h3>
                  <p className="text-sm text-amber-700 mt-1">
                    You're currently on the {userPlan.planName || "Basic"} plan.
                    Upgrade to Professional or Enterprise to send WhatsApp and
                    email reminders, set up automated scheduling, and access
                    advanced payment tracking features.
                  </p>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => navigate(`/${userId}/upgrade`)}
                  className="border-amber-300 text-amber-800 hover:bg-amber-100"
                >
                  Upgrade Plan
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

      {/* Summary Cards */}
      {reminderData && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Total Pending
              </CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{reminderData.total}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Overdue</CardTitle>
              <AlertTriangle className="h-4 w-4 text-red-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-500">
                {reminderData.overdue}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Due Today</CardTitle>
              <Clock className="h-4 w-4 text-orange-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-orange-500">
                {reminderData.dueToday}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Due Soon</CardTitle>
              <CheckCircle className="h-4 w-4 text-blue-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-500">
                {reminderData.dueSoon}
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Payment Reminders Table */}
      <Card>
        <CardHeader>
          <CardTitle>Pending Payments</CardTitle>
          <CardDescription>
            Clients with payments due for reminders
          </CardDescription>
        </CardHeader>
        <CardContent>
          {reminderData?.payments && reminderData.payments.length > 0 ? (
            <>
              {/* Desktop Table */}
              <div className="hidden md:block rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Invoice</TableHead>
                      <TableHead>Client</TableHead>
                      <TableHead>Phone</TableHead>
                      <TableHead>Amount</TableHead>
                      <TableHead>Commission</TableHead>
                      <TableHead>Due Date</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {currentItems.map((payment) => (
                      <TableRow key={payment.saleId}>
                        <TableCell className="font-medium">
                          {payment.invoiceNumber || "N/A"}
                        </TableCell>
                        <TableCell>{payment.buyerName}</TableCell>
                        <TableCell className="font-mono text-sm">
                          {payment.buyerPhone}
                        </TableCell>
                        <TableCell className="font-semibold">
                          {formatCurrency(payment.amount)}
                        </TableCell>
                        <TableCell className="font-semibold">
                          <div className="text-sm">
                            <div>
                              {formatCurrency(payment.commissionAmount || 0)}
                            </div>
                            <div className="text-xs text-muted-foreground">
                              {payment.commissionRate || 0}%
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          {payment.dueDate
                            ? new Date(payment.dueDate).toLocaleDateString(
                                "en-IN"
                              )
                            : "N/A"}
                        </TableCell>
                        <TableCell>{getStatusBadge(payment)}</TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-1">
                            <Button
                              className={
                                userPlan?.canSendReminders
                                  ? "bg-black hover:bg-gray-800 text-white"
                                  : ""
                              }
                              variant={
                                userPlan?.canSendReminders
                                  ? "default"
                                  : "outline"
                              }
                              size="sm"
                              disabled={
                                sendingStates[payment.saleId] ||
                                !userPlan?.canSendReminders
                              }
                              onClick={() =>
                                handleSendSpecificReminder(
                                  payment.saleId,
                                  payment.buyerName,
                                  payment.invoiceNumber
                                )
                              }
                              title={
                                !userPlan?.canSendReminders
                                  ? "Upgrade to Professional or Enterprise to send reminders"
                                  : ""
                              }
                            >
                              {sendingStates[payment.saleId] ? (
                                <>
                                  <Loader2 className="h-3 w-3 mr-1 animate-spin" />
                                  Sending...
                                </>
                              ) : (
                                <>
                                  {!userPlan?.canSendReminders && (
                                    <Lock className="h-3 w-3 mr-1" />
                                  )}
                                  {userPlan?.canSendReminders && (
                                    <MessageSquare className="h-3 w-3 mr-1" />
                                  )}
                                  {!userPlan?.canSendReminders
                                    ? "Upgrade"
                                    : "Send Reminder"}
                                </>
                              )}
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>

              {/* Mobile Cards */}
              <div className="md:hidden space-y-4">
                {currentItems.map((payment) => (
                  <Card key={payment.saleId} className="p-4">
                    <div className="space-y-3">
                      <div className="flex justify-between items-start">
                        <div>
                          <p className="font-medium text-sm text-muted-foreground">
                            Invoice
                          </p>
                          <p className="font-semibold">
                            {payment.invoiceNumber || "N/A"}
                          </p>
                        </div>
                        <div className="text-right">
                          {getStatusBadge(payment)}
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <p className="font-medium text-sm text-muted-foreground">
                            Client
                          </p>
                          <p className="text-sm">{payment.buyerName}</p>
                        </div>
                        <div>
                          <p className="font-medium text-sm text-muted-foreground">
                            Phone
                          </p>
                          <p className="text-sm font-mono">
                            {payment.buyerPhone}
                          </p>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <p className="font-medium text-sm text-muted-foreground">
                            Amount
                          </p>
                          <p className="text-sm font-semibold">
                            {formatCurrency(payment.amount)}
                          </p>
                        </div>
                        <div>
                          <p className="font-medium text-sm text-muted-foreground">
                            Commission
                          </p>
                          <p className="text-sm font-semibold">
                            {formatCurrency(payment.commissionAmount || 0)}
                            <span className="text-xs text-muted-foreground ml-1">
                              ({payment.commissionRate || 0}%)
                            </span>
                          </p>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 gap-3">
                        <div>
                          <p className="font-medium text-sm text-muted-foreground">
                            Due Date
                          </p>
                          <p className="text-sm">
                            {payment.dueDate
                              ? new Date(payment.dueDate).toLocaleDateString(
                                  "en-IN"
                                )
                              : "N/A"}
                          </p>
                        </div>
                      </div>

                      <div className="pt-2">
                        <Button
                          className={
                            userPlan?.canSendReminders
                              ? "bg-black hover:bg-gray-800 text-white w-full"
                              : "w-full"
                          }
                          variant={
                            userPlan?.canSendReminders ? "default" : "outline"
                          }
                          size="sm"
                          disabled={
                            sendingStates[payment.saleId] ||
                            !userPlan?.canSendReminders
                          }
                          onClick={() =>
                            handleSendSpecificReminder(
                              payment.saleId,
                              payment.buyerName,
                              payment.invoiceNumber
                            )
                          }
                          title={
                            !userPlan?.canSendReminders
                              ? "Upgrade to Professional or Enterprise to send reminders"
                              : ""
                          }
                        >
                          {sendingStates[payment.saleId] ? (
                            <>
                              <Loader2 className="h-3 w-3 mr-2 animate-spin" />
                              Sending...
                            </>
                          ) : (
                            <>
                              {!userPlan?.canSendReminders && (
                                <Lock className="h-3 w-3 mr-2" />
                              )}
                              {userPlan?.canSendReminders && (
                                <MessageSquare className="h-3 w-3 mr-2" />
                              )}
                              {!userPlan?.canSendReminders
                                ? "Upgrade to Send Reminders"
                                : "Send Reminder"}
                            </>
                          )}
                        </Button>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>

              {/* Pagination */}
              {totalItems > itemsPerPage && (
                <div className="mt-6 flex justify-center">
                  <CustomPagination
                    totalItems={totalItems}
                    itemsPerPage={itemsPerPage}
                    currentPage={currentPage}
                    setCurrentPage={setCurrentPage}
                  />
                </div>
              )}
            </>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              <CheckCircle className="h-12 w-12 mx-auto mb-4 text-green-500" />
              <h3 className="text-lg font-semibold mb-2">
                All payments are on track!
              </h3>
              <p>No payment reminders needed at this time.</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
