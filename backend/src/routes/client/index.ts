import { Router } from "express";

import { createV1 } from "../../controllers/client/create";
import { deleteV1 } from "../../controllers/client/delete";
import { getV1 } from "../../controllers/client/get";
import { getAccessibleClientsV1 } from "../../controllers/client/get.accessible.clients";
import { getByIdV1 } from "../../controllers/client/get.by.id";
import { getSalesV1 } from "../../controllers/client/get.sales";
import { getClientStatsV1 } from "../../controllers/client/stats";
import { updateV1 } from "../../controllers/client/update";
import { authenticateV1 } from "../../middlewares/auth";
import { validateExistenceV1 } from "../../middlewares/existence";
import { checkClientLimits } from "../../middlewares/planLimits";
import { Client } from "../../models";

const router = Router({ mergeParams: true });

router.param("clientId", validateExistenceV1(Client));

/**
 * @swagger
 * tags:
 *   name: Client
 *   description: Endpoints related to client
 */

/**
 * @swagger
 * /api/v1/users/{userId}/clients/stats:
 *   get:
 *     tags:
 *       - Client
 *     summary: Get Client Statistics
 *     description: Get client statistics including current count, plan limits, and remaining slots for the user's subscription plan.
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: userId
 *         in: path
 *         required: true
 *         description: The ID of the user to get client statistics for.
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       "200":
 *         description: Client statistics retrieved successfully.
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
 *                   example: "Client statistics retrieved successfully"
 *                 data:
 *                   type: object
 *                   properties:
 *                     currentCount:
 *                       type: integer
 *                       description: Current number of clients for the user
 *                       example: 3
 *                     limit:
 *                       type: integer
 *                       nullable: true
 *                       description: Maximum number of clients allowed (null for unlimited)
 *                       example: 5
 *                     isUnlimited:
 *                       type: boolean
 *                       description: Whether the plan allows unlimited clients
 *                       example: false
 *                     planName:
 *                       type: string
 *                       description: Name of the current subscription plan
 *                       example: "Basic"
 *                       enum: ["Basic", "Professional", "Enterprise"]
 *                     canAddMore:
 *                       type: boolean
 *                       description: Whether the user can add more clients
 *                       example: true
 *                     remainingSlots:
 *                       type: integer
 *                       nullable: true
 *                       description: Number of remaining client slots (null for unlimited)
 *                       example: 2
 *       "401":
 *         description: Unauthorized - Invalid or missing authentication token.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 message:
 *                   type: string
 *                   example: "Unauthorized"
 *       "404":
 *         description: User not found or no active subscription.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 message:
 *                   type: string
 *                   example: "User not found or no active subscription"
 *       "500":
 *         description: Internal server error.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 message:
 *                   type: string
 *                   example: "Failed to retrieve client statistics"
 */

