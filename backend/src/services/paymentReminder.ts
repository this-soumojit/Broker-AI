import { Sale, Client, User, Book } from "../models";
import { TwilioService } from "./twilio";
import { PaymentReminderEmailService } from "./paymentReminderEmail";
import { logger } from "../utils/logger";
import { Op } from "sequelize";

export interface PaymentReminderData {
  sale: any;
  buyer: any;
  seller: any;
  broker: any; // This should be the broker user (not seller)
  daysUntilDue: number;
  isOverdue: boolean;
}

export class PaymentReminderService {
  /**
   * Get all sales with upcoming due dates or overdue payments
   */
  static async getSalesForReminders(userId?: string): Promise<PaymentReminderData[]> {
    try {
      const currentDate = new Date();

      // Base where clause for payment status
      const saleWhereClause: any = {
        status: {
          [Op.in]: ["PENDING", "PARTIALLY_PAID", "OVERDUE"],
        },
      };

      // Include buyer/seller and book with user for filtering
      const includeClause: any = [
        {
          model: Client,
          as: "buyer",
          required: true,
        },
        {
          model: Client,
          as: "seller",
          required: true,
        },
        {
          model: Book,
          required: true,
          include: [
            {
              model: User,
              required: true,
            },
          ],
          where: userId ? { userId } : undefined,
        },
      ];

      // Find sales that need reminders
      const sales = await Sale.findAll({
        where: saleWhereClause,
        include: includeClause,
      });

      const reminderData: PaymentReminderData[] = [];

      for (const sale of sales) {
        const saleData = sale.dataValues;
        const saleWithIncludes = sale as any;
        if (!saleData.invoiceDate || !saleData.invoiceDueDays) continue;

        // Handle missing commission rate
        if (!saleData.commissionRate) {
          saleData.commissionRate = 2; // Default commission rate
        }

        const dueDate = new Date(saleData.invoiceDate);
        dueDate.setDate(dueDate.getDate() + saleData.invoiceDueDays);

        const timeDiff = dueDate.getTime() - currentDate.getTime();
        const daysUntilDue = Math.ceil(timeDiff / (1000 * 3600 * 24));

        // Check if this sale needs a reminder
        const needsReminder = [10, 5, 1, 0].includes(daysUntilDue) || daysUntilDue < 0;

        if (needsReminder) {
          // Get broker info from the book's user relation
          const saleWithBook = sale as any;
          const brokerUser = saleWithBook.Book?.User;

          if (!brokerUser) {
            logger.warn(`Broker not found for sale ${saleData.id}`);
            continue;
          }

          reminderData.push({
            sale: saleData,
            buyer: saleWithIncludes.buyer.dataValues,
            seller: saleWithIncludes.seller.dataValues,
            broker: brokerUser.dataValues, // Broker from book relation
            daysUntilDue,
            isOverdue: daysUntilDue < 0,
          });
        }
      }

      return reminderData;
    } catch (error) {
      logger.error("Error getting sales for reminders:", error);
      throw error;
    }
  }

  /**
   * Get all upcoming payments (for frontend display)
   */
  static async getAllUpcomingPayments(userId?: string): Promise<PaymentReminderData[]> {
    try {
      const currentDate = new Date();

      // Base where clause
      const saleWhereClause: any = {
        status: {
          [Op.in]: ["PENDING", "PARTIALLY_PAID", "OVERDUE"],
        },
      };

      // Include buyer/seller and book with user for display and filtering
      const includeClause: any = [
        {
          model: Client,
          as: "buyer",
          required: false,
        },
        {
          model: Client,
          as: "seller",
          required: false,
        },
        {
          model: Book,
          required: true,
          include: [
            {
              model: User,
              required: true,
            },
          ],
          where: userId ? { userId } : undefined,
        },
      ];

      const sales = await Sale.findAll({
        where: saleWhereClause,
        include: includeClause,
      });

      const paymentData: PaymentReminderData[] = [];

      for (const sale of sales) {
        const saleData = sale.dataValues;
        const saleWithIncludes = sale as any;

        // Handle missing dates
        if (!saleData.invoiceDate) {
          saleData.invoiceDate = saleData.createdAt || new Date();
        }
        if (!saleData.invoiceDueDays) {
          saleData.invoiceDueDays = 45;
        }
        if (!saleData.commissionRate) {
          saleData.commissionRate = 2;
        }

        // Calculate due date
        const dueDate = new Date(saleData.invoiceDate);
        dueDate.setDate(dueDate.getDate() + saleData.invoiceDueDays);
        const daysUntilDue = Math.ceil(
          (dueDate.getTime() - currentDate.getTime()) / (1000 * 3600 * 24),
        );

        if (daysUntilDue <= 90) {
          // Get broker info from book relation
          const saleWithBook = sale as any;
          const brokerUser = saleWithBook.Book?.User;

          paymentData.push({
            sale: saleData,
            buyer: saleWithIncludes.buyer?.dataValues || {
              id: "unknown",
              name: "Unknown Buyer",
              email: null,
              phone: null,
            },
            seller: saleWithIncludes.seller?.dataValues || {
              id: "unknown",
              name: "Unknown Seller",
              email: null,
            },
            broker: brokerUser?.dataValues || {
              id: "unknown",
              name: "Unknown Broker",
              email: null,
            },
            daysUntilDue,
            isOverdue: daysUntilDue < 0,
          });
        }
      }

      // Sort by due date
      paymentData.sort((a, b) => {
        if (a.isOverdue && !b.isOverdue) return -1;
        if (!a.isOverdue && b.isOverdue) return 1;
        return a.daysUntilDue - b.daysUntilDue;
      });

      return paymentData;
    } catch (error) {
      logger.error("Error getting all upcoming payments:", error);
      throw error;
    }
  }

