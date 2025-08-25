import { Request, Response, NextFunction } from "express";

import { User } from "../../models";
import { throwCustomError } from "../../utils/error";

const getByIdV1 = async (
  req: Request & { user?: { id: string } },
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const { userId } = req.params;

    if (!userId) {
      return throwCustomError(400, "User ID is required");
    }

    let userRecord;

    if (userId.toLowerCase() === "me" && req.user) {
      const { id } = req.user;

      userRecord = await User.findOne({
        where: {
          id,
        },
        attributes: {
          exclude: ["password"],
        },
      });
    } else {
      userRecord = await User.findOne({
        where: {
          id: userId,
        },
      });
    }

    if (!userRecord) {
      return throwCustomError(404, "User not found");
    }

    res.status(200).json({
      data: userRecord.dataValues,
    });
  } catch (error) {
    next(error);
  }
};

export { getByIdV1 };
