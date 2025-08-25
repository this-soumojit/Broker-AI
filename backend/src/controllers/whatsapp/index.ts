import { NextFunction, Request, Response } from "express";
import { uploadPDFDocument as uploadPDFToWhatsApp, sendMediaWithIdMessage } from "../../services/whatsapp";
import multer from "multer";

// Configure multer for PDF file uploads
const whatsappUpload = multer({
  storage: multer.memoryStorage(),
  fileFilter: (_, file, cb) => {
    // Accept only PDF files
    if (file.mimetype === "application/pdf") {
      cb(null, true);
    } else {
      cb(new Error("Only PDF files are allowed"));
    }
  },
});

export const sendPDFViaWhatsApp = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { phoneNumber, caption } = req.body;

    if (!req.file) {
      return res.status(400).json({
        success: false,
        error: "No PDF file provided",
      });
    }

    if (!phoneNumber) {
      return res.status(400).json({
        success: false,
        error: "Phone number is required",
      });
    }

    // Create a File object from the buffer
    const pdfFile = new File(
      [new Uint8Array(req.file.buffer)],
      req.file.originalname,
      { type: "application/pdf" }
    );

    // Upload the PDF to WhatsApp Media
    const uploadResponse = await uploadPDFToWhatsApp(pdfFile);

    if (!uploadResponse.id) {
      throw new Error("Failed to upload PDF to WhatsApp");
    }

    // Send the media message with the uploaded file ID
    await sendMediaWithIdMessage(
      phoneNumber,
      uploadResponse.id,
      caption || "Here's your invoice"
    );

    res.json({
      success: true,
      message: "PDF sent successfully via WhatsApp",
    });
  } catch (error) {
    next(error);
  }
};

export { whatsappUpload };