  /**
   * Generate commission reminder message based on days until due
   */
  static generateReminderMessage(data: PaymentReminderData): string {
    const { sale, seller, broker, daysUntilDue, isOverdue } = data;

    const invoiceNumber = sale.invoiceNumber || "N/A";
    const invoiceAmount = sale.invoiceNetAmount || 0;
    const commissionRate = sale.commissionRate || 0;
    const commissionAmount = (invoiceAmount * commissionRate) / 100;
    const dueDate =
      sale.invoiceDate && sale.invoiceDueDays
        ? new Date(new Date(sale.invoiceDate).getTime() + sale.invoiceDueDays * 24 * 60 * 60 * 1000)
        : null;

    const formattedDueDate = dueDate ? dueDate.toLocaleDateString("en-IN") : "N/A";
    const formattedInvoiceAmount = `₹${invoiceAmount.toLocaleString()}`;
    const formattedCommissionAmount = `₹${commissionAmount.toLocaleString()}`;

    if (isOverdue) {
      const overdueDays = Math.abs(daysUntilDue);
      return `🚨 OVERDUE COMMISSION REMINDER 🚨

Dear ${seller.name},

Your commission payment for Sale Invoice #${invoiceNumber} is ${overdueDays} day(s) OVERDUE.

� Sale Details:
• Invoice Number: ${invoiceNumber}
• Invoice Amount: ${formattedInvoiceAmount}
• Commission Rate: ${commissionRate}%
• Commission Due: ${formattedCommissionAmount}
• Due Date: ${formattedDueDate}
• Days Overdue: ${overdueDays}

🏢 Broker/Agent Details:
• Name: ${broker.name}
• Email: ${broker.email || "N/A"}

📞 Your Contact Details:
• Name: ${seller.name}
• Email: ${seller.email || "N/A"}

Please process your commission payment immediately to avoid any inconvenience.

Thank you for your attention to this matter.`;
    } else if (daysUntilDue === 0) {
      return `⚠️ COMMISSION PAYMENT DUE TODAY ⚠️

Dear ${seller.name},

This is a reminder that your commission payment for Sale Invoice #${invoiceNumber} is due TODAY.

� Sale Details:
• Invoice Number: ${invoiceNumber}
• Invoice Amount: ${formattedInvoiceAmount}
• Commission Rate: ${commissionRate}%
• Commission Due: ${formattedCommissionAmount}
• Due Date: ${formattedDueDate}

🏢 Broker/Agent Details:
• Name: ${broker.name}
• Email: ${broker.email || "N/A"}

📞 Your Contact Details:
• Name: ${seller.name}
• Email: ${seller.email || "N/A"}

Please process your commission payment today to avoid late fees.

Thank you!`;
    } else {
      return `📋 COMMISSION PAYMENT REMINDER 📋

Dear ${seller.name},

This is a friendly reminder that your commission payment for Sale Invoice #${invoiceNumber} is due in ${daysUntilDue} day(s).

� Sale Details:
• Invoice Number: ${invoiceNumber}
• Invoice Amount: ${formattedInvoiceAmount}
• Commission Rate: ${commissionRate}%
• Commission Due: ${formattedCommissionAmount}
• Due Date: ${formattedDueDate}
• Days Remaining: ${daysUntilDue}

🏢 Broker/Agent Details:
• Name: ${broker.name}
• Email: ${broker.email || "N/A"}

📞 Your Contact Details:
• Name: ${seller.name}
• Email: ${seller.email || "N/A"}

Please ensure timely commission payment to maintain good business relations.

Thank you!`;
    }
  }

