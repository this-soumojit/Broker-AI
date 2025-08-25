import { Request, Response } from "express";
import multer from "multer";
import { sendEmail } from "../../services/smtp";
import { showError } from "../../utils/error";
import { logger } from "../../utils/logger";

// Configure multer for file upload
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
  },
  fileFilter: (req, file, cb) => {
    if (file.mimetype === 'application/pdf') {
      cb(null, true);
    } else {
      cb(new Error('Only PDF files are allowed'));
    }
  },
});

// Middleware to handle single PDF file upload
export const uploadPDF = upload.single('invoice');

// Define interface for request with file
interface RequestWithFile extends Request {
  file?: Express.Multer.File;
}

// Simple response helpers
const successResponse = (res: Response, message: string, data?: any) => {
  return res.status(200).json({
    success: true,
    message,
    data,
  });
};

const errorResponse = (res: Response, message: string, statusCode: number = 500) => {
  return res.status(statusCode).json({
    success: false,
    message,
  });
};

/**
 * @swagger
 * /api/invoice-mail/send:
 *   post:
 *     summary: Send invoice PDF via email
 *     tags:
 *       - Invoice Mail
 *     consumes:
 *       - multipart/form-data
 *     parameters:
 *       - in: formData
 *         name: invoice
 *         type: file
 *         required: true
 *         description: PDF file of the invoice
 *       - in: formData
 *         name: recipientEmail
 *         type: string
 *         required: true
 *         description: Email address to send the invoice to
 *       - in: formData
 *         name: recipientName
 *         type: string
 *         required: false
 *         description: Name of the recipient
 *       - in: formData
 *         name: invoiceNumber
 *         type: string
 *         required: false
 *         description: Invoice number for reference
 *       - in: formData
 *         name: senderName
 *         type: string
 *         required: false
 *         description: Name of the sender
 *       - in: formData
 *         name: customMessage
 *         type: string
 *         required: false
 *         description: Custom message to include in the email
 *     responses:
 *       200:
 *         description: Email sent successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: "Invoice email sent successfully"
 *       400:
 *         description: Bad request - missing required fields or invalid file
 *       500:
 *         description: Internal server error
 */
export async function sendInvoiceEmail(req: RequestWithFile, res: Response) {
  try {
    const {
      recipientEmail,
      recipientName = "Customer",
      invoiceNumber = "N/A",
      senderName = "Your Company",
      customMessage = "",
    } = req.body;

    // Validate required fields
    if (!recipientEmail) {
      return errorResponse(res, "Recipient email is required", 400);
    }

    if (!req.file) {
      return errorResponse(res, "PDF file is required", 400);
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(recipientEmail)) {
      return errorResponse(res, "Invalid email format", 400);
    }

    // Prepare email attachment
    const attachment = {
      filename: `invoice-${invoiceNumber || 'document'}.pdf`,
      content: req.file.buffer,
      contentType: 'application/pdf',
    };

    // Prepare email context
    const emailContext = {
      recipientName,
      senderName,
      invoiceNumber,
      customMessage,
      currentDate: new Date().toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      }),
      currentYear: new Date().getFullYear().toString(),
    };

    // Send email
    await sendEmail({
      to: recipientEmail,
      subject: `Invoice ${invoiceNumber ? `#${invoiceNumber}` : 'Document'} from ${senderName}`,
      template: "invoice-email", // This will look for invoice-email.ejs template
      context: emailContext,
      attachments: [attachment],
    });

    logger.info(`Invoice email sent successfully to ${recipientEmail}`);

    return successResponse(res, "Invoice email sent successfully", {
      recipientEmail,
      invoiceNumber,
      sentAt: new Date().toISOString(),
    });

  } catch (error) {
    logger.error("Error sending invoice email:", error);
    
    if (error instanceof multer.MulterError) {
      if (error.code === 'LIMIT_FILE_SIZE') {
        return errorResponse(res, "File size too large. Maximum size is 10MB", 400);
      }
      return errorResponse(res, `File upload error: ${error.message}`, 400);
    }

    return errorResponse(res, "Failed to send invoice email", 500);
  }
}

/**
 * @swagger
 * /api/invoice-mail/send-multiple:
 *   post:
 *     summary: Send invoice PDF to multiple email addresses
 *     tags:
 *       - Invoice Mail
 *     consumes:
 *       - multipart/form-data
 *     parameters:
 *       - in: formData
 *         name: invoice
 *         type: file
 *         required: true
 *         description: PDF file of the invoice
 *       - in: formData
 *         name: recipientEmails
 *         type: string
 *         required: true
 *         description: Comma-separated email addresses
 *       - in: formData
 *         name: invoiceNumber
 *         type: string
 *         required: false
 *         description: Invoice number for reference
 *       - in: formData
 *         name: senderName
 *         type: string
 *         required: false
 *         description: Name of the sender
 *       - in: formData
 *         name: customMessage
 *         type: string
 *         required: false
 *         description: Custom message to include in the email
 *     responses:
 *       200:
 *         description: Emails sent successfully
 *       400:
 *         description: Bad request
 *       500:
 *         description: Internal server error
 */
export async function sendInvoiceEmailMultiple(req: RequestWithFile, res: Response) {
  try {
    const {
      recipientEmails,
      invoiceNumber = "N/A",
      senderName = "Your Company",
      customMessage = "",
    } = req.body;

    if (!recipientEmails) {
      return errorResponse(res, "Recipient emails are required", 400);
    }

    if (!req.file) {
      return errorResponse(res, "PDF file is required", 400);
    }

    // Parse and validate email addresses
    const emailList = recipientEmails.split(',').map((email: string) => email.trim());
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    
    const invalidEmails = emailList.filter((email: string) => !emailRegex.test(email));
    if (invalidEmails.length > 0) {
      return errorResponse(res, `Invalid email formats: ${invalidEmails.join(', ')}`, 400);
    }

    // Prepare email attachment
    const attachment = {
      filename: `invoice-${invoiceNumber || 'document'}.pdf`,
      content: req.file.buffer,
      contentType: 'application/pdf',
    };

    // Prepare email context
    const emailContext = {
      recipientName: "Customer",
      senderName,
      invoiceNumber,
      customMessage,
      currentDate: new Date().toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      }),
      currentYear: new Date().getFullYear().toString(),
    };

    // Send email to multiple recipients
    await sendEmail({
      to: emailList,
      subject: `Invoice ${invoiceNumber ? `#${invoiceNumber}` : 'Document'} from ${senderName}`,
      template: "invoice-email",
      context: emailContext,
      attachments: [attachment],
    });

    logger.info(`Invoice email sent successfully to ${emailList.length} recipients`);

    return successResponse(res, "Invoice emails sent successfully", {
      recipientCount: emailList.length,
      recipients: emailList,
      invoiceNumber,
      sentAt: new Date().toISOString(),
    });

  } catch (error) {
    logger.error("Error sending invoice emails:", error);
    return errorResponse(res, "Failed to send invoice emails", 500);
  }
}
