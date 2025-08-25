import { Request, Response, NextFunction } from "express";

import { Client, UserSubscription } from "../../models";
import { throwCustomError } from "../../utils/error";

const createV1 = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { userId } = req.params;

    const { name, email, phone, pan, gstin, address, notes } = req.body;

    // Check user's subscription plan and client limits
    const userSubscription = await UserSubscription.findOne({
      where: { userId, status: "ACTIVE" },
      order: [["createdAt", "DESC"]],
    });

    // Get current client count
    const currentClientCount = await Client.count({
      where: { userId },
    });

    // Define plan limits
    const planLimits = {
      Basic: 5,
      Professional: Infinity,
      Enterprise: Infinity,
    };

    // Check if user has reached their limit
    if (userSubscription) {
      const planName = userSubscription.dataValues.planName;
      const limit = planLimits[planName as keyof typeof planLimits] || 0;

      if (currentClientCount >= limit) {
        return throwCustomError(
          403,
          `You have reached the maximum number of clients (${limit}) for your ${planName} plan. Please upgrade to add more clients.`,
        );
      }
    } else {
      // No subscription - treat as Basic plan limit
      if (currentClientCount >= planLimits.Basic) {
        return throwCustomError(
          403,
          `You have reached the maximum number of clients (${planLimits.Basic}) for the Basic plan. Please subscribe to add more clients.`,
        );
      }
    }

    const query: Record<string, string | undefined> = {
      userId,
      phone: phone.trim(),
      pan: pan.trim(),
    };

    const clientRecord = await Client.findOne({
      where: query,
    });

    if (clientRecord) {
      return throwCustomError(400, "Client with same details already exists");
    }

    const newClientRecord = await Client.create({
      name,
      email,
      phone,
      pan,
      gstin,
      address,
      notes,
      userId,
    });

    if (!newClientRecord) {
      return throwCustomError(500, "Failed to create client");
    }

    res.status(201).json({
      message: "Client created successfully",
      data: newClientRecord.dataValues,
    });
  } catch (error) {
    next(error);
  }
};

export { createV1 };
