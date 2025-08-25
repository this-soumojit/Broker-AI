import twilio from "twilio";
import { logger } from "../utils/logger";

// Twilio configuration
const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const twilioWhatsAppNumber = process.env.TWILIO_WHATSAPP_NUMBER;

const client = twilio(accountSid, authToken);

interface WhatsAppOptions {
  to: string;
  message: string;
}

export class TwilioService {
  /**
   * Send WhatsApp message using Twilio
   */
  static async sendWhatsApp({ to, message }: WhatsAppOptions): Promise<any> {
    try {
      if (!accountSid || !authToken || !twilioWhatsAppNumber) {
        throw new Error("Twilio credentials not configured");
      }

      // Format phone number to international format (Indian numbers)
      let formattedPhone = to.trim();

      // If already has +91, use as is
      if (formattedPhone.startsWith("+91")) {
        // Keep as is
      }
      // If starts with +, assume it's already international
      else if (formattedPhone.startsWith("+")) {
        // Keep as is
      }
      // If starts with 0, remove it and add +91
      else if (formattedPhone.startsWith("0")) {
        formattedPhone = `+91${formattedPhone.substring(1)}`;
      }
      // Otherwise, add +91 directly
      else {
        formattedPhone = `+91${formattedPhone}`;
      }

      logger.info(`Sending WhatsApp to: ${to} → formatted as: ${formattedPhone}`);

      const result = await client.messages.create({
        body: message,
        from: twilioWhatsAppNumber,
        to: `whatsapp:${formattedPhone}`,
      });

      logger.info(`WhatsApp message sent successfully to ${formattedPhone}`, {
        messageId: result.sid,
        status: result.status,
        errorCode: result.errorCode,
        errorMessage: result.errorMessage,
      });
      return result;
    } catch (error) {
      logger.error("Failed to send WhatsApp message via Twilio:", error);
      throw error;
    }
  }
}
