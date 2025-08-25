import { Router } from "express";

import { createV1 } from "../../controllers/sale-commission/create";
import { deleteV1 } from "../../controllers/sale-commission/delete";
import { getV1 } from "../../controllers/sale-commission/get";
import { getByIdV1 } from "../../controllers/sale-commission/get.by.id";
import { updateV1 } from "../../controllers/sale-commission/update";
import { authenticateV1 } from "../../middlewares/auth";
import { validateExistenceV1 } from "../../middlewares/existence";
import { Book, Sale, SalePayment, SaleCommission } from "../../models";

const router = Router({ mergeParams: true });

router.param("bookId", validateExistenceV1(Book));
router.param("saleId", validateExistenceV1(Sale));
router.param("salePaymentId", validateExistenceV1(SalePayment));
router.param("saleCommissionId", validateExistenceV1(SaleCommission));
/**
 * @swagger
 * tags:
 *   name: Sale Commission
 *   description: Endpoints related to sale commissions
 * openapi: 3.0.0
 * info:
 *   title: Sale Commission API
 *   description: Endpoints related to sale commissions
 *   version: 1.0.0
 *
 * paths:
 *   /api/v1/users/{userId}/books/{bookId}/sales/{saleId}/payments/{salePaymentId}/commissions:
 *     post:
 *       tags:
 *         - Sale Commission
 *       summary: Create Sale Commission
 *       description: Create a new sale commission record
 *       operationId: createSaleCommission
 *       security:
 *         - bearerAuth: []
 *       parameters:
 *         - name: userId
 *           in: path
 *           required: true
 *           schema:
 *             type: string
 *         - name: bookId
 *           in: path
 *           required: true
 *           schema:
 *             type: string
 *         - name: saleId
 *           in: path
 *           required: true
 *           schema:
 *             type: string
 *         - name: salePaymentId
 *           in: path
 *           required: true
 *           schema:
 *             type: string
 *       requestBody:
 *         required: true
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 amount:
 *                   type: number
 *                 paymentMethod:
 *                   type: string
 *                   enum:
 *                     - CASH
 *                     - BANK_TRANSFER
 *                     - CHEQUE
 *                     - ONLINE_PAYMENT
 *                 referenceNumber:
 *                   type: string
 *                 notes:
 *                   type: string
 *       responses:
 *         "201":
 *           description: Sale commission created successfully
 *         "400":
 *           description: Sale commission with same name already exists
 *         "401":
 *           description: Unauthorized
 *         "500":
 *           description: Failed to create sale commission
 *     get:
 *       tags:
 *         - Sale Commission
 *       summary: Get Sale Commissions
 *       description: Get all sale commissions for a sale payment
 *       operationId: getSaleCommissions
 *       security:
 *         - bearerAuth: []
 *       parameters:
 *         - name: userId
 *           in: path
 *           required: true
 *           schema:
 *             type: string
 *         - name: bookId
 *           in: path
 *           required: true
 *           schema:
 *             type: string
 *         - name: saleId
 *           in: path
 *           required: true
 *           schema:
 *             type: string
 *         - name: salePaymentId
 *           in: path
 *           required: true
 *           schema:
 *             type: string
 *       responses:
 *         "200":
 *           description: Sale commissions retrieved successfully
 *         "401":
 *           description: Unauthorized
 *
 *   /api/v1/users/{userId}/books/{bookId}/sales/{saleId}/payments/{salePaymentId}/commissions/{saleCommissionId}:
 *     get:
 *       tags:
 *         - Sale Commission
 *       summary: Get Sale Commission by ID
 *       description: Get a sale commission by its ID
 *       operationId: getSaleCommissionById
 *       security:
 *         - bearerAuth: []
 *       parameters:
 *         - name: userId
 *           in: path
 *           required: true
 *           schema:
 *             type: string
 *         - name: bookId
 *           in: path
 *           required: true
 *           schema:
 *             type: string
 *         - name: saleId
 *           in: path
 *           required: true
 *           schema:
 *             type: string
 *         - name: salePaymentId
 *           in: path
 *           required: true
 *           schema:
 *             type: string
 *         - name: saleCommissionId
 *           in: path
 *           required: true
 *           schema:
 *             type: string
 *       responses:
 *         "200":
 *           description: Sale commission retrieved successfully
 *         "401":
 *           description: Unauthorized
 *         "404":
 *           description: Sale commission not found
 *     put:
 *       tags:
 *         - Sale Commission
 *       summary: Update Sale Commission
 *       description: Update a sale commission by its ID
 *       operationId: updateSaleCommission
 *       security:
 *         - bearerAuth: []
 *       parameters:
 *         - name: userId
 *           in: path
 *           required: true
 *           schema:
 *             type: string
 *         - name: bookId
 *           in: path
 *           required: true
 *           schema:
 *             type: string
 *         - name: saleId
 *           in: path
 *           required: true
 *           schema:
 *             type: string
 *         - name: salePaymentId
 *           in: path
 *           required: true
 *           schema:
 *             type: string
 *         - name: saleCommissionId
 *           in: path
 *           required: true
 *           schema:
 *             type: string
 *       requestBody:
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 amount:
 *                   type: number
 *                 paymentMethod:
 *                   type: string
 *                   enum:
 *                     - CASH
 *                     - BANK_TRANSFER
 *                     - CHEQUE
 *                     - ONLINE_PAYMENT
 *                 referenceNumber:
 *                   type: string
 *                 notes:
 *                   type: string
 *       responses:
 *         "200":
 *           description: Sale commission updated successfully
 *         "400":
 *           description: Sale commission with same name already exists
 *         "401":
 *           description: Unauthorized
 *         "404":
 *           description: Sale commission not found
 *     delete:
 *       tags:
 *         - Sale Commission
 *       summary: Delete Sale Commission
 *       description: Delete a sale commission by its ID
 *       operationId: deleteSaleCommission
 *       security:
 *         - bearerAuth: []
 *       parameters:
 *         - name: userId
 *           in: path
 *           required: true
 *           schema:
 *             type: string
 *         - name: bookId
 *           in: path
 *           required: true
 *           schema:
 *             type: string
 *         - name: saleId
 *           in: path
 *           required: true
 *           schema:
 *             type: string
 *         - name: salePaymentId
 *           in: path
 *           required: true
 *           schema:
 *             type: string
 *         - name: saleCommissionId
 *           in: path
 *           required: true
 *           schema:
 *             type: string
 *       responses:
 *         "204":
 *           description: Sale commission deleted successfully
 *         "401":
 *           description: Unauthorized
 *         "404":
 *           description: Sale commission not found
 */

router.route("/").post(authenticateV1, createV1).get(authenticateV1, getV1);

router
  .route("/:saleCommissionId")
  .get(authenticateV1, getByIdV1)
  .put(authenticateV1, updateV1)
  .delete(authenticateV1, deleteV1);

export default router;
