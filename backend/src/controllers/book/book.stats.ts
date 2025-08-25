import { Request, Response, NextFunction } from "express";
import { Book, UserSubscription } from "../../models";

const getBookStatsV1 = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { userId } = req.params;

    // Get current book count
    const currentCount = await Book.count({
      where: { userId },
    });

    // Get user's subscription plan
    const userSubscription = await UserSubscription.findOne({
      where: { userId, status: "ACTIVE" },
      order: [["createdAt", "DESC"]],
    });

    // Define book plan limits
    const bookPlanLimits = {
      Basic: 1, // Basic plan allows 1 book
      Professional: -1, // -1 represents unlimited
      Enterprise: -1, // -1 represents unlimited
    };

    const planName = userSubscription?.dataValues?.planName || "Basic";
    const limit = bookPlanLimits[planName as keyof typeof bookPlanLimits] || 3;
    const isUnlimited = limit === -1;

    res.status(200).json({
      message: "Book stats retrieved successfully",
      data: {
        currentCount,
        limit: isUnlimited ? null : limit,
        isUnlimited,
        planName,
        canAddMore: isUnlimited || currentCount < limit,
        remainingSlots: isUnlimited ? null : Math.max(0, limit - currentCount),
      },
    });
  } catch (error) {
    next(error);
  }
};

export { getBookStatsV1 };
