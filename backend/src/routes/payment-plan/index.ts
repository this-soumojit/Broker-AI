import { Router } from "express";
import {
  createPlanPayment,
  getUserSubscription,
  handleWebhook,
  checkPaymentStatus,
  downgradePlan,
} from "../../controllers/payment-plan";
import { authenticateV1 } from "../../middlewares/auth";

const router = Router({ mergeParams: true });

/**
 * @swagger
 * tags:
 *   name: Payment Plan
 *   description: Endpoints related to subscription payment plans
 * openapi: 3.0.0
 * info:
 *   title: Payment Plan API
 *   description: Endpoints related to subscription payment plans
 *   version: 1.0.0
 *
 * paths:
 *   /api/v1/users/{userId}/subscriptions:
 *     post:
 *       tags:
 *         - Payment Plan
 *       summary: Create Plan Payment
 *       description: Create a new subscription payment order
 *       operationId: createPlanPayment
 *       security:
 *         - bearerAuth: []
 *       parameters:
 *         - name: userId
 *           in: path
 *           required: true
 *           schema:
 *             type: string
 *             format: uuid
 *       requestBody:
 *         required: true
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 planName:
 *                   type: string
 *                   enum: [Basic, Professional, Enterprise]
 *                   description: Name of the subscription plan
 *                 planPrice:
 *                   type: number
 *                   format: float
 *                   description: Price of the plan in INR
 *                 duration:
 *                   type: integer
 *                   default: 1
 *                   description: Duration in months (0 for forever/free plan)
 *               required:
 *                 - planName
 *                 - planPrice
 *       responses:
 *         "201":
 *           description: Payment order created successfully
 *           content:
 *             application/json:
 *               schema:
 *                 type: object
 *                 properties:
 *                   message:
 *                     type: string
 *                   data:
 *                     type: object
 *                     properties:
 *                       orderId:
 *                         type: string
 *                       paymentSessionId:
 *                         type: string
 *                       orderToken:
 *                         type: string
 *         "401":
 *           description: User not authenticated
 *         "500":
 *           description: Failed to create payment order
 *     get:
 *       tags:
 *         - Payment Plan
 *       summary: Get User Subscription
 *       description: Get the user's current active subscription
 *       operationId: getUserSubscription
 *       security:
 *         - bearerAuth: []
 *       parameters:
 *         - name: userId
 *           in: path
 *           required: true
 *           schema:
 *             type: string
 *             format: uuid
 *       responses:
 *         "200":
 *           description: Subscription fetched successfully
 *           content:
 *             application/json:
 *               schema:
 *                 type: object
 *                 properties:
 *                   message:
 *                     type: string
 *                   data:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: integer
 *                       userId:
 *                         type: string
 *                         format: uuid
 *                       planName:
 *                         type: string
 *                       planPrice:
 *                         type: number
 *                         format: float
 *                       duration:
 *                         type: integer
 *                       orderId:
 *                         type: string
 *                       status:
 *                         type: string
 *                         enum: [PENDING, ACTIVE, EXPIRED, CANCELLED]
 *                       paymentStatus:
 *                         type: string
 *                         enum: [PENDING, COMPLETED, FAILED, REFUNDED]
 *                       startDate:
 *                         type: string
 *                         format: date-time
 *                       endDate:
 *                         type: string
 *                         format: date-time
 *                       createdAt:
 *                         type: string
 *                         format: date-time
 *                       updatedAt:
 *                         type: string
 *                         format: date-time
 *         "401":
 *           description: User not authenticated
 *         "500":
 *           description: Failed to fetch subscription
 *
 *   /api/v1/users/{userId}/subscriptions/webhook:
 *     post:
 *       tags:
 *         - Payment Plan
 *       summary: Payment Webhook
 *       description: Handle payment status updates from Cashfree
 *       operationId: handleWebhook
 *       parameters:
 *         - name: userId
 *           in: path
 *           required: true
 *           schema:
 *             type: string
 *             format: uuid
 *       requestBody:
 *         required: true
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 orderId:
 *                   type: string
 *                   description: Order ID from payment gateway
 *                 orderStatus:
 *                   type: string
 *                   enum: [PAID, FAILED]
 *                   description: Payment status from gateway
 *               required:
 *                 - orderId
 *                 - orderStatus
 *       responses:
 *         "200":
 *           description: Webhook processed successfully
 *           content:
 *             application/json:
 *               schema:
 *                 type: object
 *                 properties:
 *                   message:
 *                     type: string
 *         "404":
 *           description: Subscription not found
 *         "500":
 *           description: Webhook processing failed
 */

router.post("/", authenticateV1, createPlanPayment);
router.get("/", authenticateV1, getUserSubscription);
router.get("/status", authenticateV1, checkPaymentStatus);
router.post("/downgrade", authenticateV1, downgradePlan);
router.post("/webhook", handleWebhook);

export default router;
