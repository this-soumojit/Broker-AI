import { Router } from "express";
import {
  sendRemindersV1,
  getUpcomingDuePaymentsV1,
  sendSpecificReminderV1,
} from "../../controllers/payment-reminder";
import { authenticateV1 } from "../../middlewares/auth";
import { checkFeatureAccess } from "../../middlewares/planLimits";

const router = Router({ mergeParams: true });

/**
 * @swagger
 * tags:
 *   name: Payment Reminder
 *   description: Endpoints for payment reminder system
 *
 * /api/v1/users/{userId}/payment-reminders/send:
 *   post:
 *     tags:
 *       - Payment Reminder
 *     summary: Send payment reminders to all users with due payments
 *     description: Send SMS/WhatsApp reminders to users with payments due in 10, 5, 1 days or overdue
 *     operationId: sendPaymentReminders
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: userId
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     requestBody:
 *       required: false
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               preferWhatsApp:
 *                 type: boolean
 *                 default: true
 *                 description: Whether to prefer WhatsApp over SMS
 *               testMode:
 *                 type: boolean
 *                 default: false
 *                 description: If true, only returns data without sending messages
 *     responses:
 *       "200":
 *         description: Reminders sent successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 data:
 *                   type: object
 *                   properties:
 *                     success:
 *                       type: number
 *                     failed:
 *                       type: number
 *                     total:
 *                       type: number
 *       "401":
 *         description: Unauthorized
 *       "500":
 *         description: Internal server error
 */
router.post("/send", authenticateV1, checkFeatureAccess("paymentReminders"), sendRemindersV1);

/**
 * @swagger
 * /api/v1/users/{userId}/payment-reminders/upcoming:
 *   get:
 *     tags:
 *       - Payment Reminder
 *     summary: Get upcoming due payments
 *     description: Get list of all payments that are due or coming due
 *     operationId: getUpcomingDuePayments
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: userId
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       "200":
 *         description: Upcoming payments retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 data:
 *                   type: object
 *                   properties:
 *                     total:
 *                       type: number
 *                     overdue:
 *                       type: number
 *                     dueToday:
 *                       type: number
 *                     dueSoon:
 *                       type: number
 *                     payments:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           saleId:
 *                             type: string
 *                           invoiceNumber:
 *                             type: string
 *                           buyerName:
 *                             type: string
 *                           buyerPhone:
 *                             type: string
 *                           amount:
 *                             type: number
 *                           dueDate:
 *                             type: string
 *                             format: date-time
 *                           daysUntilDue:
 *                             type: number
 *                           isOverdue:
 *                             type: boolean
 *       "401":
 *         description: Unauthorized
 *       "500":
 *         description: Internal server error
 */
router.get("/upcoming", authenticateV1, getUpcomingDuePaymentsV1);

// Add a test endpoint without auth (temporary for debugging)
router.get("/test-upcoming", getUpcomingDuePaymentsV1);

// Add simple debug test endpoint
router.get("/debug-test", (req, res) => {
  console.log("🚀 DEBUG TEST: This endpoint was called");
  res.json({ message: "Debug test endpoint called successfully", timestamp: new Date() });
});

// Add WhatsApp sandbox info endpoint
router.get("/whatsapp-info", (req, res) => {
  const twilioNumber = process.env.TWILIO_WHATSAPP_NUMBER || "Not configured";
  const accountSid = process.env.TWILIO_ACCOUNT_SID || "Not configured";

  res.json({
    message: "WhatsApp Sandbox Setup Instructions",
    instructions: [
      "1. Open WhatsApp on your phone",
      `2. Send a message to: ${twilioNumber}`,
      "3. Send this exact message: 'join <code>' (you'll see the code in Twilio console)",
      "4. Wait for confirmation message",
      "5. Then your number will be registered for sandbox testing",
    ],
    twilioConsoleUrl: "https://console.twilio.com/us1/develop/sms/try-it-out/whatsapp-learn",
    currentSettings: {
      twilioNumber: twilioNumber,
      accountSid: accountSid.substring(0, 10) + "...",
      testPhone: "Need to register +916289931848",
    },
  });
});

