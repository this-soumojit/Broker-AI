import { PaymentReminderService } from "./paymentReminder";
import { logger } from "../utils/logger";

export class ScheduledJobService {
  private static reminderInterval: NodeJS.Timeout | null = null;

  /**
   * Start the payment reminder scheduler
   * Runs every day at 9 AM
   */
  static startPaymentReminderScheduler(): void {
    // Stop existing scheduler if running
    this.stopPaymentReminderScheduler();

    logger.info("Starting payment reminder scheduler...");

    // Calculate milliseconds until next 9 AM
    const now = new Date();
    const next9AM = new Date();
    next9AM.setHours(9, 0, 0, 0);

    // If it's already past 9 AM today, schedule for tomorrow
    if (now.getHours() >= 9) {
      next9AM.setDate(next9AM.getDate() + 1);
    }

    const msUntilNext9AM = next9AM.getTime() - now.getTime();

    // Set initial timeout to run at next 9 AM
    setTimeout(() => {
      // Run the reminder service
      this.runPaymentReminders();

      // Then set up daily interval (24 hours = 24 * 60 * 60 * 1000 ms)
      this.reminderInterval = setInterval(
        () => {
          this.runPaymentReminders();
        },
        24 * 60 * 60 * 1000,
      );
    }, msUntilNext9AM);

    logger.info(`Payment reminder scheduler will start at ${next9AM.toLocaleString()}`);
  }

  /**
   * Stop the payment reminder scheduler
   */
  static stopPaymentReminderScheduler(): void {
    if (this.reminderInterval) {
      clearInterval(this.reminderInterval);
      this.reminderInterval = null;
      logger.info("Payment reminder scheduler stopped.");
    }
  }

  /**
   * Run payment reminders manually
   */
  static async runPaymentReminders(): Promise<void> {
    try {
      logger.info("Running scheduled payment reminders...");

      const result = await PaymentReminderService.sendAllReminders();

      logger.info("Scheduled payment reminders completed:", {
        success: result.success,
        failed: result.failed,
        total: result.total,
      });
    } catch (error) {
      logger.error("Error in scheduled payment reminders:", error);
    }
  }

  /**
   * Run reminders immediately (for testing)
   */
  static async runRemindersNow(): Promise<{
    success: number;
    failed: number;
    total: number;
    details: any[];
  }> {
    logger.info("Running payment reminders immediately...");
    return await PaymentReminderService.sendAllReminders();
  }
}
