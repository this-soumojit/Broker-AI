import { Router } from "express";

import { createV1 } from "../../controllers/product/create";
import { deleteV1 } from "../../controllers/product/delete";
import { getV1 } from "../../controllers/product/get";
import { getByIdV1 } from "../../controllers/product/get.by.id";
import { updateV1 } from "../../controllers/product/update";
import { authenticateV1 } from "../../middlewares/auth";
import { validateExistenceV1 } from "../../middlewares/existence";
import { Book, Sale, Product } from "../../models";

const router = Router({ mergeParams: true });

router.param("bookId", validateExistenceV1(Book));
router.param("saleId", validateExistenceV1(Sale));
router.param("productId", validateExistenceV1(Product));

/**
 * @swagger
 * tags:
 *   name: Product
 *   description: Endpoints related to products
 * openapi: 3.0.0
 * info:
 *   title: Product API
 *   description: Endpoints related to products
 *   version: 1.0.0
 *
 * paths:
 *   /api/v1/users/{userId}/books/{bookId}/sales/{saleId}/products:
 *     post:
 *       tags:
 *         - Product
 *       summary: Create Product
 *       description: Create a new product record
 *       operationId: createProduct
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
 *                 name:
 *                   type: string
 *                 quantity:
 *                   type: number
 *                   format: float
 *                 unit:
 *                   type: string
 *                 rate:
 *                   type: number
 *                   format: float
 *                 gstRate:
 *                   type: number
 *                   format: float
 *                 discountRate:
 *                   type: number
 *                   format: float
 *                 notes:
 *                   type: string
 *       responses:
 *         "201":
 *           description: Product created successfully
 *         "400":
 *           description: Product with same name already exists
 *         "401":
 *           description: Unauthorized
 *         "500":
 *           description: Failed to create product
 *     get:
 *       tags:
 *         - Product
 *       summary: Get Products
 *       description: Get all products for a sale
 *       operationId: getProducts
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
 *           description: Products retrieved successfully
 *         "401":
 *           description: Unauthorized
 *
 *   /api/v1/users/{userId}/books/{bookId}/sales/{saleId}/products/{productId}:
 *     get:
 *       tags:
 *         - Product
 *       summary: Get Product by ID
 *       description: Get a product by its ID
 *       operationId: getProductById
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
 *         - name: productId
 *           in: path
 *           required: true
 *           schema:
 *             type: string
 *       responses:
 *         "200":
 *           description: Product retrieved successfully
 *         "401":
 *           description: Unauthorized
 *         "404":
 *           description: Product not found
 *     put:
 *       tags:
 *         - Product
 *       summary: Update Product
 *       description: Update a product by its ID
 *       operationId: updateProduct
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
 *         - name: productId
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
 *           description: Product updated successfully
 *         "400":
 *           description: Product with same name already exists
 *         "401":
 *           description: Unauthorized
 *         "404":
 *           description: Product not found
 *     delete:
 *       tags:
 *         - Product
 *       summary: Delete Product
 *       description: Delete a product by its ID
 *       operationId: deleteProduct
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
 *         - name: productId
 *           in: path
 *           required: true
 *           schema:
 *             type: string
 *       responses:
 *         "204":
 *           description: Product deleted successfully
 *         "401":
 *           description: Unauthorized
 *         "404":
 *           description: Product not found
 */

router.route("/").post(authenticateV1, createV1).get(authenticateV1, getV1);

router
  .route("/:productId")
  .get(authenticateV1, getByIdV1)
  .put(authenticateV1, updateV1)
  .delete(authenticateV1, deleteV1);

export default router;
