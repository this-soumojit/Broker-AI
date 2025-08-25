import { Request, Response, NextFunction } from "express";
import { UserSubscription, User } from "../../models";
import { throwCustomError } from "../../utils/error";
import { enforceDowngradeLimits } from "../../middlewares/planLimits";
import axios from "axios";

// Cashfree configuration
const CASHFREE_BASE_URL = "https://sandbox.cashfree.com/pg";

console.log("Cashfree configuration loaded successfully");

export const createPlanPayment = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const { userId } = req.params;
    const { planName, planPrice, duration = 1 } = req.body;

    if (!userId) {
      return throwCustomError(401, "User not authenticated");
    }

    // Fetch user details for customer information
    const user = await User.findByPk(userId);
    if (!user) {
      return throwCustomError(404, "User not found");
    }

    const userData = user.dataValues;

    // Check for existing active subscription
    const existingSubscription = await UserSubscription.findOne({
      where: {
        userId,
        status: "ACTIVE",
      },
      order: [["createdAt", "DESC"]],
    });

    // Simple upgrade logic: Basic can upgrade to anything, others cannot
    if (existingSubscription) {
      const currentPlan = existingSubscription.dataValues.planName;

      // If trying to get the same plan, block it
      if (currentPlan === planName) {
        return throwCustomError(400, `You already have an active ${planName} subscription.`);
      }

      // If current plan is Basic, allow upgrade to professional/Enterprise
      if (currentPlan === "Basic" && (planName === "Professional" || planName === "Enterprise")) {
        // Mark old subscription as upgraded
        await existingSubscription.update({
          status: "UPGRADED",
          endDate: new Date(),
        });
      }
      // For any other case (Premium to Basic, Professional to Basic, Premium to Professional), block it
      else if (currentPlan !== "Basic") {
        return throwCustomError(
          400,
          `Cannot change from ${currentPlan} to ${planName}. Please contact support for plan changes.`,
        );
      }
    }

    // Handle free plan
    if (planPrice === 0 || planName === "Basic") {
      const timestamp = Date.now().toString().slice(-8);
      const userIdShort = userId.split("-")[0];
      const freeOrderId = `FREE_${timestamp}_${userIdShort}`;

      const subscription = await UserSubscription.create({
        userId,
        planName,
        planPrice: 0,
        duration: 0, // forever
        orderId: freeOrderId,
        status: "ACTIVE",
        paymentStatus: "COMPLETED",
        startDate: new Date(),
        endDate: null, // Free forever
      });

      if (!subscription) {
        return throwCustomError(500, "Failed to create subscription");
      }

      res.status(201).json({
        message: "Free plan activated successfully",
        data: subscription.dataValues,
      });
      return;
    }

    // Create payment order for paid plans
    // Generate shorter order ID (max 50 chars for Cashfree)
    const timestamp = Date.now().toString().slice(-8); // Last 8 digits
    const userIdShort = userId.split("-")[0]; // First part of UUID
    const orderId = `ORD_${timestamp}_${userIdShort}`;

    // Create order using Cashfree REST API (like your working example)
    let response;
    try {
      console.log("Creating Cashfree order:", { orderId, planPrice, userId });

      response = await axios.post(
        `${CASHFREE_BASE_URL}/orders`,
        {
          order_id: orderId,
          order_amount: planPrice,
          order_currency: "INR",
          customer_details: {
            customer_id: userId.toString(),
            customer_name: userData.name,
            customer_email: userData.email,
            customer_phone: userData.phone,
          },
          order_meta: {
            return_url: `${process.env.FRONTEND_URL}/payment/success?order_id=${orderId}`,
            notify_url: `${process.env.BACKEND_URL}/api/v1/users/${userId}/subscriptions/webhook`,
          },
        },
        {
          headers: {
            "x-client-id": process.env.CASHFREE_CLIENT_ID!,
            "x-client-secret": process.env.CASHFREE_CLIENT_SECRET!,
            "x-api-version": "2022-09-01",
            "Content-Type": "application/json",
          },
        },
      );

      console.log("Cashfree order created successfully:", response.data);
    } catch (sdkError: any) {
      console.error("Cashfree API Error:", sdkError.response?.data || sdkError.message);
      throw new Error(
        `Payment gateway error: ${sdkError.response?.data?.message || sdkError.message || "Unknown error"}`,
      );
    }

    if (!response || !response.data) {
      return throwCustomError(500, "Failed to create payment order");
    }

    // Store subscription record
    const subscription = await UserSubscription.create({
      userId,
      planName,
      planPrice,
      duration,
      orderId,
      status: "PENDING",
      paymentStatus: "PENDING",
      startDate: null,
      endDate: null,
    });

    if (!subscription) {
      return throwCustomError(500, "Failed to create subscription record");
    }

    res.status(201).json({
      message: "Payment order created successfully",
      data: {
        orderId,
        paymentSessionId: response.data.payment_session_id,
        orderToken: response.data.order_token || response.data.cf_order_id,
        orderStatus: response.data.order_status,
      },
    });
  } catch (error) {
    next(error);
  }
};

