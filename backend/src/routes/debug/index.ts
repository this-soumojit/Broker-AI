import { Router } from "express";
import { debugSalesV1 } from "../../controllers/debug";

const router = Router();

/**
 * @swagger
 * /api/v1/debug/sales:
 *   get:
 *     summary: Debug endpoint to check sales data
 *     tags: [Debug]
 *     responses:
 *       200:
 *         description: Debug information retrieved successfully
 */
router.get("/sales", debugSalesV1);

export default router;
