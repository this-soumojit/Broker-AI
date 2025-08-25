import { Router } from "express";

import { createV1 } from "../../controllers/goods-return/create";
import { deleteV1 } from "../../controllers/goods-return/delete";
import { getV1 } from "../../controllers/goods-return/get";
import { getByIdV1 } from "../../controllers/goods-return/get.by.id";
import { updateV1 } from "../../controllers/goods-return/update";
import { authenticateV1 } from "../../middlewares/auth";
import { validateExistenceV1 } from "../../middlewares/existence";
import { Book, Sale, GoodsReturn } from "../../models";

const router = Router({ mergeParams: true });

router.param("bookId", validateExistenceV1(Book));
router.param("saleId", validateExistenceV1(Sale));
router.param("goodsReturnId", validateExistenceV1(GoodsReturn));

/**
 * @swagger
 * tags:
 *   name: Goods Return
 *   description: Endpoints related to goods returns
 * openapi: 3.0.0
 * info:
 *   title: Goods Return API
 *   description: Endpoints related to goods returns
 *   version: 1.0.0
 *
 * paths:
 *   /api/v1/users/{userId}/books/{bookId}/sales/{saleId}/goods-returns:
 *     post:
 *       tags:
 *         - Goods Return
 *       summary: Create Goods Return
 *       description: Create a new goods return record
 *       operationId: createGoodsReturn
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
 *                 notes:
 *                   type: string
 *       responses:
 *         "201":
 *           description: Goods return created successfully
 *         "400":
 *           description: Goods return with same name already exists
 *         "401":
 *           description: Unauthorized
 *         "500":
 *           description: Failed to create goods return
 *     get:
 *       tags:
 *         - Goods Return
 *       summary: Get Goods Returns
 *       description: Get all goods returns for a sale
 *       operationId: getGoodsReturns
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
 *           description: Goods returns retrieved successfully
 *         "401":
 *           description: Unauthorized
 *
 *   /api/v1/users/{userId}/books/{bookId}/sales/{saleId}/goods-returns/{goodsReturnId}:
 *     get:
 *       tags:
 *         - Goods Return
 *       summary: Get Goods Return by ID
 *       description: Get a goods return by its ID
 *       operationId: getGoodsReturnById
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
 *           description: Goods return retrieved successfully
 *         "401":
 *           description: Unauthorized
 *         "404":
 *           description: Goods return not found
 *     put:
 *       tags:
 *         - Goods Return
 *       summary: Update Goods Return
 *       description: Update a goods return by its ID
 *       operationId: updateGoodsReturn
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
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 # Same properties as POST request
 *       responses:
 *         "200":
 *           description: Goods return updated successfully
 *         "400":
 *           description: Goods return with same name already exists
 *         "401":
 *           description: Unauthorized
 *         "404":
 *           description: Product not found
 *     delete:
 *       tags:
 *         - Goods Return
 *       summary: Delete Goods Return
 *       description: Delete a goods return by its ID
 *       operationId: deleteGoodsReturn
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
 *         "204":
 *           description: Goods return deleted successfully
 *         "401":
 *           description: Unauthorized
 *         "404":
 *           description: Goods return not found
 */

router.route("/").post(authenticateV1, createV1).get(authenticateV1, getV1);

router
  .route("/:goodsReturnId")
  .get(authenticateV1, getByIdV1)
  .put(authenticateV1, updateV1)
  .delete(authenticateV1, deleteV1);

export default router;
