import { Router } from "express";
import { createV1 } from "../../controllers/book/create";
import { deleteV1 } from "../../controllers/book/delete";
import { getV1 } from "../../controllers/book/get";
import { getByIdV1 } from "../../controllers/book/get.by.id";
import { updateV1 } from "../../controllers/book/update";
import { getBookStatsV1 } from "../../controllers/book/book.stats";
import { getAccessibleBooksV1 } from "../../controllers/book/get.accessible.books";
import { authenticateV1 } from "../../middlewares/auth";
import { validateExistenceV1 } from "../../middlewares/existence";
import { checkBookLimits } from "../../middlewares/planLimits";
import { Book } from "../../models";

const router = Router({ mergeParams: true });

router.param("bookId", validateExistenceV1(Book));

/**
 * @swagger
 * tags:
 *   - name: Book
 *     description: Book management endpoints
 *
 * components:
 *   securitySchemes:
 *     bearerAuth:
 *       type: http
 *       scheme: bearer
 *       bearerFormat: JWT
 */

/**
 * @swagger
 * /api/v1/users/{userId}/books:
 *   post:
 *     tags: [Book]
 *     summary: Create a new book
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
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
 *             properties:
 *               name:
 *                 type: string
 *               startDate:
 *                 type: string
 *                 format: date
 *               endDate:
 *                 type: string
 *                 format: date
 *               openingBalance:
 *                 type: number
 *               closingBalance:
 *                 type: number
 *               notes:
 *                 type: string
 *     responses:
 *       201:
 *         description: Book created successfully
 *       400:
 *         description: Bad request
 *       401:
 *         description: Unauthorized
 *
 *   get:
 *     tags: [Book]
 *     summary: Get all books for a user
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: List of books
 *       401:
 *         description: Unauthorized
 */

/**
 * @swagger
 * /api/v1/users/{userId}/books/{bookId}:
 *   get:
 *     tags: [Book]
 *     summary: Get a specific book
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *       - in: path
 *         name: bookId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Book details
 *       404:
 *         description: Book not found
 *       401:
 *         description: Unauthorized
 *
 *   put:
 *     tags: [Book]
 *     summary: Update a book
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *       - in: path
 *         name: bookId
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
 *               name:
 *                 type: string
 *               startDate:
 *                 type: string
 *                 format: date
 *               endDate:
 *                 type: string
 *                 format: date
 *               openingBalance:
 *                 type: number
 *               closingBalance:
 *                 type: number
 *               notes:
 *                 type: string
 *     responses:
 *       200:
 *         description: Book updated
 *       400:
 *         description: Bad request
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Book not found
 *
 *   delete:
 *     tags: [Book]
 *     summary: Delete a book
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *       - in: path
 *         name: bookId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       204:
 *         description: Book deleted
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Book not found
 */

/**
 * @swagger
 * /api/v1/users/{userId}/books/stats:
 *   get:
 *     tags: [Book]
 *     summary: Get book statistics
 *     description: Returns book count and plan limits
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Book statistics
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 currentCount:
 *                   type: number
 *                 limit:
 *                   type: number
 *                   nullable: true
 *                 isUnlimited:
 *                   type: boolean
 *                 planName:
 *                   type: string
 *                 canAddMore:
 *                   type: boolean
 *                 remainingSlots:
 *                   type: number
 *                   nullable: true
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: User not found
 */

// CRUD Routes
router.route("/").post(authenticateV1, checkBookLimits, createV1).get(authenticateV1, getV1);

// Stats Route (must come before :bookId route)
router.get("/stats", authenticateV1, getBookStatsV1);

// Get accessible books (based on plan)
router.get("/accessible", authenticateV1, getAccessibleBooksV1);

// Book ID Routes
router
  .route("/:bookId")
  .get(authenticateV1, getByIdV1)
  .put(authenticateV1, updateV1)
  .delete(authenticateV1, deleteV1);

export default router;
