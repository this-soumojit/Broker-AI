import express from "express";
import { authenticateV1 } from "../../middlewares/auth";
import { whatsappUpload, sendPDFViaWhatsApp } from "../../controllers/whatsapp";

const router = express.Router();

router.post(
  "/send-pdf",
  authenticateV1,
  whatsappUpload.single("pdf"),
  sendPDFViaWhatsApp
);

export default router;
