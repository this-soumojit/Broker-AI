import { Router } from "express";

import { loginV1 } from "../../controllers/auth/login";
import {
  forgotPasswordV1,
  forgotPasswordOtpVerificationV1,
  forgotPasswordOtpResendV1,
  setNewPasswordV1,
} from "../../controllers/auth/password";
import {
  signupV1,
  signupOtpVerificationV1,
  signupOtpResendV1,
} from "../../controllers/auth/signup";
import { authenticateV1 } from "../../middlewares/auth";

const router = Router();

/**
 * @swagger
 * tags:
 *   name: Authentication
 *   description: Endpoints related to user authentication
 * openapi: 3.0.0
 * info:
 *   title: Authentication API
 *   description: Endpoints related to user authentication
 *   version: 1.0.0
 *
 * paths:
 *   /api/v1/auth/signup:
 *     post:
 *       tags:
 *         - Authentication
 *       summary: User Signup
 *       description: Register a new user and send an OTP for verification.
 *       operationId: signupUser
 *       requestBody:
 *         required: true
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               required:
 *                 - email
 *                 - name
 *                 - phone
 *                 - password
 *               properties:
 *                 email:
 *                   type: string
 *                   format: email
 *                   example: "user@example.com"
 *                 name:
 *                   type: string
 *                   example: "John Doe"
 *                 phone:
 *                   type: string
 *                   example: "+1234567890"
 *                 password:
 *                   type: string
 *                   format: password
 *                   example: "SecureP@ssw0rd"
 *       responses:
 *         "201":
 *           description: Signup successful, OTP sent.
 *         "400":
 *           description: Email already in use.
 *
 *   /api/v1/auth/signup/otp/verify:
 *     post:
 *       tags:
 *         - Authentication
 *       summary: Verify Signup OTP
 *       description: Verify the OTP sent to email/phone.
 *       operationId: verifySignupOtp
 *       requestBody:
 *         required: true
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               required:
 *                 - otp
 *               properties:
 *                 email:
 *                   type: string
 *                   format: email
 *                   example: "user@example.com"
 *                 phone:
 *                   type: string
 *                   example: "+1234567890"
 *                 otp:
 *                   type: string
 *                   example: "123456"
 *       responses:
 *         "200":
 *           description: Email verified successfully.
 *         "400":
 *           description: Invalid or expired OTP.
 *
 *   /api/v1/auth/signup/otp/resend:
 *     post:
 *       tags:
 *         - Authentication
 *       summary: Resend Signup OTP
 *       description: Resend OTP for email verification.
 *       operationId: resendSignupOtp
 *       requestBody:
 *         required: true
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               required:
 *                 - email
 *               properties:
 *                 email:
 *                   type: string
 *                   format: email
 *                   example: "user@example.com"
 *       responses:
 *         "200":
 *           description: OTP sent successfully.
 *         "400":
 *           description: User record not found or email already verified.
 *
 *   /api/v1/auth/login:
 *     post:
 *       tags:
 *         - Authentication
 *       summary: Login
 *       description: Login a user.
 *       operationId: loginUser
 *       requestBody:
 *         required: true
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               required:
 *                 - email
 *                 - password
 *               properties:
 *                 email:
 *                   type: string
 *                   format: email
 *                   example: "user@example.com"
 *                 password:
 *                   type: string
 *                   format: password
 *                   example: "SecureP@ssw0rd"
 *       responses:
 *         "200":
 *           description: Login successful.
 *         "400":
 *           description: Invalid email or password.
 *
 *   /api/v1/auth/forgot-password:
 *     post:
 *       tags:
 *         - Authentication
 *       summary: Forgot Password
 *       description: Forgot password.
 *       operationId: forgotPassword
 *       requestBody:
 *         required: true
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               required:
 *                 - email
 *               properties:
 *                 email:
 *                   type: string
 *                   format: email
 *                   example: "user@example.com"
 *       responses:
 *         "200":
 *           description: Forgot password successful.
 *         "400":
 *           description: User record not found or email not verified.
 *
 *   /api/v1/auth/forgot-password/otp/verify:
 *     post:
 *       tags:
 *         - Authentication
 *       summary: Verify Forgot Password OTP
 *       description: Verify the OTP sent to email.
 *       operationId: verifyForgotPasswordOtp
 *       requestBody:
 *         required: true
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               required:
 *                 - otp
 *                 - email
 *               properties:
 *                 otp:
 *                   type: string
 *                   example: "123456"
 *                 email:
 *                   type: string
 *                   format: email
 *                   example: "user@example.com"
 *       responses:
 *         "200":
 *           description: OTP verified successfully.
 *         "400":
 *           description: Invalid or expired OTP.
 *
 *   /api/v1/auth/forgot-password/otp/resend:
 *     post:
 *       tags:
 *         - Authentication
 *       summary: Resend Forgot Password OTP
 *       description: Resend OTP for forgot password.
 *       operationId: resendForgotPasswordOtp
 *       requestBody:
 *         required: true
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               required:
 *                 - email
 *               properties:
 *                 email:
 *                   type: string
 *                   format: email
 *                   example: "user@example.com"
 *       responses:
 *         "200":
 *           description: OTP sent successfully.
 *         "400":
 *           description: User record not found or email not verified.
 *
 *   /api/v1/auth/forgot-password/set-new-password:
 *     post:
 *       tags:
 *         - Authentication
 *       security:
 *         - bearerAuth: []
 *       summary: Set New Password
 *       description: Set a new password.
 *       operationId: setNewPassword
 *       requestBody:
 *         required: true
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               required:
 *                 - password
 *                 - confirmPassword
 *               properties:
 *                 password:
 *                   type: string
 *                   format: password
 *                   example: "SecureP@ssw0rd"
 *                 confirmPassword:
 *                   type: string
 *                   format: password
 *                   example: "SecureP@ssw0rd"
 *       responses:
 *         "200":
 *           description: Password updated successfully.
 *         "400":
 *           description: Passwords do not match.
 */

router.route("/signup").post(signupV1);
router.route("/signup/otp/verify").post(signupOtpVerificationV1);
router.route("/signup/otp/resend").post(signupOtpResendV1);
router.route("/login").post(loginV1);
router.route("/forgot-password").post(forgotPasswordV1);
router.route("/forgot-password/otp/verify").post(forgotPasswordOtpVerificationV1);
router.route("/forgot-password/otp/resend").post(forgotPasswordOtpResendV1);
router.route("/forgot-password/set-new-password").post(authenticateV1, setNewPasswordV1);

export default router;