  /**
   * Send reminder via WhatsApp (Twilio) - DISABLED FOR BUYERS
   */
  static async sendWhatsAppReminder(data: PaymentReminderData): Promise<void> {
    console.log("🚀 DEBUG: sendWhatsAppReminder called");
    console.log("🚀 DEBUG: Seller phone:", data.seller.phone);
    console.log("🚀 DEBUG: Broker phone:", data.broker.phone);
    console.log("🚀 DEBUG: Sale invoice:", data.sale.invoiceNumber);

    // Log detailed phone number information
    logger.info(`📱 WhatsApp sending details for invoice ${data.sale.invoiceNumber}:`, {
      sellerName: data.seller.name,
      sellerPhone: data.seller.phone,
      sellerPhoneType: typeof data.seller.phone,
      sellerPhoneLength: data.seller.phone ? data.seller.phone.length : 0,
      brokerName: data.broker.name,
      brokerPhone: data.broker.phone,
      brokerPhoneType: typeof data.broker.phone,
      brokerPhoneLength: data.broker.phone ? data.broker.phone.length : 0,
      phonesAreEqual: data.seller.phone === data.broker.phone,
    });

    try {
      const commissionAmount = (data.sale.invoiceNetAmount * data.sale.commissionRate) / 100;

      // Calculate due date
      const dueDate = new Date(data.sale.invoiceDate);
      dueDate.setDate(dueDate.getDate() + (data.sale.invoiceDueDays || 0));

      // Send WhatsApp to seller (about commission they need to pay)
      const sellerMessage = `🔔 Payment Reminder

Dear ${data.seller.name},

Your sale invoice #${data.sale.invoiceNumber} has a commission payment due.

📊 Sale Details:
• Invoice Amount: ₹${data.sale.invoiceNetAmount.toLocaleString()}
• Commission Rate: ${data.sale.commissionRate}%
• Commission Due: ₹${commissionAmount.toLocaleString()}

⏰ Due Date: ${dueDate.toLocaleDateString("en-IN")}
${data.isOverdue ? "🚨 OVERDUE" : `⌛ ${Math.abs(data.daysUntilDue)} days ${data.daysUntilDue < 0 ? "overdue" : "remaining"}`}

Please process your commission payment at the earliest.

Thank you!`;

      // Send WhatsApp to broker (about commission they will receive)
      const brokerMessage = `🔔 Commission Reminder

Dear ${data.broker.name},

A commission payment is due for sale invoice #${data.sale.invoiceNumber}.

📊 Sale Details:
• Client: ${data.seller.name}
• Invoice Amount: ₹${data.sale.invoiceNetAmount.toLocaleString()}
• Commission Rate: ${data.sale.commissionRate}%
• Commission Amount: ₹${commissionAmount.toLocaleString()}

⏰ Due Date: ${dueDate.toLocaleDateString("en-IN")}
${data.isOverdue ? "🚨 OVERDUE" : `⌛ ${Math.abs(data.daysUntilDue)} days ${data.daysUntilDue < 0 ? "overdue" : "remaining"}`}

Commission collection pending.

Thank you!`;

      // Send to seller (who needs to pay the commission)
      if (data.seller.phone) {
        try {
          await TwilioService.sendWhatsApp({
            to: data.seller.phone,
            message: sellerMessage,
          });
          logger.info(
            `✅ WhatsApp reminder sent to seller ${data.seller.name} (${data.seller.phone})`,
          );
        } catch (sellerError) {
          logger.error(
            `❌ Failed to send WhatsApp to seller ${data.seller.name} (${data.seller.phone}):`,
            sellerError,
          );
        }
      } else {
        logger.warn(`⚠️ Seller ${data.seller.name} has no phone number - skipping WhatsApp`);
      }

      // Send to broker (who will receive the commission)
      if (data.broker.phone) {
        try {
          await TwilioService.sendWhatsApp({
            to: data.broker.phone,
            message: brokerMessage,
          });
          logger.info(
            `✅ WhatsApp reminder sent to broker ${data.broker.name} (${data.broker.phone})`,
          );
        } catch (brokerError) {
          logger.error(
            `❌ Failed to send WhatsApp to broker ${data.broker.name} (${data.broker.phone}):`,
            brokerError,
          );
        }
      } else {
        logger.warn(`⚠️ Broker ${data.broker.name} has no phone number - skipping WhatsApp`);
      }

      // NO WhatsApp to buyer (as per requirement)
      logger.info(`Buyer ${data.buyer.name} excluded from WhatsApp notifications`);
    } catch (error) {
      logger.error(`Failed to send WhatsApp reminders:`, error);
      throw error;
    }
  }

