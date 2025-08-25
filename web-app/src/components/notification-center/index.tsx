import React, { useState, useEffect } from "react";
import {
  Bell,
  X,
  CheckCircle,
  AlertTriangle,
  XCircle,
  Info,
} from "lucide-react";
import {
  notificationService,
  NotificationData,
} from "../../services/notifications";

const NotificationCenter: React.FC = () => {
  const [notifications, setNotifications] = useState<NotificationData[]>([]);
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    // Subscribe to notification updates
    const unsubscribe = notificationService.subscribe(setNotifications);

    // Load existing notifications
    setNotifications(notificationService.getNotifications());

    return unsubscribe;
  }, []);

  const unreadCount = notifications.filter((n) => !n.read).length;

  const getIcon = (type: NotificationData["type"]) => {
    switch (type) {
      case "success":
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case "error":
        return <XCircle className="h-5 w-5 text-red-500" />;
      case "warning":
        return <AlertTriangle className="h-5 w-5 text-yellow-500" />;
      case "info":
      default:
        return <Info className="h-5 w-5 text-blue-500" />;
    }
  };

  const getBackgroundColor = (type: NotificationData["type"]) => {
    switch (type) {
      case "success":
        return "bg-green-50 border-green-200";
      case "error":
        return "bg-red-50 border-red-200";
      case "warning":
        return "bg-yellow-50 border-yellow-200";
      case "info":
      default:
        return "bg-blue-50 border-blue-200";
    }
  };

  const formatTime = (date: Date) => {
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffMins < 1) return "Just now";
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    return `${diffDays}d ago`;
  };

  const handleNotificationClick = (notification: NotificationData) => {
    if (!notification.read) {
      notificationService.markAsRead(notification.id);
    }
  };

  const handleRemoveNotification = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    notificationService.removeNotification(id);
  };

  const handleMarkAllAsRead = () => {
    notificationService.markAllAsRead();
  };

  const handleClearAll = () => {
    notificationService.clearAll();
    setIsOpen(false);
  };

  return (
    <div className="relative">
      {/* Notification Bell */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 rounded-lg hover:bg-gray-100 transition-colors"
      >
        <Bell className="h-6 w-6 text-gray-600" />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
            {unreadCount > 99 ? "99+" : unreadCount}
          </span>
        )}
      </button>

      {/* Notification Panel */}
      {isOpen && (
        <div className="absolute right-0 top-full mt-2 w-96 bg-white rounded-lg shadow-lg border z-50 max-h-96 overflow-hidden">
          {/* Header */}
          <div className="p-4 border-b bg-gray-50">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold text-gray-900">Notifications</h3>
              <div className="flex items-center gap-2">
                {notifications.length > 0 && (
                  <>
                    <button
                      onClick={handleMarkAllAsRead}
                      className="text-sm text-blue-600 hover:text-blue-800"
                    >
                      Mark all read
                    </button>
                    <button
                      onClick={handleClearAll}
                      className="text-sm text-gray-600 hover:text-gray-800"
                    >
                      Clear all
                    </button>
                  </>
                )}
                <button
                  onClick={() => setIsOpen(false)}
                  className="p-1 hover:bg-gray-200 rounded"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>

          {/* Notifications List */}
          <div className="max-h-80 overflow-y-auto">
            {notifications.length === 0 ? (
              <div className="p-8 text-center text-gray-500">
                <Bell className="h-8 w-8 mx-auto mb-2 text-gray-300" />
                <p>No notifications</p>
              </div>
            ) : (
              notifications.map((notification) => (
                <div
                  key={notification.id}
                  onClick={() => handleNotificationClick(notification)}
                  className={`p-4 border-b hover:bg-gray-50 cursor-pointer transition-colors ${
                    !notification.read ? "bg-blue-50" : ""
                  }`}
                >
                  <div className="flex items-start gap-3">
                    {getIcon(notification.type)}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <p className="font-medium text-gray-900 text-sm">
                          {notification.title}
                        </p>
                        <button
                          onClick={(e) =>
                            handleRemoveNotification(notification.id, e)
                          }
                          className="p-1 hover:bg-gray-200 rounded opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <X className="h-3 w-3 text-gray-400" />
                        </button>
                      </div>
                      <p className="text-gray-600 text-sm mt-1 line-clamp-2">
                        {notification.message}
                      </p>
                      <p className="text-gray-400 text-xs mt-2">
                        {formatTime(notification.timestamp)}
                      </p>
                    </div>
                    {!notification.read && (
                      <div className="h-2 w-2 bg-blue-500 rounded-full mt-1"></div>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* Overlay to close panel */}
      {isOpen && (
        <div className="fixed inset-0 z-40" onClick={() => setIsOpen(false)} />
      )}
    </div>
  );
};

export default NotificationCenter;
