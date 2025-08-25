import { Request, Response, NextFunction } from "express";
import { Client, UserSubscription } from "../../models";

export const getAccessibleClientsV1 = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const { userId } = req.params;

    // Get user's subscription plan
    const userSubscription = await UserSubscription.findOne({
      where: { userId, status: "ACTIVE" },
      order: [["createdAt", "DESC"]],
    });

    const planName = userSubscription?.dataValues?.planName || "Basic";
    const isUnlimited = planName !== "Basic";
    const clientLimit = isUnlimited ? null : 5;

    // Get all clients ordered by last updated/created
    const clients = await Client.findAll({
      where: { userId },
      order: [["updatedAt", "DESC"]],
    });

    // For basic plan, only the 5 most recent clients are accessible
    // For professional/enterprise, all clients are accessible
    const accessibleClients = clients.map((client, index) => ({
      ...client.dataValues,
      isAccessible: isUnlimited || index < 5, // First 5 clients are accessible for basic plan, all for others
    }));

    res.json({
      clients: accessibleClients,
      planDetails: {
        plan: planName,
        clientLimit: clientLimit,
        isUnlimited: isUnlimited,
      },
    });
  } catch (error) {
    next(error);
  }
};