export const getUserSubscription = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const { userId } = req.params;

    const subscription = await UserSubscription.findOne({
      where: { userId, status: "ACTIVE" },
      order: [["createdAt", "DESC"]],
    });

    res.status(200).json({
      message: "Subscription fetched successfully",
      data: subscription?.dataValues || null,
    });
  } catch (error) {
    next(error);
  }
};

export const checkPaymentStatus = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const { userId } = req.params;
    const { orderId } = req.query;

    if (!orderId) {
      return throwCustomError(400, "Order ID is required");
    }

    console.log("Checking payment status for:", { orderId, userId });

    // Check payment status with Cashfree
    try {
      const response = await axios.get(`${CASHFREE_BASE_URL}/orders/${orderId}`, {
        headers: {
          "x-client-id": process.env.CASHFREE_CLIENT_ID!,
          "x-client-secret": process.env.CASHFREE_CLIENT_SECRET!,
          "x-api-version": "2022-09-01",
          "Content-Type": "application/json",
        },
      });

      console.log("Cashfree order status:", response.data);

      // Update subscription based on payment status
      const subscription = await UserSubscription.findOne({
        where: { orderId: orderId as string },
      });

      if (subscription && response.data.order_status === "PAID") {
        const startDate = new Date();
        const endDate = new Date(startDate);
        const subscriptionData = subscription.dataValues;
        endDate.setMonth(endDate.getMonth() + subscriptionData.duration);

        await subscription.update({
          status: "ACTIVE",
          paymentStatus: "COMPLETED",
          startDate,
          endDate: subscriptionData.duration === 0 ? null : endDate,
        });

        console.log("Subscription updated to ACTIVE after status check");
      }

      res.status(200).json({
        message: "Payment status checked successfully",
        data: {
          orderStatus: response.data.order_status,
          subscription: subscription?.dataValues,
        },
      });
    } catch (error: any) {
      console.error("Error checking payment status:", error.response?.data || error.message);
      throw new Error(
        `Payment status check failed: ${error.response?.data?.message || error.message}`,
      );
    }
  } catch (error) {
    next(error);
  }
};

