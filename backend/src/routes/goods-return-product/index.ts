import { Router } from "express";

import { createV1 } from "../../controllers/goods-return-product/create";
import { deleteV1 } from "../../controllers/goods-return-product/delete";
import { getV1 } from "../../controllers/goods-return-product/get";
import { getByIdV1 } from "../../controllers/goods-return-product/get.by.id";
import { updateV1 } from "../../controllers/goods-return-product/update";
import { authenticateV1 } from "../../middlewares/auth";
import { validateExistenceV1 } from "../../middlewares/existence";
import { Book, Sale, GoodsReturn, GoodsReturnProduct } from "../../models";

const router = Router({ mergeParams: true });

router.param("bookId", validateExistenceV1(Book));
router.param("saleId", validateExistenceV1(Sale));
router.param("goodsReturnId", validateExistenceV1(GoodsReturn));
router.param("goodsReturnProductId", validateExistenceV1(GoodsReturnProduct));

/**
 * @swagger
 * tags:
 *   name: Goods Return Product
 *   description: Endpoints related to goods return products
 * openapi: 3.0.0
 * info:
 *   title: Goods Return Product API
 *   description: Endpoints related to goods return products
 *   version: 1.0.0
 *
 * paths:
 *   /api/v1/users/{userId}/books/{bookId}/sales/{saleId}/goods-returns/{goodsReturnId}/products:
 *     post:
 *       tags:
 *         - Goods Return Product
 *       summary: Create Goods Return Product
 *       description: Create a new goods return product record
 *       operationId: createGoodsReturnProduct
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
 *         - name: goodsReturnId
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
 *                 productId:
 *                   type: string
 *                 quantity:
 *                   type: number
 *       responses:
 *         "201":
 *           description: Goods return product created successfully
 *         "400":
 *           description: Goods return product with same name already exists
 *         "401":
 *           description: Unauthorized
 *         "500":
 *           description: Failed to create goods return product
 *     get:
 *       tags:
 *         - Goods Return Product
 *       summary: Get Goods Return Products
 *       description: Get all goods return products for a goods return
 *       operationId: getGoodsReturnProducts
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
 *         - name: goodsReturnId
 *           in: path
 *           required: true
 *           schema:
 *             type: string
 *       responses:
 *         "200":
 *           description: Goods return products retrieved successfully
 *         "401":
 *           description: Unauthorized
 *
 *   /api/v1/users/{userId}/books/{bookId}/sales/{saleId}/goods-returns/{goodsReturnId}/products/{goodsReturnProductId}:
 *     get:
 *       tags:
 *         - Goods Return Product
 *       summary: Get Goods Return Product by ID
 *       description: Get a goods return product by its ID
 *       operationId: getGoodsReturnProductById
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
 *         - name: goodsReturnId
 *           in: path
 *           required: true
 *           schema:
 *             type: string
 *         - name: goodsReturnProductId
 *           in: path
 *           required: true
 *           schema:
 *             type: string
 *       responses:
 *         "200":
 *           description: Goods return product retrieved successfully
 *         "401":
 *           description: Unauthorized
 *         "404":
 *           description: Goods return product not found
 *     put:
 *       tags:
 *         - Goods Return Product
 *       summary: Update Goods Return Product
 *       description: Update a goods return product by its ID
 *       operationId: updateGoodsReturnProduct
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
 *         - name: goodsReturnId
 *           in: path
 *           required: true
 *           schema:
 *             type: string
 *         - name: goodsReturnProductId
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
 *                 productId:
 *                   type: string
 *                 quantity:
 *                   type: number
 *       responses:
 *         "200":
 *           description: Goods return product updated successfully
 *         "400":
 *           description: Goods return product with same name already exists
 *         "401":
 *           description: Unauthorized
 *         "404":
 *           description: Product not found
 *     delete:
 *       tags:
 *         - Goods Return Product
 *       summary: Delete Goods Return Product
 *       description: Delete a goods return product by its ID
 *       operationId: deleteGoodsReturnProduct
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
 *         - name: goodsReturnId
 *           in: path
 *           required: true
 *           schema:
 *             type: string
 *         - name: goodsReturnProductId
 *           in: path
 *           required: true
 *           schema:
 *             type: string
 *       responses:
 *         "204":
 *           description: Goods return product deleted successfully
 *         "401":
 *           description: Unauthorized
 *         "404":
 *           description: Goods return product not found
 */

router.route("/").post(authenticateV1, createV1).get(authenticateV1, getV1);

router
  .route("/:goodsReturnProductId")
  .get(authenticateV1, getByIdV1)
  .put(authenticateV1, updateV1)
  .delete(authenticateV1, deleteV1);

export default router;
