import { Router } from "express";
import { sendInvoiceEmail, sendInvoiceEmailMultiple, uploadPDF } from "../../controllers/invoice-mail";

const router = Router();

/**
 * @swagger
 * tags:
 *   name: Invoice Mail
 *   description: Email invoice PDFs to recipients
 */

// Single recipient email route
router.post("/send", uploadPDF, sendInvoiceEmail);

// Multiple recipients email route
router.post("/send-multiple", uploadPDF, sendInvoiceEmailMultiple);

export default router;
