import { Request, Response, NextFunction } from "express";
import { Client, Book, Sale, UserSubscription } from "../models";
import { throwCustomError } from "../utils/error";

// Define plan limits
export const PLAN_LIMITS = {
  Basic: {
    clients: 5,
    books: 1,
    invoicesPerMonth: 20,
    features: {
      paymentReminders: false,
      aiInsights: false,
      whatsappAutomation: false,
      bulkEmail: false,
      apiAccess: false,
      multiUser: false,
      analytics: false,
      whiteLabel: false,
    },
  },
  Professional: {
    clients: -1, // unlimited
    books: -1, // unlimited
    invoicesPerMonth: -1, // unlimited
    features: {
      paymentReminders: true,
      aiInsights: true,
      whatsappAutomation: true,
      bulkEmail: true,
      apiAccess: false,
      multiUser: false,
      analytics: false,
      whiteLabel: false,
    },
  },
  Enterprise: {
    clients: -1, // unlimited
    books: -1, // unlimited
    invoicesPerMonth: -1, // unlimited
    features: {
      paymentReminders: true,
      aiInsights: true,
      whatsappAutomation: true,
      bulkEmail: true,
      apiAccess: true,
      multiUser: true,
      analytics: true,
      whiteLabel: true,
    },
  },
};

/**
 * Get user's current plan and limits
 */
export const getUserPlanLimits = async (userId: string) => {
  const userSubscription = await UserSubscription.findOne({
    where: { userId, status: "ACTIVE" },
    order: [["createdAt", "DESC"]],
  });

  const planName = userSubscription?.dataValues?.planName || "Basic";
  const limits = PLAN_LIMITS[planName as keyof typeof PLAN_LIMITS] || PLAN_LIMITS.Basic;

  return { planName, limits, subscription: userSubscription };
};

/**
 * Middleware to check client creation limits
 */
export const checkClientLimits = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { userId } = req.params;

    if (!userId) {
      return throwCustomError(401, "User ID is required");
    }

    const { planName, limits } = await getUserPlanLimits(userId);

    if (limits.clients === -1) {
      return next(); // Unlimited clients
    }

    const currentCount = await Client.count({ where: { userId } });

    if (currentCount >= limits.clients) {
      return throwCustomError(
        403,
        `You have reached the maximum number of clients (${limits.clients}) for your ${planName} plan. Please upgrade to add more clients.`,
      );
    }

    next();
  } catch (error) {
    next(error);
  }
};

/**
 * Middleware to check book creation limits
 */
export const checkBookLimits = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { userId } = req.params;

    if (!userId) {
      return throwCustomError(401, "User ID is required");
    }

    const { planName, limits } = await getUserPlanLimits(userId);

    if (limits.books === -1) {
      return next(); // Unlimited books
    }

    const currentCount = await Book.count({ where: { userId } });

    if (currentCount >= limits.books) {
      return throwCustomError(
        403,
        `You have reached the maximum number of books (${limits.books}) for your ${planName} plan. Please upgrade to add more books.`,
      );
    }

    next();
  } catch (error) {
    next(error);
  }
};

/**
 * Middleware to check invoice creation limits
 */
export const checkInvoiceLimits = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { userId, bookId } = req.params;

    if (!userId) {
      return throwCustomError(401, "User ID is required");
    }

    const { planName, limits } = await getUserPlanLimits(userId);

    if (limits.invoicesPerMonth === -1) {
      return next(); // Unlimited invoices
    }

    // Check invoices count for current month
    const currentDate = new Date();
    const firstDayOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
    const lastDayOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0);

    const currentCount = await Sale.count({
      include: [
        {
          model: Book,
          where: { userId },
          required: true,
        },
      ],
      where: {
        invoiceDate: {
          [require("sequelize").Op.between]: [firstDayOfMonth, lastDayOfMonth],
        },
      },
    });

    if (currentCount >= limits.invoicesPerMonth) {
      return throwCustomError(
        403,
        `You have reached the maximum number of invoices (${limits.invoicesPerMonth}) for this month on your ${planName} plan. Please upgrade to create more invoices.`,
      );
    }

    next();
  } catch (error) {
    next(error);
  }
};

/**
 * Middleware to check feature access
 */
export const checkFeatureAccess = (feature: keyof typeof PLAN_LIMITS.Basic.features) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { userId } = req.params;

      if (!userId) {
        return throwCustomError(401, "User ID is required");
      }

      const { planName, limits } = await getUserPlanLimits(userId);

      if (!limits.features[feature]) {
        return throwCustomError(
          403,
          `This feature is not available for your ${planName} plan. Please upgrade to access this feature.`,
        );
      }

      next();
    } catch (error) {
      next(error);
    }
  };
};

/**
 * Utility function to enforce limits on existing data when downgrading
 */
export const enforceDowngradeLimits = async (userId: string, targetPlan: string) => {
  const targetLimits = PLAN_LIMITS[targetPlan as keyof typeof PLAN_LIMITS];

  if (!targetLimits) {
    throw new Error("Invalid target plan");
  }

  const issues: string[] = [];

  // Check clients
  if (targetLimits.clients !== -1) {
    const clientCount = await Client.count({ where: { userId } });
    if (clientCount > targetLimits.clients) {
      issues.push(
        `You have ${clientCount} clients but ${targetPlan} plan allows only ${targetLimits.clients}.`,
      );
    }
  }

  // Check books
  if (targetLimits.books !== -1) {
    const bookCount = await Book.count({ where: { userId } });
    if (bookCount > targetLimits.books) {
      issues.push(
        `You have ${bookCount} books but ${targetPlan} plan allows only ${targetLimits.books}.`,
      );
    }
  }

  // Check monthly invoices
  if (targetLimits.invoicesPerMonth !== -1) {
    const currentDate = new Date();
    const firstDayOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
    const lastDayOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0);

    const invoiceCount = await Sale.count({
      include: [
        {
          model: Book,
          where: { userId },
          required: true,
        },
      ],
      where: {
        invoiceDate: {
          [require("sequelize").Op.between]: [firstDayOfMonth, lastDayOfMonth],
        },
      },
    });

    if (invoiceCount > targetLimits.invoicesPerMonth) {
      issues.push(
        `You have created ${invoiceCount} invoices this month but ${targetPlan} plan allows only ${targetLimits.invoicesPerMonth} per month.`,
      );
    }
  }

  return issues;
};