// Add direct payment reminder test with exact database format
router.get("/test-reminder-direct", async (req, res) => {
  try {
    // Get the exact phone format from database
    const { Sale, Client, User } = require("../../models");

    const sale = await Sale.findOne({
      where: { invoiceNumber: "4964" },
      include: [
        { model: Client, as: "buyer", required: true },
        { model: Client, as: "seller", required: true },
      ],
    });

    if (!sale) {
      return res.json({ error: "Sale not found" });
    }

    const saleWithIncludes = sale as any;
    const { TwilioService } = require("../../services/twilio");

    const testMessage = `🧪 DIRECT TEST: Payment Reminder for Invoice #${sale.dataValues.invoiceNumber}
Amount: ₹${sale.dataValues.invoiceNetAmount}
This is a test message from your payment system.`;

    // Try with the exact phone number from database
    const phoneFromDB = saleWithIncludes.seller.dataValues.phone;
    console.log(`🚀 DEBUG: Testing with phone from DB: ${phoneFromDB}`);

    const result = await TwilioService.sendWhatsApp({
      to: phoneFromDB,
      message: testMessage,
    });

    res.json({
      success: true,
      message: "WhatsApp sent successfully!",
      phoneUsed: phoneFromDB,
      messageId: result.sid,
    });
  } catch (error) {
    res.json({
      success: false,
      error: (error as Error).message,
      suggestion: "Try re-registering your WhatsApp number with Twilio sandbox",
    });
  }
});

// Add Twilio account verification endpoint
router.get("/verify-twilio", async (req, res) => {
  try {
    const twilio = require("twilio");
    const accountSid = process.env.TWILIO_ACCOUNT_SID;
    const authToken = process.env.TWILIO_AUTH_TOKEN;
    const twilioWhatsAppNumber = process.env.TWILIO_WHATSAPP_NUMBER;

    if (!accountSid || !authToken || !twilioWhatsAppNumber) {
      return res.json({
        success: false,
        error: "Twilio credentials not configured",
        config: {
          hasSid: !!accountSid,
          hasToken: !!authToken,
          hasWhatsAppNumber: !!twilioWhatsAppNumber,
        },
      });
    }

    const client = twilio(accountSid, authToken);

    // Try to get account info to verify credentials
    const account = await client.api.accounts(accountSid).fetch();

    res.json({
      success: true,
      message: "Twilio connection successful",
      account: {
        sid: account.sid,
        friendlyName: account.friendlyName,
        status: account.status,
        type: account.type,
      },
      config: {
        twilioWhatsAppNumber: twilioWhatsAppNumber,
        accountSid: accountSid.substring(0, 10) + "...",
      },
    });
  } catch (error) {
    res.json({
      success: false,
      error: (error as Error).message,
      message: "Failed to connect to Twilio account",
    });
  }
});

// Add WhatsApp registration check endpoint
router.get("/check-whatsapp-registration/:phone", async (req, res) => {
  try {
    const { TwilioService } = require("../../services/twilio");
    const testMessage =
      "🧪 Testing WhatsApp registration - if you receive this, your number is registered!";

    const result = await TwilioService.sendWhatsApp({
      to: req.params.phone,
      message: testMessage,
    });

    res.json({
      success: true,
      message: "WhatsApp registration successful!",
      phone: req.params.phone,
      messageId: result.sid,
    });
  } catch (error) {
    const errorMessage = (error as Error).message;
    let registrationStatus = "Unknown error";
    let instructions: string[] = [];

    if (errorMessage.includes("Invalid From and To pair")) {
      registrationStatus = "Phone number NOT registered in Twilio WhatsApp sandbox";
      instructions = [
        "1. Open WhatsApp on your phone",
        "2. Send a message to: +14155238886",
        "3. Go to: https://console.twilio.com/us1/develop/sms/try-it-out/whatsapp-learn",
        "4. Find the join code (like 'join coffee-elephant')",
        "5. Send that exact message to +14155238886",
        "6. Wait for confirmation",
        "7. Test this endpoint again",
      ];
    }

    res.json({
      success: false,
      error: errorMessage,
      registrationStatus,
      instructions,
      phone: req.params.phone,
      twilioSandboxNumber: "+14155238886",
      consoleUrl: "https://console.twilio.com/us1/develop/sms/try-it-out/whatsapp-learn",
    });
  }
});