  /**
   * Send reminder via Email to seller and broker only (NO BUYER EMAILS)
   */
  static async sendEmailReminders(data: PaymentReminderData): Promise<{
    buyer: boolean;
    seller: boolean;
    broker: boolean;
  }> {
    console.log("🚀 DEBUG: sendEmailReminders called");
    console.log("🚀 DEBUG: Seller email:", data.seller.email);
    console.log("🚀 DEBUG: Broker email:", data.broker.email);
    try {
      // Calculate commission amount
      const invoiceAmount = data.sale.invoiceNetAmount || 0;
      const commissionRate = data.sale.commissionRate || 0;
      const commissionAmount = (invoiceAmount * commissionRate) / 100;

      const emailData = {
        sale: {
          id: data.sale.id,
          invoiceNumber: data.sale.invoiceNumber,
          totalAmount: invoiceAmount, // Full amount for reference
          commissionAmount: commissionAmount, // Commission amount for seller/broker
          commissionRate: commissionRate,
          dueDate: new Date(data.sale.invoiceDate).setDate(
            new Date(data.sale.invoiceDate).getDate() + (data.sale.invoiceDueDays || 0),
          ) as any,
        },
        buyer: {
          id: data.buyer.id,
          name: data.buyer.name,
          email: data.buyer.email,
          phone: data.buyer.phone,
        },
        seller: {
          id: data.seller.id,
          name: data.seller.name,
          email: data.seller.email,
        },
        broker: {
          id: data.broker.id,
          name: data.broker.name,
          email: data.broker.email,
        },
        daysUntilDue: data.daysUntilDue,
      };

      // Convert timestamp to Date object
      emailData.sale.dueDate = new Date(emailData.sale.dueDate);

      return await PaymentReminderEmailService.sendSellerAndBrokerEmails(emailData);
    } catch (error) {
      logger.error(`Failed to send email reminders for invoice ${data.sale.invoiceNumber}:`, error);
      throw error;
    }
  }

  /**
   * Send all payment reminders (WhatsApp + Email)
   */
  static async sendAllReminders(userId?: string): Promise<{
    success: number;
    failed: number;
    total: number;
    details: Array<{
      invoiceNumber: string;
      buyer: string;
      whatsapp: boolean;
      email: { buyer: boolean; seller: boolean; broker: boolean };
    }>;
  }> {
    try {
      const reminderData = await this.getSalesForReminders(userId);

      let successCount = 0;
      let failedCount = 0;
      const details: Array<{
        invoiceNumber: string;
        buyer: string;
        whatsapp: boolean;
        email: { buyer: boolean; seller: boolean; broker: boolean };
      }> = [];

      logger.info(
        `Found ${reminderData.length} sales that need payment reminders for user ${userId || "ALL"}`,
      );

      for (const data of reminderData) {
        const result = {
          invoiceNumber: data.sale.invoiceNumber,
          buyer: data.buyer.name,
          whatsapp: false,
          email: { buyer: false, seller: false, broker: false },
        };

        try {
          // Send WhatsApp reminder
          await this.sendWhatsAppReminder(data);
          result.whatsapp = true;
          logger.info(`WhatsApp sent for invoice ${data.sale.invoiceNumber}`);
        } catch (error) {
          logger.error(`WhatsApp failed for invoice ${data.sale.invoiceNumber}:`, error);
        }

        try {
          // Send email reminders to all three recipients
          result.email = await this.sendEmailReminders(data);
          logger.info(`Emails sent for invoice ${data.sale.invoiceNumber}`);
        } catch (error) {
          logger.error(`Email failed for invoice ${data.sale.invoiceNumber}:`, error);
        }

        // Consider success if at least seller or broker email was sent (no more WhatsApp to buyers)
        if (result.email.seller || result.email.broker) {
          successCount++;
        } else {
          failedCount++;
        }

        details.push(result);
      }

      logger.info(
        `Payment reminders completed for user ${userId || "ALL"}: ${successCount} success, ${failedCount} failed`,
      );

      return {
        success: successCount,
        failed: failedCount,
        total: reminderData.length,
        details,
      };
    } catch (error) {
      logger.error("Error sending payment reminders:", error);
      throw error;
    }
  }

