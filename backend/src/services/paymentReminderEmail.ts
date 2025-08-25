import nodemailer from "nodemailer";
import env from "../config/env";
import { logger } from "../utils/logger";

// Create a direct transporter for HTML emails
const transporter = nodemailer.createTransport({
  host: env.SMTP.HOST as string,
  port: parseInt(env.SMTP.PORT as string, 10),
  secure: env.SMTP.SECURE === "true",
  auth: {
    user: env.SMTP.USER as string,
    pass: env.SMTP.PASSWORD as string,
  },
});

interface SendMailOptions {
  to: string;
  subject: string;
  html: string;
}

// Direct mail sending function for HTML content
async function sendMail(options: SendMailOptions) {
  const info = await transporter.sendMail({
    from: `"${env.SMTP.FROM_NAME}" <${env.SMTP.FROM_EMAIL}>`,
    to: options.to,
    subject: options.subject,
    html: options.html,
  });

  logger.info("Payment reminder email sent: %s", info.messageId);
  return info;
}

interface PaymentReminderEmailData {
  sale: {
    id: number;
    invoiceNumber: string;
    totalAmount: number;
    commissionAmount: number;
    commissionRate: number;
    dueDate: Date;
  };
  buyer: {
    id: number;
    name: string;
    email?: string;
    phone?: string;
  };
  seller: {
    id: number;
    name: string;
    email?: string;
  };
  broker: {
    id: number;
    name: string;
    email?: string;
  };
  daysUntilDue: number;
}