// Add WhatsApp test endpoint
router.get("/test-whatsapp/:phone", async (req, res) => {
  try {
    const { TwilioService } = require("../../services/twilio");
    const result = await TwilioService.sendWhatsApp({
      to: req.params.phone,
      message: "Test message from payment reminder system!",
    });
    res.json({ success: true, result });
  } catch (error) {
    res.json({ success: false, error: (error as Error).message });
  }
});

// Add email test endpoint
router.get("/test-email/:email", async (req, res) => {
  try {
    const { PaymentReminderEmailService } = require("../../services/paymentReminderEmail");
    const testData = {
      sale: {
        id: 1,
        invoiceNumber: "TEST-001",
        totalAmount: 10000,
        commissionAmount: 500,
        commissionRate: 5,
        dueDate: new Date(),
      },
      buyer: { id: 1, name: "Test Buyer", email: req.params.email, phone: "1234567890" },
      seller: { id: 2, name: "Test Seller", email: req.params.email },
      broker: { id: 3, name: "Test Broker", email: req.params.email },
      daysUntilDue: -5,
    };

    await PaymentReminderEmailService.sendSellerEmail(testData);
    res.json({ success: true, message: "Test email sent successfully" });
  } catch (error) {
    res.json({ success: false, error: (error as Error).message });
  }
});

// Add debug endpoint for specific invoice
router.get("/debug/:invoiceNumber", async (req, res) => {
  try {
    const { invoiceNumber } = req.params;
    const { Sale, Client, User } = require("../../models");

    const sale = await Sale.findOne({
      where: { invoiceNumber },
      include: [
        { model: Client, as: "buyer", required: false },
        { model: Client, as: "seller", required: false },
      ],
    });

    if (!sale) {
      return res.json({ error: "Sale not found", invoiceNumber });
    }

    const saleWithIncludes = sale as any;
    let buyerUser = null;
    let brokerUser = null;

    if (saleWithIncludes.buyer?.dataValues?.userId) {
      buyerUser = await User.findByPk(saleWithIncludes.buyer.dataValues.userId);
    }

    if (saleWithIncludes.seller?.dataValues?.userId) {
      brokerUser = await User.findByPk(saleWithIncludes.seller.dataValues.userId);
    }

    res.json({
      invoiceNumber,
      sale: sale.dataValues,
      buyer: saleWithIncludes.buyer?.dataValues || null,
      seller: saleWithIncludes.seller?.dataValues || null,
      buyerUser: buyerUser?.dataValues || null,
      brokerUser: brokerUser?.dataValues || null,
      debug: {
        hasBuyer: !!saleWithIncludes.buyer,
        hasSeller: !!saleWithIncludes.seller,
        buyerPhone: saleWithIncludes.buyer?.dataValues?.phone || "MISSING",
        buyerEmail: buyerUser?.dataValues?.email || "MISSING",
        brokerEmail: brokerUser?.dataValues?.email || "MISSING",
      },
    });
  } catch (error) {
    res.json({
      error: error instanceof Error ? error.message : "Unknown error",
      invoiceNumber: req.params.invoiceNumber,
    });
  }
});

/**
 * @swagger
 * /api/v1/users/{userId}/payment-reminders/send/{saleId}:
 *   post:
 *     tags:
 *       - Payment Reminder
 *     summary: Send reminder for specific sale
 *     description: Send SMS/WhatsApp reminder for a specific sale
 *     operationId: sendSpecificReminder
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: userId
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *       - name: saleId
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     requestBody:
 *       required: false
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               preferWhatsApp:
 *                 type: boolean
 *                 default: true
 *                 description: Whether to prefer WhatsApp over SMS
 *     responses:
 *       "200":
 *         description: Reminder sent successfully
 *       "404":
 *         description: Sale not found or doesn't need reminder
 *       "401":
 *         description: Unauthorized
 *       "500":
 *         description: Failed to send reminder
 */
router.post(
  "/send/:saleId",
  authenticateV1,
  checkFeatureAccess("paymentReminders"),
  sendSpecificReminderV1,
);

export { router as paymentReminderRoutes };