/**
 * @swagger
 * /api/v1/users/{userId}/clients/accessible:
 *   get:
 *     tags:
 *       - Client
 *     summary: Get Accessible Clients
 *     description: Get list of accessible clients based on user's subscription plan. For basic plans, returns only the 5 most recent clients.
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: userId
 *         in: path
 *         required: true
 *         description: The ID of the user to get accessible clients for.
 *         schema:
 *           type: string
 *     responses:
 *       "200":
 *         description: Successfully retrieved accessible clients
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
 *                   example: "Accessible clients retrieved successfully"
 *                 data:
 *                   type: object
 *                   properties:
 *                     clients:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           id:
 *                             type: string
 *                             example: "123e4567-e89b-12d3-a456-426614174000"
 *                           name:
 *                             type: string
 *                             example: "John Doe"
 *                           isAccessible:
 *                             type: boolean
 *                             example: true
 *                           createdAt:
 *                             type: string
 *                             format: date-time
 *                             example: "2024-01-15T10:30:00Z"
 *                     planDetails:
 *                       type: object
 *                       properties:
 *                         plan:
 *                           type: string
 *                           example: "Basic"
 *                         clientLimit:
 *                           type: integer
 *                           example: 5
 *                         isUnlimited:
 *                           type: boolean
 *                           example: false
 *       "401":
 *         description: Unauthorized - Invalid or missing authentication token
 *       "404":
 *         description: User not found
 *       "500":
 *         description: Internal server error
 *
 * /**
 * @swagger
 * /api/v1/users/{userId}/clients:
 *   post:
 *     tags:
 *       - Client
 *     summary: Create Client
 *     description: Create a new client.
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: userId
 *         in: path
 *         required: true
 *         description: The ID of the user creating the client.
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - phone
 *               - pan
 *             properties:
 *               name:
 *                 type: string
 *                 example: "Client Name"
 *               phone:
 *                 type: string
 *                 example: "1234567890"
 *               email:
 *                 type: string
 *                 example: "client@example.com"
 *               pan:
 *                 type: string
 *                 example: "ABCDE12345"
 *               gstin:
 *                 type: string
 *                 example: "ABCDE12345"
 *               address:
 *                 type: string
 *                 example: "1234 Main St, Anytown, USA"
 *     responses:
 *       "201":
 *         description: Client created successfully.
 *       "400":
 *         description: Client already exists.
 *       "401":
 *         description: Unauthorized.
 *       "500":
 *         description: Failed to create client.
 *       "404":
 *         description: User not found.
 *   get:
 *     tags:
 *       - Client
 *     summary: Get Clients
 *     description: Get all clients for a user.
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: userId
 *         in: path
 *         required: true
 *         description: The ID of the user to get clients for.
 *         schema:
 *           type: string
 *     responses:
 *       "200":
 *         description: Clients retrieved successfully.
 *       "401":
 *         description: Unauthorized.
 *       "404":
 *         description: User not found.
 */

/**
 * @swagger
 * /api/v1/users/{userId}/clients/{clientId}:
 *   get:
 *     tags:
 *       - Client
 *     summary: Get Client by ID
 *     description: Get a client by its ID.
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: userId
 *         in: path
 *         required: true
 *       - name: clientId
 *         in: path
 *         required: true
 *     responses:
 *       "200":
 *         description: Client retrieved successfully.
 *       "401":
 *         description: Unauthorized.
 *       "404":
 *         description: Client not found.
 *   put:
 *     tags:
 *       - Client
 *     summary: Update Client
 *     description: Update a client by its ID.
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: userId
 *         in: path
 *         required: true
 *       - name: clientId
 *         in: path
 *         required: true
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - phone
 *               - pan
 *             properties:
 *               name:
 *                 type: string
 *                 example: "Updated Client Name"
 *               phone:
 *                 type: string
 *                 example: "1234567890"
 *               email:
 *                 type: string
 *                 example: "client@example.com"
 *               pan:
 *                 type: string
 *                 example: "ABCDE12345"
 *               gstin:
 *                 type: string
 *                 example: "ABCDE12345"
 *               address:
 *                 type: string
 *                 example: "1234 Main St, Anytown, USA"
 *     responses:
 *       "200":
 *         description: Client updated successfully.
 *       "401":
 *         description: Unauthorized.
 *       "404":
 *         description: Client not found.
 *       "400":
 *         description: Invalid request body.
 *       "500":
 *         description: Failed to update client.
 *   delete:
 *     tags:
 *       - Client
 *     summary: Delete Client
 *     description: Delete a client by its ID.
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: userId
 *         in: path
 *         required: true
 *       - name: clientId
 *         in: path
 *         required: true
 *     responses:
 *       "204":
 *         description: Client deleted successfully.
 *       "401":
 *         description: Unauthorized.
 *       "404":
 *         description: Client not found.
 */