  /**
   * Send reminder for a specific sale
   */
  static async sendSpecificReminder(saleId: string): Promise<{
    success: boolean;
    whatsapp: boolean;
    email: { buyer: boolean; seller: boolean; broker: boolean };
  }> {
    console.log("🚀 DEBUG: sendSpecificReminder called with saleId:", saleId);
    try {
      console.log("🚀 DEBUG: Starting sendSpecificReminder processing");
      logger.info(`Starting sendSpecificReminder for sale ID: ${saleId}`);

      const sale = await Sale.findByPk(saleId, {
        include: [
          { model: Client, as: "buyer", required: true },
          { model: Client, as: "seller", required: true },
          {
            model: Book,
            required: true,
            include: [{ model: User, required: true }],
          },
        ],
      });

      if (!sale) {
        logger.error(`Sale with ID ${saleId} not found`);
        throw new Error(`Sale with ID ${saleId} not found`);
      }

      logger.info(`Sale found: ${saleId}`, {
        invoiceNumber: sale.dataValues.invoiceNumber,
        status: sale.dataValues.status,
      });

      const saleWithIncludes = sale as any;

      // Get broker from book relation instead of separate lookups
      const brokerUser = saleWithIncludes.Book?.User;

      logger.info(`User lookup results:`, {
        bookId: saleWithIncludes.Book?.id,
        brokerUserFound: !!brokerUser,
        brokerUserId: brokerUser?.id,
      });

      if (!brokerUser) {
        logger.error("Broker user information not found in book relation");
        throw new Error("Broker user information not found");
      }

      const saleData = sale.dataValues;

      // Check if commission rate exists
      if (!saleData.commissionRate) {
        logger.warn(`Sale ${saleId} has no commission rate set. Defaulting to 0%`);
        saleData.commissionRate = 0;
      }

      const dueDate = new Date(saleData.invoiceDate);
      dueDate.setDate(dueDate.getDate() + saleData.invoiceDueDays);

      const timeDiff = dueDate.getTime() - new Date().getTime();
      const daysUntilDue = Math.ceil(timeDiff / (1000 * 3600 * 24));

      logger.info(`Due date calculation:`, {
        invoiceDate: saleData.invoiceDate,
        invoiceDueDays: saleData.invoiceDueDays,
        dueDate: dueDate,
        daysUntilDue: daysUntilDue,
      });

      const reminderData: PaymentReminderData = {
        sale: saleData,
        buyer: saleWithIncludes.buyer.dataValues,
        seller: saleWithIncludes.seller.dataValues,
        broker: brokerUser.dataValues,
        daysUntilDue,
        isOverdue: daysUntilDue < 0,
      };

      logger.info(`Reminder data prepared:`, {
        buyerName: reminderData.buyer.name,
        sellerName: reminderData.seller.name,
        brokerName: reminderData.broker.name,
        sellerPhone: reminderData.seller.phone,
        brokerPhone: reminderData.broker.phone,
        sellerEmail: reminderData.seller.email,
        brokerEmail: reminderData.broker.email,
      });

      const result = {
        success: false,
        whatsapp: false,
        email: { buyer: false, seller: false, broker: false },
      };

      // Send WhatsApp to seller and broker (but not buyer)
      logger.info("Attempting to send WhatsApp reminders...");
      try {
        await this.sendWhatsAppReminder(reminderData);
        result.whatsapp = true;
        logger.info("WhatsApp reminders sent successfully");
      } catch (error) {
        logger.error("WhatsApp reminders failed:", error);
        logger.error("WhatsApp error details:", {
          message: error instanceof Error ? error.message : String(error),
          stack: error instanceof Error ? error.stack : undefined,
        });
      }

      // Send emails to seller and broker only
      logger.info("Attempting to send email reminders...");
      try {
        result.email = await this.sendEmailReminders(reminderData);
        logger.info(`Email reminders completed for sale ${saleId}:`, result.email);

        // Update success criteria - we only send to seller and broker now
        result.success = result.email.seller || result.email.broker;

        logger.info(`Specific reminder for sale ${saleId} completed:`, {
          success: result.success,
          whatsapp: result.whatsapp,
          emailsSent: result.email,
        });

        return result;
      } catch (error) {
        logger.error("Email reminders failed:", error);
        logger.error("Email error details:", {
          message: error instanceof Error ? error.message : String(error),
          stack: error instanceof Error ? error.stack : undefined,
        });

        // Don't throw error, return the result with what was successful
        result.success = result.whatsapp; // At least WhatsApp might have worked
        return result;
      }
    } catch (error) {
      logger.error(`Error sending specific reminder for sale ${saleId}:`, error);
      logger.error("Full error details:", {
        message: error instanceof Error ? error.message : String(error),
        stack: error instanceof Error ? error.stack : undefined,
      });

      // Return error result instead of throwing
      return {
        success: false,
        whatsapp: false,
        email: { buyer: false, seller: false, broker: false },
      };
    }
  }
}
