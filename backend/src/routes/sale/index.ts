import { Router } from "express";
import { createV1 } from "../../controllers/sale/create";
import { deleteV1 } from "../../controllers/sale/delete";
import { getV1 } from "../../controllers/sale/get";
import { getByIdV1 } from "../../controllers/sale/get.by.id";
import { updateV1 } from "../../controllers/sale/update";
import { getSalesStatsV1 } from "../../controllers/sale/sale.stats";
import { authenticateV1 } from "../../middlewares/auth";
import { validateExistenceV1 } from "../../middlewares/existence";
import { checkInvoiceLimits } from "../../middlewares/planLimits";
import { Sale, Book } from "../../models";

const router = Router({ mergeParams: true });

router.param("bookId", validateExistenceV1(Book));
router.param("saleId", validateExistenceV1(Sale));

/**
 * @swagger
 * tags:
 *   name: Sale
 *   description: Endpoints related to sales
 */

/**
 * @swagger
 * /api/v1/users/{userId}/sales/stats:
 *   get:
 *     tags:
 *       - Sale
 *     summary: Get Sales Statistics
 *     description: Get sales statistics including current count, plan limits, and remaining slots for the user's subscription plan.
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: userId
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       "200":
 *         description: Sales statistics retrieved successfully.
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
 *                   example: "Sales statistics retrieved successfully"
 *                 data:
 *                   type: object
 *                   properties:
 *                     currentCount:
 *                       type: integer
 *                       description: Current number of sales across all books
 *                       example: 15
 *                     limit:
 *                       type: integer
 *                       nullable: true
 *                       description: Maximum number of sales allowed (null for unlimited)
 *                       example: 20
 *                     isUnlimited:
 *                       type: boolean
 *                       description: Whether the plan allows unlimited sales
 *                       example: false
 *                     planName:
 *                       type: string
 *                       description: Name of the current subscription plan
 *                       example: "Basic"
 *                     canAddMore:
 *                       type: boolean
 *                       description: Whether the user can add more sales
 *                       example: true
 *                     remainingSlots:
 *                       type: integer
 *                       nullable: true
 *                       description: Number of remaining sales slots (null for unlimited)
 *                       example: 5
 *       "401":
 *         description: Unauthorized - Invalid or missing authentication token.
 *       "404":
 *         description: User not found or no active subscription.
 *       "500":
 *         description: Internal server error.
 */

/**
 * @swagger
 * /api/v1/users/{userId}/books/{bookId}/sales:
 *   post:
 *     tags:
 *       - Sale
 *     summary: Create Sale
 *     description: Create a new sale record
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: userId
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *       - name: bookId
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               lorryReceiptNumber:
 *                 type: string
 *               lorryReceiptDate:
 *                 type: string
 *                 format: date-time
 *               caseNumber:
 *                 type: string
 *               weight:
 *                 type: number
 *                 format: float
 *               freight:
 *                 type: number
 *                 format: float
 *               transportName:
 *                 type: string
 *               transportNumber:
 *                 type: string
 *               transportStation:
 *                 type: string
 *               eWayBillNumber:
 *                 type: string
 *               eWayBillDate:
 *                 type: string
 *                 format: date-time
 *               challanNumber:
 *                 type: string
 *               challanDate:
 *                 type: string
 *                 format: date-time
 *               invoiceNumber:
 *                 type: string
 *               invoiceDate:
 *                 type: string
 *                 format: date-time
 *               invoiceGrossAmount:
 *                 type: number
 *                 format: float
 *               invoiceDiscountAmount:
 *                 type: number
 *                 format: float
 *               invoiceTaxAmount:
 *                 type: number
 *                 format: float
 *               invoiceNetAmount:
 *                 type: number
 *                 format: float
 *               commissionRate:
 *                 type: number
 *                 format: float
 *               invoiceDueDays:
 *                 type: integer
 *                 default: 45
 *               status:
 *                 type: string
 *                 enum: [PENDING, PARTIALLY_PAID, PAID, OVERDUE]
 *                 default: PENDING
 *               notes:
 *                 type: string
 *               sellerId:
 *                 type: string
 *                 format: uuid
 *               buyerId:
 *                 type: string
 *                 format: uuid
 *     responses:
 *       "201":
 *         description: Sale created successfully
 *       "400":
 *         description: Bad request (missing fields or invalid data)
 *       "401":
 *         description: Unauthorized
 *       "403":
 *         description: Reached sales limit for current plan
 *       "500":
 *         description: Failed to create sale
 *   get:
 *     tags:
 *       - Sale
 *     summary: Get Sales
 *     description: Get all sales for a book
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: userId
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *       - name: bookId
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *       - name: page
 *         in: query
 *         description: Page number
 *         schema:
 *           type: integer
 *           default: 1
 *       - name: limit
 *         in: query
 *         description: Items per page
 *         schema:
 *           type: integer
 *           default: 10
 *     responses:
 *       "200":
 *         description: List of sales
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Sale'
 *                 pagination:
 *                   type: object
 *                   properties:
 *                     page:
 *                       type: integer
 *                     limit:
 *                       type: integer
 *                     total:
 *                       type: integer
 *                     totalPages:
 *                       type: integer
 *       "401":
 *         description: Unauthorized
 *       "404":
 *         description: Book not found
 */

/**
 * @swagger
 * /api/v1/users/{userId}/books/{bookId}/sales/{saleId}:
 *   get:
 *     tags:
 *       - Sale
 *     summary: Get Sale by ID
 *     description: Get a sale by its ID
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: userId
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *       - name: bookId
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *       - name: saleId
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       "200":
 *         description: Sale details
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Sale'
 *       "401":
 *         description: Unauthorized
 *       "404":
 *         description: Sale not found
 *   put:
 *     tags:
 *       - Sale
 *     summary: Update Sale
 *     description: Update a sale by its ID
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: userId
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *       - name: bookId
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *       - name: saleId
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Sale'
 *     responses:
 *       "200":
 *         description: Sale updated successfully
 *       "400":
 *         description: Bad request
 *       "401":
 *         description: Unauthorized
 *       "404":
 *         description: Sale not found
 *   delete:
 *     tags:
 *       - Sale
 *     summary: Delete Sale
 *     description: Delete a sale by its ID
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: userId
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *       - name: bookId
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *       - name: saleId
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       "204":
 *         description: Sale deleted successfully
 *       "401":
 *         description: Unauthorized
 *       "404":
 *         description: Sale not found
 */

// Sales stats endpoint (not book-specific)
router.route("/stats").get(authenticateV1, getSalesStatsV1);

// Book-specific sales endpoints
router.route("/").post(authenticateV1, checkInvoiceLimits, createV1).get(authenticateV1, getV1);

router
  .route("/:saleId")
  .get(authenticateV1, getByIdV1)
  .put(authenticateV1, updateV1)
  .delete(authenticateV1, deleteV1);

export default router;
