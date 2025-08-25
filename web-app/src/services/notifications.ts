interface NotificationData {
  id: string;
  type: "success" | "error" | "warning" | "info";
  title: string;
  message: string;
  timestamp: Date;
  read: boolean;
  actions?: Array<{
    label: string;
    action: () => void;
  }>;
}

class NotificationService {
  private notifications: NotificationData[] = [];
  private listeners: Array<(notifications: NotificationData[]) => void> = [];

  // Add a new notification
  addNotification(
    notification: Omit<NotificationData, "id" | "timestamp" | "read">
  ): string {
    const newNotification: NotificationData = {
      ...notification,
      id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
      timestamp: new Date(),
      read: false,
    };

    this.notifications.unshift(newNotification);

    // Keep only last 50 notifications
    if (this.notifications.length > 50) {
      this.notifications = this.notifications.slice(0, 50);
    }

    this.notifyListeners();
    return newNotification.id;
  }

  // Add payment reminder notification
  addPaymentReminderNotification(
    invoiceNumber: string,
    clientName: string,
    success: boolean,
    details?: {
      whatsapp: boolean;
      email: { buyer: boolean; seller: boolean; broker: boolean };
    }
  ): string {
    if (success) {
      // Determine channels used
      const channels: string[] = [];
      if (details?.whatsapp) channels.push("WhatsApp");
      const emailUsed = !!(details?.email?.seller || details?.email?.broker);
      if (emailUsed) channels.push("Email");

      // Commission recipients: only seller and broker should receive commission emails
      const commissionRecipients: string[] = [];
      if (details?.email?.seller) commissionRecipients.push("Seller");
      if (details?.email?.broker) commissionRecipients.push("Broker");

      // Build recipient text
      const recipientsText = commissionRecipients.length
        ? commissionRecipients.join(" and ")
        : "recipient(s)";

      // Build channel text
      const channelText = channels.length
        ? ` via ${channels.join(" and ")}`
        : "";

      // Final concise message per request
      const messageBody = `Invoice #${invoiceNumber} sent to ${recipientsText}${channelText}`;

      return this.addNotification({
        type: "success",
        title: "Payment Reminder Sent",
        message: messageBody,
      });
    } else {
      return this.addNotification({
        type: "error",
        title: "Payment Reminder Failed",
        message: `Failed to send payment reminder for Invoice #${invoiceNumber} to ${clientName}`,
      });
    }
  }

  // Add bulk reminder notification
  addBulkReminderNotification(results: {
    success: number;
    failed: number;
    total: number;
  }): string {
    if (results.success > 0) {
      return this.addNotification({
        type: "success",
        title: "Bulk Payment Reminders Sent",
        message: `Successfully sent ${results.success} out of ${results.total} payment reminders`,
      });
    } else {
      return this.addNotification({
        type: "error",
        title: "Bulk Payment Reminders Failed",
        message: `Failed to send all ${results.total} payment reminders`,
      });
    }
  }

  // Get all notifications
  getNotifications(): NotificationData[] {
    return [...this.notifications];
  }

  // Get unread notifications
  getUnreadNotifications(): NotificationData[] {
    return this.notifications.filter((n) => !n.read);
  }

  // Mark notification as read
  markAsRead(id: string): void {
    const notification = this.notifications.find((n) => n.id === id);
    if (notification) {
      notification.read = true;
      this.notifyListeners();
    }
  }

  // Mark all notifications as read
  markAllAsRead(): void {
    this.notifications.forEach((n) => (n.read = true));
    this.notifyListeners();
  }

  // Remove notification
  removeNotification(id: string): void {
    this.notifications = this.notifications.filter((n) => n.id !== id);
    this.notifyListeners();
  }

  // Clear all notifications
  clearAll(): void {
    this.notifications = [];
    this.notifyListeners();
  }

  // Subscribe to notification changes
  subscribe(listener: (notifications: NotificationData[]) => void): () => void {
    this.listeners.push(listener);

    // Return unsubscribe function
    return () => {
      this.listeners = this.listeners.filter((l) => l !== listener);
    };
  }

  // Notify all listeners
  private notifyListeners(): void {
    this.listeners.forEach((listener) => listener([...this.notifications]));
  }

  // Get notification count
  getUnreadCount(): number {
    return this.notifications.filter((n) => !n.read).length;
  }
}

// Export singleton instance
export const notificationService = new NotificationService();

// Export types
export type { NotificationData };