/**
 * @swagger
 * /api/v1/users/{userId}/clients/{clientId}/sales:
 *   get:
 *     tags:
 *       - Client
 *     summary: Get Client Sales
 *     description: Get sales data and summary for a specific client.
 *     operationId: getClientSales
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: userId
 *         in: path
 *         required: true
 *         description: The ID of the user.
 *         schema:
 *           type: string
 *       - name: clientId
 *         in: path
 *         required: true
 *         description: The ID of the client to get sales for.
 *         schema:
 *           type: string
 *       - name: page
 *         in: query
 *         required: false
 *         description: Page number for pagination (default 1).
 *         schema:
 *           type: integer
 *           minimum: 1
 *           default: 1
 *       - name: limit
 *         in: query
 *         required: false
 *         description: Number of items per page (default 10).
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 100
 *           default: 10
 *     responses:
 *       "200":
 *         description: Sales data retrieved successfully.
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
 *                   example: "Sales data retrieved successfully"
 *                 data:
 *                   type: object
 *                   properties:
 *                     summary:
 *                       type: object
 *                       properties:
 *                         totalSales:
 *                           type: number
 *                           description: Total number of sales for this client
 *                           example: 25
 *                         totalAmount:
 *                           type: number
 *                           description: Total amount of all sales
 *                           example: 125000.50
 *                         averageAmount:
 *                           type: number
 *                           description: Average amount per sale
 *                           example: 5000.02
 *                         pendingAmount:
 *                           type: number
 *                           description: Total pending payment amount
 *                           example: 15000.25
 *                     sales:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           id:
 *                             type: string
 *                             description: Sale ID
 *                             example: "550e8400-e29b-41d4-a716-446655440000"
 *                           saleDate:
 *                             type: string
 *                             format: date-time
 *                             description: Date of the sale
 *                             example: "2024-01-15T10:30:00Z"
 *                           amount:
 *                             type: number
 *                             description: Total sale amount
 *                             example: 5000.00
 *                           paymentStatus:
 *                             type: string
 *                             enum:
 *                               - pending
 *                               - partial
 *                               - complete
 *                             description: Payment status of the sale
 *                             example: "pending"
 *                           paidAmount:
 *                             type: number
 *                             description: Amount already paid
 *                             example: 2000.00
 *                           pendingAmount:
 *                             type: number
 *                             description: Remaining amount to be paid
 *                             example: 3000.00
 *                           createdAt:
 *                             type: string
 *                             format: date-time
 *                             example: "2024-01-15T10:30:00Z"
 *                           updatedAt:
 *                             type: string
 *                             format: date-time
 *                             example: "2024-01-15T10:30:00Z"
 *                     pagination:
 *                       type: object
 *                       properties:
 *                         page:
 *                           type: integer
 *                           description: Current page number
 *                           example: 1
 *                         limit:
 *                           type: integer
 *                           description: Items per page
 *                           example: 10
 *                         total:
 *                           type: integer
 *                           description: Total number of sales
 *                           example: 25
 *                         totalPages:
 *                           type: integer
 *                           description: Total number of pages
 *                           example: 3
 *       "401":
 *         description: Unauthorized - Invalid or missing authentication token.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 message:
 *                   type: string
 *                   example: "Unauthorized"
 *       "404":
 *         description: Client not found.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 message:
 *                   type: string
 *                   example: "Client not found"
 *       "500":
 *         description: Failed to retrieve sales data.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 message:
 *                   type: string
 *                   example: "Failed to retrieve sales data"
 */

router.route("/").post(authenticateV1, checkClientLimits, createV1).get(authenticateV1, getV1);
router.route("/accessible").get(authenticateV1, getAccessibleClientsV1);
router.route("/stats").get(authenticateV1, getClientStatsV1);

router
  .route("/:clientId")
  .get(authenticateV1, getByIdV1)
  .put(authenticateV1, updateV1)
  .delete(authenticateV1, deleteV1);

router.route("/:clientId/sales").get(authenticateV1, getSalesV1);

export default router;
