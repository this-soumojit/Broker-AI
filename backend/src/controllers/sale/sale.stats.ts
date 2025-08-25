import { Request, Response, NextFunction } from "express";
import { Sale, UserSubscription, Book } from "../../models";

const getSalesStatsV1 = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { userId, bookId } = req.params;

    let currentCount: number;
    let totalUserSales: number;

    if (bookId) {
      // Book-specific stats: count sales for this specific book
      currentCount = await Sale.count({
        where: { bookId },
      });

      // For total user sales, we need to join through books
      totalUserSales = await Sale.count({
        include: [
          {
            model: Book,
            where: { userId },
            attributes: [],
          },
        ],
      });
    } else {
      // User-level stats: count all sales for user across all books
      currentCount = await Sale.count({
        include: [
          {
            model: Book,
            where: { userId },
            attributes: [],
          },
        ],
      });
      totalUserSales = currentCount;
    }

    // Get user's subscription plan
    const userSubscription = await UserSubscription.findOne({
      where: { userId, status: "ACTIVE" },
      order: [["createdAt", "DESC"]],
    });

    // Define plan limits for sales
    const planLimits = {
      Basic: 20, // Basic plan allows 20 sales
      Professional: -1, // -1 represents unlimited
      Enterprise: -1, // -1 represents unlimited
    };

    const planName = userSubscription?.dataValues?.planName || "Basic";
    const limit = planLimits[planName as keyof typeof planLimits] || 20;
    const isUnlimited = limit === -1;

    res.status(200).json({
      message: "Sales stats retrieved successfully",
      data: {
        currentCount, // This will be book-specific if bookId is provided
        totalCount: bookId ? totalUserSales : currentCount, // Total user sales for plan limit checking
        limit: isUnlimited ? null : limit,
        isUnlimited,
        planName,
        canAddMore: isUnlimited || totalUserSales < limit,
        remainingSlots: isUnlimited ? null : Math.max(0, limit - totalUserSales),
        isBookSpecific: !!bookId,
      },
    });
  } catch (error) {
    next(error);
  }
};

export { getSalesStatsV1 };
