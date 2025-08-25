import { Router } from "express";

import { getDashboardStatsV1 } from "../../controllers/dashboard/stats";
import { getUserDashboardStatsV1 } from "../../controllers/dashboard/user-stats";
import { authenticateV1 } from "../../middlewares/auth";

const dashboardRouter = Router({ mergeParams: true });

/**
 * @swagger
 * /api/v1/users/{userId}/books/{bookId}/dashboard:
 *   get:
 *     tags:
 *       - Dashboard
 *     summary: Get Dashboard Statistics
 *     description: Get comprehensive dashboard statistics including total clients, sales, purchases, commissions, due amounts, monthly data, and recent invoices
 *     operationId: getDashboardStats
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: userId
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: User ID
 *       - name: bookId
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Book ID
 *     responses:
 *       "200":
 *         description: Dashboard data retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Dashboard data retrieved successfully"
 *                 data:
 *                   type: object
 *                   properties:
 *                     stats:
 *                       type: object
 *                       properties:
 *                         totalClients:
 *                           type: number
 *                           description: Total number of clients
 *                           example: 45
 *                         totalSales:
 *                           type: number
 *                           description: Total sales amount
 *                           example: 1250000.50
 *                         totalPurchases:
 *                           type: number
 *                           description: Total purchases amount
 *                           example: 850000.25
 *                         totalCommission:
 *                           type: number
 *                           description: Total commission earned
 *                           example: 75000.75
 *                         totalAmountDue:
 *                           type: number
 *                           description: Total amount due from pending payments
 *                           example: 185000.00
 *                         totalCommissionDue:
 *                           type: number
 *                           description: Total commission due
 *                           example: 12500.50
 *                     monthlyData:
 *                       type: array
 *                       description: Monthly sales and purchases data for the last 12 months
 *                       items:
 *                         type: object
 *                         properties:
 *                           month:
 *                             type: string
 *                             example: "Jan"
 *                           sales:
 *                             type: number
 *                             example: 120000
 *                           purchases:
 *                             type: number
 *                             example: 80000
 *                     latestDueInvoices:
 *                       type: array
 *                       description: Latest invoices approaching due date (next 30 days)
 *                       items:
 *                         type: object
 *                         properties:
 *                           id:
 *                             type: string
 *                             format: uuid
 *                           invoiceNumber:
 *                             type: string
 *                             example: "INV-2024-001"
 *                           invoiceDate:
 *                             type: string
 *                             format: date
 *                           buyer:
 *                             type: object
 *                             properties:
 *                               id:
 *                                 type: string
 *                               name:
 *                                 type: string
 *                           seller:
 *                             type: object
 *                             properties:
 *                               id:
 *                                 type: string
 *                               name:
 *                                 type: string
 *                           invoiceNetAmount:
 *                             type: number
 *                             example: 25000.50
 *                           status:
 *                             type: string
 *                             enum: [PENDING, PARTIALLY_PAID, PAID, OVERDUE]
 *                           dueDate:
 *                             type: string
 *                             format: date-time
 *                     latestOverdueInvoices:
 *                       type: array
 *                       description: Invoices that became overdue in the last 15 days
 *                       items:
 *                         type: object
 *                         properties:
 *                           id:
 *                             type: string
 *                             format: uuid
 *                           invoiceNumber:
 *                             type: string
 *                             example: "INV-2024-004"
 *                           invoiceDate:
 *                             type: string
 *                             format: date
 *                           buyer:
 *                             type: object
 *                             properties:
 *                               id:
 *                                 type: string
 *                               name:
 *                                 type: string
 *                           seller:
 *                             type: object
 *                             properties:
 *                               id:
 *                                 type: string
 *                               name:
 *                                 type: string
 *                           invoiceNetAmount:
 *                             type: number
 *                             example: 15000.00
 *                           status:
 *                             type: string
 *                             enum: [OVERDUE]
 *                           dueDate:
 *                             type: string
 *                             format: date-time
 *       "401":
 *         description: Unauthorized
 *       "404":
 *         description: Book not found
 *       "500":
 *         description: Internal server error
 */
dashboardRouter.get("/:userId/books/:bookId/dashboard", authenticateV1, getDashboardStatsV1);

/**
 * @swagger
 * /api/v1/users/{userId}/dashboard:
 *   get:
 *     tags:
 *       - Dashboard
 *     summary: Get User Dashboard Statistics (All Books)
 *     description: Get comprehensive dashboard statistics across all user's books including total clients, sales, purchases, commissions, due amounts, monthly data, and recent invoices
 *     operationId: getUserDashboardStats
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: userId
 *         in: path
 *         required: true
 *         description: ID of the user
 *         schema:
 *           type: string
 *     responses:
 *       "200":
 *         description: Dashboard statistics retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Dashboard data retrieved successfully"
 *                 data:
 *                   type: object
 *                   properties:
 *                     stats:
 *                       type: object
 *                       properties:
 *                         totalClients:
 *                           type: number
 *                           example: 45
 *                         totalSales:
 *                           type: number
 *                           example: 125000.50
 *                         totalPurchases:
 *                           type: number
 *                           example: 85000.25
 *                         totalCommission:
 *                           type: number
 *                           example: 12500.00
 *                         totalAmountDue:
 *                           type: number
 *                           example: 25000.00
 *                         totalCommissionDue:
 *                           type: number
 *                           example: 5000.00
 *                     monthlyData:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           month:
 *                             type: string
 *                             example: "Jan"
 *                           sales:
 *                             type: number
 *                             example: 15000.00
 *                           purchases:
 *                             type: number
 *                             example: 8000.00
 *                     latestDueInvoices:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           id:
 *                             type: string
 *                           invoiceNumber:
 *                             type: string
 *                           invoiceDate:
 *                             type: string
 *                           buyer:
 *                             type: object
 *                           seller:
 *                             type: object
 *                           invoiceNetAmount:
 *                             type: number
 *                           status:
 *                             type: string
 *                           dueDate:
 *                             type: string
 *       "400":
 *         description: Bad request
 *       "401":
 *         description: Unauthorized
 *       "404":
 *         description: User not found
 *       "500":
 *         description: Internal server error
 */
dashboardRouter.get("/:userId/dashboard", authenticateV1, getUserDashboardStatsV1);

export { dashboardRouter };
