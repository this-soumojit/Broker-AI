import { Request, Response, NextFunction } from "express";

import { Client, UserSubscription } from "../../models";

const getClientStatsV1 = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { userId } = req.params;

    // Get current client count
    const currentCount = await Client.count({
      where: { userId },
    });

    // Get user's subscription plan
    const userSubscription = await UserSubscription.findOne({
      where: { userId, status: "ACTIVE" },
      order: [["createdAt", "DESC"]],
    });

    // Define plan limits
    const planLimits = {
      Basic: 5,
      Professional: -1, // -1 represents unlimited
      Enterprise: -1, // -1 represents unlimited
    };

    const planName = userSubscription?.dataValues?.planName || "Basic";
    const limit = planLimits[planName as keyof typeof planLimits] || 5;
    const isUnlimited = limit === -1;

    res.status(200).json({
      message: "Client stats retrieved successfully",
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

export { getClientStatsV1 };
