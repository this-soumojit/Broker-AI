import { Router } from "express";
import { getByIdV1 } from "../../controllers/user/get.by.id";
import { updateV1 } from "../../controllers/user/update";
import { findUserStatsById } from "../../controllers/user/get.stats.by.id";
import { authenticateV1 } from "../../middlewares/auth";

const router = Router({ mergeParams: true });

/**
 * @swagger
 * tags:
 *   name: User
 *   description: Endpoints related to user
 * openapi: 3.0.0
 * info:
 *   title: User API
 *   description: Endpoints related to user
 *   version: 1.0.0
 *
 * paths:
 *   /api/v1/users/{userId}:
 *     get:
 *       tags:
 *         - User
 *       summary: Get User by ID
 *       description: Get a user by their ID.
 *       operationId: getById
 *       security:
 *         - bearerAuth: []
 *       parameters:
 *         - name: userId
 *           in: path
 *           required: true
 *           description: The ID of the user to retrieve.
 *           schema:
 *             type: string
 *       responses:
 *         "200":
 *           description: User retrieved successfully.
 *         "400":
 *           description: User ID is required.
 *         "404":
 *           description: User not found.
 *     put:
 *       tags:
 *         - User
 *       summary: Update User
 *       description: Update a user by their ID.
 *       operationId: update
 *       security:
 *         - bearerAuth: []
 *       parameters:
 *         - name: userId
 *           in: path
 *           required: true
 *       requestBody:
 *         required: true
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               required:
 *                 - name
 *                 - phone
 *                 - currentPassword
 *                 - newPassword
 *       responses:
 *         "200":
 *           description: User updated successfully.
 *         "400":
 *           description: User ID is required.
 *         "404":
 *           description: User not found.
 *   /api/v1/users/{userId}/reminder-permission:
 *     get:
 *       tags:
 *         - User
 *       summary: Check reminder permission
 *       description: Check if user can send payment reminders based on their plan.
 *       operationId: getReminderPermission
 *       security:
 *         - bearerAuth: []
 *       parameters:
 *         - name: userId
 *           in: path
 *           required: true
 *           schema:
 *             type: string
 *       responses:
 *         "200":
 *           description: Permission check successful
 *           content:
 *             application/json:
 *               schema:
 *                 type: object
 *                 properties:
 *                   planName:
 *                     type: string
 *                     enum: [Basic, Professional, Enterprise]
 *                   canSendReminders:
 *                     type: boolean
 *         "403":
 *           description: Forbidden (invalid user or missing subscription)
 *         "500":
 *           description: Internal server error
 */

router.route("/:userId").get(authenticateV1, getByIdV1).put(authenticateV1, updateV1);

router.route("/:userId/reminder-permission").get(authenticateV1, findUserStatsById);

export default router;