export const downgradePlan = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const { userId } = req.params;
    const { planName } = req.body;

    console.log("Downgrade request received:", { userId, planName });

    if (!userId) {
      return throwCustomError(401, "User not authenticated");
    }

    if (!planName) {
      return throwCustomError(400, "Plan name is required");
    }

    // Find current active subscription
    const currentSubscription = await UserSubscription.findOne({
      where: {
        userId,
        status: "ACTIVE",
      },
      order: [["createdAt", "DESC"]],
    });

    if (!currentSubscription) {
      return throwCustomError(404, "No active subscription found");
    }

    const currentPlan = currentSubscription.dataValues.planName;
    console.log("Current plan:", currentPlan, "Target plan:", planName);

    // Validate downgrade rules
    const planHierarchy = { Basic: 1, Professional: 2, Enterprise: 3 };
    const currentLevel = planHierarchy[currentPlan as keyof typeof planHierarchy];
    const targetLevel = planHierarchy[planName as keyof typeof planHierarchy];

    if (!currentLevel || !targetLevel) {
      return throwCustomError(400, "Invalid plan name");
    }

    if (targetLevel >= currentLevel) {
      return throwCustomError(400, "Can only downgrade to a lower tier plan");
    }

    // Check if user's current data exceeds target plan limits
    try {
      const limitIssues = await enforceDowngradeLimits(userId, planName);

      if (limitIssues.length > 0) {
        return throwCustomError(
          400,
          `Cannot downgrade to ${planName} plan:\n${limitIssues.join("\n")}\n\nPlease reduce your usage to fit within the ${planName} plan limits before downgrading.`,
        );
      }
    } catch (limitError) {
      console.error("Error checking downgrade limits:", limitError);
      // Continue with downgrade if limit check fails (for now)
    }

    // Mark current subscription as downgraded
    await currentSubscription.update({
      status: "DOWNGRADED",
      endDate: new Date(),
    });

    // Create new subscription for downgraded plan
    const timestamp = Date.now().toString().slice(-8);
    const userIdShort = userId.split("-")[0];
    const orderId = `DOWNGRADE_${timestamp}_${userIdShort}`;

    const newSubscription = await UserSubscription.create({
      userId,
      planName,
      planPrice: planName === "Basic" ? 0 : planName === "Professional" ? 999 : 2999,
      duration: planName === "Basic" ? 0 : 1,
      orderId,
      status: "ACTIVE",
      paymentStatus: "COMPLETED",
      startDate: new Date(),
      endDate:
        planName === "Basic" ? null : new Date(new Date().setMonth(new Date().getMonth() + 1)),
    });

    console.log("Downgrade successful:", newSubscription.dataValues);

    res.status(200).json({
      message: `Successfully downgraded to ${planName} plan. No refund will be processed for the previous plan.`,
      data: newSubscription.dataValues,
    });
  } catch (error) {
    console.error("Downgrade error:", error);
    next(error);
  }
};

export const handleWebhook = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    console.log("Webhook received:", req.body);

    // Cashfree webhook might send different field names
    const { orderId, orderStatus, order_id, order_status, cf_order_id } = req.body;

    // Use the correct field name from Cashfree webhook
    const finalOrderId = orderId || order_id || cf_order_id;
    const finalOrderStatus = orderStatus || order_status;

    console.log("Processing webhook for:", { finalOrderId, finalOrderStatus });

    const subscription = await UserSubscription.findOne({
      where: { orderId: finalOrderId },
    });

    if (!subscription) {
      console.error("Subscription not found for orderId:", finalOrderId);
      return throwCustomError(404, "Subscription not found");
    }

    console.log("Found subscription:", subscription.dataValues);

    if (finalOrderStatus === "PAID" || finalOrderStatus === "SUCCESS") {
      const startDate = new Date();
      const endDate = new Date(startDate);
      const subscriptionData = subscription.dataValues;
      endDate.setMonth(endDate.getMonth() + subscriptionData.duration);

      await subscription.update({
        status: "ACTIVE",
        paymentStatus: "COMPLETED",
        startDate,
        endDate: subscriptionData.duration === 0 ? null : endDate,
      });

      console.log("Subscription updated to ACTIVE");
    } else if (finalOrderStatus === "FAILED" || finalOrderStatus === "CANCELLED") {
      await subscription.update({
        status: "CANCELLED",
        paymentStatus: "FAILED",
      });

      console.log("Subscription updated to CANCELLED");
    }

    res.status(200).json({
      message: "Webhook processed successfully",
    });
  } catch (error) {
    console.error("Webhook processing error:", error);
    next(error);
  }
};
