import { Router } from "express";
import { upload } from "../../controllers/invoice-extract";
import { uploadInvoice } from "../../controllers/invoice-extract";

const router = Router({ mergeParams: true });

// Add your invoice extract routes here
router.post("/", upload.single("invoice"), uploadInvoice);

export default router;
