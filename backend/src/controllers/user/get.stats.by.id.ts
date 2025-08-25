import { Request, Response } from "express";
import { UserSubscription } from "../../models";

export const findUserStatsById = async (req: Request, res: Response) => {
  try {
    const { userId } = req.params;

    // Get user's active plan (Basic/Pro/Enterprise)
    const userSubscription = await UserSubscription.findOne({
      where: { userId, status: "ACTIVE" },
      order: [["createdAt", "DESC"]],
    });

    const planName = userSubscription?.dataValues?.planName || "Basic";

    // Response: Only plan name and permission flag
    res.status(200).json({
      planName,
      canSendReminders: planName !== "Basic", // true for Pro/Enterprise
    });
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch user plan status" });
  }
};