export class PaymentReminderEmailService {
  /**
   * Generate email content for buyer
   */
  private static generateBuyerEmailContent(data: PaymentReminderEmailData): {
    subject: string;
    html: string;
  } {
    const { sale, buyer, seller, broker, daysUntilDue } = data;
    const formattedAmount = new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
    }).format(sale.totalAmount);
    const formattedDueDate = sale.dueDate.toLocaleDateString("en-IN");

    let subject: string;
    let urgencyLevel: string;
    let urgencyColor: string;

    if (daysUntilDue < 0) {
      subject = `⚠️ OVERDUE PAYMENT - Invoice #${sale.invoiceNumber}`;
      urgencyLevel = "OVERDUE";
      urgencyColor = "#dc2626";
    } else if (daysUntilDue === 0) {
      subject = `⚠️ PAYMENT DUE TODAY - Invoice #${sale.invoiceNumber}`;
      urgencyLevel = "DUE TODAY";
      urgencyColor = "#ea580c";
    } else {
      subject = `📋 Payment Reminder - Invoice #${sale.invoiceNumber} Due in ${daysUntilDue} Days`;
      urgencyLevel = `DUE IN ${daysUntilDue} DAYS`;
      urgencyColor = "#059669";
    }

    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: ${urgencyColor}; color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0; }
          .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 8px 8px; }
          .invoice-details { background: white; padding: 20px; border-radius: 8px; margin: 20px 0; }
          .contact-section { background: white; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #3b82f6; }
          .detail-row { display: flex; justify-content: space-between; margin: 10px 0; padding: 8px 0; border-bottom: 1px solid #eee; }
          .amount { font-weight: bold; font-size: 1.2em; color: ${urgencyColor}; }
          .footer { text-align: center; margin-top: 30px; color: #666; font-size: 0.9em; }
          .section-title { font-weight: bold; color: #1f2937; margin-bottom: 15px; border-bottom: 2px solid #e5e7eb; padding-bottom: 5px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Payment Reminder</h1>
            <h2>${urgencyLevel}</h2>
          </div>
          <div class="content">
            <p>Dear ${buyer.name},</p>
            
            <p>This is a ${daysUntilDue < 0 ? "urgent reminder" : "friendly reminder"} regarding your payment for the following invoice:</p>
            
            <div class="invoice-details">
              <div class="section-title">📋 Invoice Information</div>
              <div class="detail-row">
                <span><strong>Invoice Number:</strong></span>
                <span>${sale.invoiceNumber}</span>
              </div>
              <div class="detail-row">
                <span><strong>Amount:</strong></span>
                <span class="amount">${formattedAmount}</span>
              </div>
              <div class="detail-row">
                <span><strong>Due Date:</strong></span>
                <span>${formattedDueDate}</span>
              </div>
              ${
                daysUntilDue < 0
                  ? `
              <div class="detail-row">
                <span><strong>Days Overdue:</strong></span>
                <span style="color: #dc2626; font-weight: bold;">${Math.abs(daysUntilDue)} days</span>
              </div>
              `
                  : daysUntilDue === 0
                    ? `
              <div class="detail-row">
                <span><strong>Status:</strong></span>
                <span style="color: #ea580c; font-weight: bold;">Due Today</span>
              </div>
              `
                    : `
              <div class="detail-row">
                <span><strong>Days Remaining:</strong></span>
                <span style="color: #059669; font-weight: bold;">${daysUntilDue} days</span>
              </div>
              `
              }
            </div>

            <div class="contact-section">
              <div class="section-title">👤 Seller Information</div>
              <div class="detail-row">
                <span><strong>Name:</strong></span>
                <span>${seller.name}</span>
              </div>
              <div class="detail-row">
                <span><strong>Email:</strong></span>
                <span>${seller.email || "N/A"}</span>
              </div>
            </div>

            <div class="contact-section">
              <div class="section-title">🏢 Broker/Agent Information</div>
              <div class="detail-row">
                <span><strong>Name:</strong></span>
                <span>${broker.name}</span>
              </div>
              <div class="detail-row">
                <span><strong>Email:</strong></span>
                <span>${broker.email || "N/A"}</span>
              </div>
            </div>

            <div class="contact-section">
              <div class="section-title">📞 Your Contact Details</div>
              <div class="detail-row">
                <span><strong>Name:</strong></span>
                <span>${buyer.name}</span>
              </div>
              <div class="detail-row">
                <span><strong>Email:</strong></span>
                <span>${buyer.email || "N/A"}</span>
              </div>
              <div class="detail-row">
                <span><strong>Phone:</strong></span>
                <span>${buyer.phone || "N/A"}</span>
              </div>
            </div>
            
            <p>
              ${
                daysUntilDue < 0
                  ? "Your payment is now overdue. Please make the payment immediately to avoid any further inconvenience and potential late fees."
                  : daysUntilDue === 0
                    ? "Your payment is due today. Please process the payment as soon as possible."
                    : `Please ensure timely payment within ${daysUntilDue} days to maintain good business relations.`
              }
            </p>
            
            <p>If you have any questions or concerns, please don't hesitate to contact the seller or broker using the information provided above.</p>
            
            <p>Thank you for your prompt attention to this matter.</p>
            
            <p>Best regards,<br>
            ${seller.name}</p>
          </div>
          <div class="footer">
            <p>This is an automated payment reminder. Please do not reply to this email.</p>
          </div>
        </div>
      </body>
      </html>
    `;

    return { subject, html };
  }

  /**
   * Generate email content for seller
   */
  private static generateSellerEmailContent(data: PaymentReminderEmailData): {
    subject: string;
    html: string;
  } {
    const { sale, buyer, seller, broker, daysUntilDue } = data;
    const formattedCommissionAmount = new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
    }).format(sale.commissionAmount);
    const formattedTotalAmount = new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
    }).format(sale.totalAmount);
    const formattedDueDate = sale.dueDate.toLocaleDateString("en-IN");

    const subject = `Commission Payment Due - Invoice #${sale.invoiceNumber} (${buyer.name})`;

    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: #dc2626; color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0; }
          .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 8px 8px; }
          .invoice-details { background: white; padding: 20px; border-radius: 8px; margin: 20px 0; }
          .contact-section { background: white; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #3b82f6; }
          .detail-row { display: flex; justify-content: space-between; margin: 10px 0; padding: 8px 0; border-bottom: 1px solid #eee; }
          .section-title { font-weight: bold; color: #1f2937; margin-bottom: 15px; border-bottom: 2px solid #e5e7eb; padding-bottom: 5px; }
          .status-badge { padding: 4px 12px; border-radius: 20px; font-size: 0.9em; font-weight: bold; }
          .overdue { background: #fef2f2; color: #dc2626; }
          .due-today { background: #fff7ed; color: #ea580c; }
          .upcoming { background: #f0fdf4; color: #059669; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Commission Payment Due</h1>
            <p>Payment Reminder for Your Client's Invoice</p>
          </div>
          <div class="content">
            <p>Dear ${seller.name},</p>
            
            <p>This is a reminder that your commission payment is due for the following client invoice:</p>
            
            <div style="background: #fef2f2; padding: 15px; border-radius: 8px; margin: 15px 0; border-left: 4px solid #dc2626;">
              <h3 style="color: #dc2626; margin: 0 0 10px 0;">� Commission Payment Due</h3>
              <p style="font-size: 1.5em; font-weight: bold; color: #dc2626; margin: 0;">${formattedCommissionAmount}</p>
              <p style="margin: 5px 0 0 0; color: #666;">Commission Rate: ${sale.commissionRate}%</p>
            </div>
            
            <div class="invoice-details">
              <div class="section-title">📋 Invoice Information</div>
              <div class="detail-row">
                <span><strong>Invoice Number:</strong></span>
                <span>${sale.invoiceNumber}</span>
              </div>
              <div class="detail-row">
                <span><strong>Total Invoice Amount:</strong></span>
                <span>${formattedTotalAmount}</span>
              </div>
              <div class="detail-row">
                <span><strong>Commission Due:</strong></span>
                <span style="font-weight: bold; color: #dc2626;">${formattedCommissionAmount}</span>
              </div>
              <div class="detail-row">
                <span><strong>Due Date:</strong></span>
                <span>${formattedDueDate}</span>
              </div>
              <div class="detail-row">
                <span><strong>Payment Status:</strong></span>
                <span class="status-badge ${daysUntilDue < 0 ? "overdue" : daysUntilDue === 0 ? "due-today" : "upcoming"}">
                  ${daysUntilDue < 0 ? `Overdue (${Math.abs(daysUntilDue)} days)` : daysUntilDue === 0 ? "Due Today" : `Due in ${daysUntilDue} days`}
                </span>
              </div>
            </div>

            <div class="contact-section">
              <div class="section-title">👤 Client Information</div>
              <div class="detail-row">
                <span><strong>Name:</strong></span>
                <span>${buyer.name}</span>
              </div>
              <div class="detail-row">
                <span><strong>Email:</strong></span>
                <span>${buyer.email || "N/A"}</span>
              </div>
              <div class="detail-row">
                <span><strong>Phone:</strong></span>
                <span>${buyer.phone || "N/A"}</span>
              </div>
            </div>

            <div class="contact-section">
              <div class="section-title">🏢 Broker/Agent Information</div>
              <div class="detail-row">
                <span><strong>Name:</strong></span>
                <span>${broker.name}</span>
              </div>
              <div class="detail-row">
                <span><strong>Email:</strong></span>
                <span>${broker.email || "N/A"}</span>
              </div>
            </div>

            <div class="contact-section">
              <div class="section-title">📧 Your Information</div>
              <div class="detail-row">
                <span><strong>Name:</strong></span>
                <span>${seller.name}</span>
              </div>
              <div class="detail-row">
                <span><strong>Email:</strong></span>
                <span>${seller.email || "N/A"}</span>
              </div>
            </div>
            
            <p><strong>📨 Action Taken:</strong> Payment reminder sent to ${buyer.name}.</p>
            
            <p>Please arrange to pay your commission of <strong>${formattedCommissionAmount}</strong> to the broker by the due date.</p>
            
            <p>Best regards,<br>
            Commission Management System</p>
          </div>
        </div>
      </body>
      </html>
    `;

    return { subject, html };
  }

  /**
   * Generate email content for broker
   */
  private static generateBrokerEmailContent(data: PaymentReminderEmailData): {
    subject: string;
    html: string;
  } {
    const { sale, buyer, seller, broker, daysUntilDue } = data;
    const formattedCommissionAmount = new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
    }).format(sale.commissionAmount);
    const formattedTotalAmount = new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
    }).format(sale.totalAmount);
    const formattedDueDate = sale.dueDate.toLocaleDateString("en-IN");

    const subject = `Commission Alert - Payment Reminder Sent for Invoice #${sale.invoiceNumber}`;

    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: #1f2937; color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0; }
          .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 8px 8px; }
          .invoice-details { background: white; padding: 20px; border-radius: 8px; margin: 20px 0; }
          .contact-section { background: white; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #3b82f6; }
          .detail-row { display: flex; justify-content: space-between; margin: 10px 0; padding: 8px 0; border-bottom: 1px solid #eee; }
          .section-title { font-weight: bold; color: #1f2937; margin-bottom: 15px; border-bottom: 2px solid #e5e7eb; padding-bottom: 5px; }
          .status-badge { padding: 4px 12px; border-radius: 20px; font-size: 0.9em; font-weight: bold; }
          .overdue { background: #fef2f2; color: #dc2626; }
          .due-today { background: #fff7ed; color: #ea580c; }
          .upcoming { background: #f0fdf4; color: #059669; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Commission Alert</h1>
            <p>Broker Dashboard Update</p>
          </div>
          <div class="content">
            <p>Dear ${broker.name},</p>
            
            <p>A payment reminder has been sent to the client. Commission details below:</p>
            
            <div style="background: #f0fdf4; padding: 15px; border-radius: 8px; margin: 15px 0; border-left: 4px solid #059669;">
              <h3 style="color: #059669; margin: 0 0 10px 0;">💰 Commission Tracking</h3>
              <p style="font-size: 1.3em; font-weight: bold; color: #059669; margin: 0;">${formattedCommissionAmount}</p>
              <p style="margin: 5px 0 0 0; color: #666;">Expected commission from this transaction</p>
            </div>
            
            <div class="invoice-details">
              <div class="section-title">📋 Transaction Overview</div>
              <div class="detail-row">
                <span><strong>Invoice Number:</strong></span>
                <span>${sale.invoiceNumber}</span>
              </div>
              <div class="detail-row">
                <span><strong>Total Invoice Amount:</strong></span>
                <span>${formattedTotalAmount}</span>
              </div>
              <div class="detail-row">
                <span><strong>Commission Amount:</strong></span>
                <span style="font-weight: bold; color: #059669;">${formattedCommissionAmount}</span>
              </div>
              <div class="detail-row">
                <span><strong>Commission Rate:</strong></span>
                <span>${sale.commissionRate}%</span>
              </div>
              <div class="detail-row">
                <span><strong>Due Date:</strong></span>
                <span>${formattedDueDate}</span>
              </div>
              <div class="detail-row">
                <span><strong>Payment Status:</strong></span>
                <span class="status-badge ${daysUntilDue < 0 ? "overdue" : daysUntilDue === 0 ? "due-today" : "upcoming"}">
                  ${daysUntilDue < 0 ? `Overdue (${Math.abs(daysUntilDue)} days)` : daysUntilDue === 0 ? "Due Today" : `Due in ${daysUntilDue} days`}
                </span>
              </div>
            </div>

            <div class="contact-section">
              <div class="section-title">👤 Buyer Information</div>
              <div class="detail-row">
                <span><strong>Name:</strong></span>
                <span>${buyer.name}</span>
              </div>
              <div class="detail-row">
                <span><strong>Email:</strong></span>
                <span>${buyer.email || "N/A"}</span>
              </div>
              <div class="detail-row">
                <span><strong>Phone:</strong></span>
                <span>${buyer.phone || "N/A"}</span>
              </div>
            </div>

            <div class="contact-section">
              <div class="section-title">🏪 Seller Information</div>
              <div class="detail-row">
                <span><strong>Name:</strong></span>
                <span>${seller.name}</span>
              </div>
              <div class="detail-row">
                <span><strong>Email:</strong></span>
                <span>${seller.email || "N/A"}</span>
              </div>
            </div>

            <div class="contact-section">
              <div class="section-title">🔧 Your Broker Details</div>
              <div class="detail-row">
                <span><strong>Name:</strong></span>
                <span>${broker.name}</span>
              </div>
              <div class="detail-row">
                <span><strong>Email:</strong></span>
                <span>${broker.email || "N/A"}</span>
              </div>
            </div>
            
            <p><strong>📨 Action Taken:</strong> Payment reminder sent to ${buyer.name}.</p>
            
            <p><strong>� Commission Status:</strong> You will receive <strong>${formattedCommissionAmount}</strong> commission once the client pays the invoice.</p>

            <p><strong>�📞 Next Steps:</strong> Monitor payment status and follow up with the client if necessary to ensure timely collection.</p>

            <p>${
              daysUntilDue < 0
                ? `<strong>⚠️ Priority Action Required:</strong> This payment is ${Math.abs(daysUntilDue)} days overdue. Immediate follow-up recommended.`
                : daysUntilDue === 0
                  ? `<strong>🎯 Today's Priority:</strong> Payment is due today. Monitor for payment confirmation.`
                  : `<strong>📅 Upcoming:</strong> Payment due in ${daysUntilDue} days. Standard follow-up schedule applies.`
            }</p>
            
            <p>Best regards,<br>
            Commission Management System</p>
          </div>
        </div>
      </body>
      </html>
    `;

    return { subject, html };
  }

  /**
   * Send email to buyer
   */
  static async sendBuyerEmail(data: PaymentReminderEmailData): Promise<void> {
    try {
      if (!data.buyer.email) {
        logger.warn(`No email found for buyer: ${data.buyer.name}`);
        return;
      }

      const { subject, html } = this.generateBuyerEmailContent(data);

      await sendMail({
        to: data.buyer.email,
        subject,
        html,
      });

      logger.info(`Payment reminder email sent to buyer: ${data.buyer.name} (${data.buyer.email})`);
    } catch (error) {
      logger.error(`Failed to send email to buyer ${data.buyer.name}:`, error);
      throw error;
    }
  }

  /**
   * Send email to seller
   */
  static async sendSellerEmail(data: PaymentReminderEmailData): Promise<void> {
    try {
      if (!data.seller.email) {
        logger.warn(`No email found for seller: ${data.seller.name}`);
        return;
      }

      const { subject, html } = this.generateSellerEmailContent(data);

      await sendMail({
        to: data.seller.email,
        subject,
        html,
      });

      logger.info(
        `Payment reminder notification sent to seller: ${data.seller.name} (${data.seller.email})`,
      );
    } catch (error) {
      logger.error(`Failed to send email to seller ${data.seller.name}:`, error);
      throw error;
    }
  }

  /**
   * Send email to broker
   */
  static async sendBrokerEmail(data: PaymentReminderEmailData): Promise<void> {
    try {
      if (!data.broker.email) {
        logger.warn(`No email found for broker: ${data.broker.name}`);
        return;
      }

      const { subject, html } = this.generateBrokerEmailContent(data);

      await sendMail({
        to: data.broker.email,
        subject,
        html,
      });

      logger.info(
        `Payment reminder notification sent to broker: ${data.broker.name} (${data.broker.email})`,
      );
    } catch (error) {
      logger.error(`Failed to send email to broker ${data.broker.name}:`, error);
      throw error;
    }
  }

  /**
   * Send emails to seller and broker only (NO BUYER EMAILS)
   */
  static async sendSellerAndBrokerEmails(data: PaymentReminderEmailData): Promise<{
    buyer: boolean;
    seller: boolean;
    broker: boolean;
  }> {
    const results = {
      buyer: false, // Always false - buyers don't get emails anymore
      seller: false,
      broker: false,
    };

    // Send seller email
    try {
      await this.sendSellerEmail(data);
      results.seller = true;
    } catch (error) {
      logger.error("Failed to send seller email:", error);
    }

    // Send broker email
    try {
      await this.sendBrokerEmail(data);
      results.broker = true;
    } catch (error) {
      logger.error("Failed to send broker email:", error);
    }

    return results;
  }

  /**
   * Send emails to all three recipients (LEGACY METHOD - keeping for compatibility)
   */
  static async sendAllEmails(data: PaymentReminderEmailData): Promise<{
    buyer: boolean;
    seller: boolean;
    broker: boolean;
  }> {
    const results = {
      buyer: false,
      seller: false,
      broker: false,
    };

    // Send buyer email
    try {
      await this.sendBuyerEmail(data);
      results.buyer = true;
    } catch (error) {
      logger.error("Failed to send buyer email:", error);
    }

    // Send seller email
    try {
      await this.sendSellerEmail(data);
      results.seller = true;
    } catch (error) {
      logger.error("Failed to send seller email:", error);
    }

    // Send broker email
    try {
      await this.sendBrokerEmail(data);
      results.broker = true;
    } catch (error) {
      logger.error("Failed to send broker email:", error);
    }

    return results;
  }
}
