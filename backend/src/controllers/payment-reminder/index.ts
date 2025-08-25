import { Request, Response, NextFunction } from "express";
import { PaymentReminderService } from "../../services/paymentReminder";
import { UserSubscription } from "../../models";
import { throwCustomError } from "../../utils/error";
import { logger } from "../../utils/logger";

/**
 * Check if user can send payment reminders based on their plan
 */
const checkReminderPermissions = async (userId: string): Promise<void> => {
  const userSubscription = await UserSubscription.findOne({
    where: { userId, status: "ACTIVE" },
    order: [["createdAt", "DESC"]],
  });

  const planName = userSubscription?.dataValues?.planName || "Basic";

  if (planName === "Basic") {
    throwCustomError(
      403,
      "Payment reminders are not available for Basic plan users. Please upgrade to Professional or Enterprise plan to send payment reminders.",
    );
  }
};

/**
 * Send payment reminders to all users with due payments
 */
const sendRemindersV1 = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { testMode = false } = req.body;
    const { userId } = req.params;

    if (!userId) {
      res.status(400).json({ message: "User ID is required" });
      return;
    }

    // Check if user can send reminders based on their plan
    await checkReminderPermissions(userId);

    logger.info(`Starting payment reminder process. Test mode: ${testMode}, userId: ${userId}`);

    if (testMode) {
      // In test mode, just get the data without sending
      const reminderData = await PaymentReminderService.getSalesForReminders(userId);

      res.status(200).json({
        message: "Test mode - No reminders sent",
        data: {
          salesFound: reminderData.length,
          testData: reminderData.map((data) => ({
            invoiceNumber: data.sale.invoiceNumber,
            buyerName: data.buyer.name,
            buyerPhone: data.buyer.phone,
            daysUntilDue: data.daysUntilDue,
            isOverdue: data.isOverdue,
            amount: data.sale.invoiceNetAmount,
          })),
        },
      });
      return;
    }

    // Send actual reminders (WhatsApp + Email)
    const result = await PaymentReminderService.sendAllReminders(userId);

    res.status(200).json({
      message: "Payment reminders sent successfully",
      data: result,
    });
  } catch (error) {
    logger.error("Error in sendRemindersV1:", error);
    next(error);
  }
};

/**
 * Get upcoming due payments without sending reminders
 */
const getUpcomingDuePaymentsV1 = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const { userId } = req.params;

    logger.info("Getting upcoming payments...");
    logger.info("Request params:", req.params);
    logger.info("Filtering for userId:", userId);

    const paymentData = await PaymentReminderService.getAllUpcomingPayments(userId);

    logger.info(`Found ${paymentData.length} upcoming payments for user ${userId}`);

    const upcomingPayments = paymentData.map((data) => ({
      saleId: data.sale.id,
      invoiceNumber: data.sale.invoiceNumber,
      buyerName: data.buyer.name,
      buyerPhone: data.buyer.phone,
      sellerName: data.seller.name,
      amount: data.sale.invoiceNetAmount,
      commissionRate: data.sale.commissionRate || 0,
      commissionAmount: ((data.sale.invoiceNetAmount || 0) * (data.sale.commissionRate || 0)) / 100,
      dueDate:
        data.sale.invoiceDate && data.sale.invoiceDueDays
          ? new Date(
              new Date(data.sale.invoiceDate).getTime() +
                data.sale.invoiceDueDays * 24 * 60 * 60 * 1000,
            )
          : null,
      daysUntilDue: data.daysUntilDue,
      isOverdue: data.isOverdue,
      status: data.sale.status,
    }));

    const stats = {
      total: upcomingPayments.length,
      overdue: upcomingPayments.filter((p) => p.isOverdue).length,
      dueToday: upcomingPayments.filter((p) => p.daysUntilDue === 0).length,
      dueSoon: upcomingPayments.filter((p) => p.daysUntilDue > 0 && p.daysUntilDue <= 10).length,
      payments: upcomingPayments,
    };

    logger.info("Payment stats for user:", userId, stats);

    res.status(200).json({
      message: "Upcoming due payments retrieved successfully",
      data: stats,
    });
  } catch (error) {
    logger.error("Error in getUpcomingDuePaymentsV1:", error);
    next(error);
  }
};

/**
 * Send reminder for a specific sale
 */
const sendSpecificReminderV1 = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const { saleId, userId } = req.params;

    if (!saleId) {
      res.status(400).json({
        message: "Sale ID is required",
      });
      return;
    }

    if (!userId) {
      res.status(400).json({ message: "User ID is required" });
      return;
    }

    // Check if user can send reminders based on their plan
    await checkReminderPermissions(userId);

    try {
      // Send reminder (WhatsApp + Email)
      const result = await PaymentReminderService.sendSpecificReminder(saleId);

      res.status(200).json({
        message: `Reminder sent successfully`,
        data: result,
      });
    } catch (error) {
      logger.error(`Failed to send reminder for sale ${saleId}:`, error);
      res.status(500).json({
        message: "Failed to send reminder",
        error: error instanceof Error ? error.message : "Unknown error",
      });
    }
  } catch (error) {
    logger.error("Error in sendSpecificReminderV1:", error);
    next(error);
  }
};

export { sendRemindersV1, getUpcomingDuePaymentsV1, sendSpecificReminderV1 };
