import { Router } from "express";

import { createV1 } from "../../controllers/sale-payment/create";
import { deleteV1 } from "../../controllers/sale-payment/delete";
import { getV1 } from "../../controllers/sale-payment/get";
import { getByIdV1 } from "../../controllers/sale-payment/get.by.id";
import { updateV1 } from "../../controllers/sale-payment/update";
import { authenticateV1 } from "../../middlewares/auth";
import { validateExistenceV1 } from "../../middlewares/existence";
import { Book, Sale, SalePayment } from "../../models";

const router = Router({ mergeParams: true });

router.param("bookId", validateExistenceV1(Book));
router.param("saleId", validateExistenceV1(Sale));
router.param("salePaymentId", validateExistenceV1(SalePayment));

/**
 * @swagger
 * tags:
 *   name: Sale Payment
 *   description: Endpoints related to sale payments
 * openapi: 3.0.0
 * info:
 *   title: Sale Payment API
 *   description: Endpoints related to sale payments
 *   version: 1.0.0
 *
 * paths:
 *   /api/v1/users/{userId}/books/{bookId}/sales/{saleId}/payments:
 *     post:
 *       tags:
 *         - Sale Payment
 *       summary: Create Sale Payment
 *       description: Create a new sale payment record
 *       operationId: createSalePayment
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
 *           description: Sale payment created successfully
 *         "400":
 *           description: Sale payment with same name already exists
 *         "401":
 *           description: Unauthorized
 *         "500":
 *           description: Failed to create sale payment
 *     get:
 *       tags:
 *         - Sale Payment
 *       summary: Get Sale Payments
 *       description: Get all sale payments for a sale
 *       operationId: getSalePayments
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
 *       responses:
 *         "200":
 *           description: Sale payments retrieved successfully
 *         "401":
 *           description: Unauthorized
 *
 *   /api/v1/users/{userId}/books/{bookId}/sales/{saleId}/payments/{salePaymentId}:
 *     get:
 *       tags:
 *         - Sale Payment
 *       summary: Get Sale Payment by ID
 *       description: Get a sale payment by its ID
 *       operationId: getSalePaymentById
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
 *           description: Sale payment retrieved successfully
 *         "401":
 *           description: Unauthorized
 *         "404":
 *           description: Sale payment not found
 *     put:
 *       tags:
 *         - Sale Payment
 *       summary: Update Sale Payment
 *       description: Update a sale payment by its ID
 *       operationId: updateSalePayment
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
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 # Same properties as POST request
 *       responses:
 *         "200":
 *           description: Sale payment updated successfully
 *         "400":
 *           description: Sale payment with same name already exists
 *         "401":
 *           description: Unauthorized
 *         "404":
 *           description: Sale payment not found
 *     delete:
 *       tags:
 *         - Sale Payment
 *       summary: Delete Sale Payment
 *       description: Delete a sale payment by its ID
 *       operationId: deleteSalePayment
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
 *         "204":
 *           description: Sale payment deleted successfully
 *         "401":
 *           description: Unauthorized
 *         "404":
 *           description: Sale payment not found
 */

router.route("/").post(authenticateV1, createV1).get(authenticateV1, getV1);

router
  .route("/:salePaymentId")
  .get(authenticateV1, getByIdV1)
  .put(authenticateV1, updateV1)
  .delete(authenticateV1, deleteV1);

export default router;
