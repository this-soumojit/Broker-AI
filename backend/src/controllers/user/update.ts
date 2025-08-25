// backend/src/controllers/user/update.ts
import { Request, Response, NextFunction } from "express";
import { User } from "../../models";
import { hashPassword, comparePassword } from "../../utils/bcrypt";
import { throwCustomError } from "../../utils/error";

const updateV1 = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { userId } = req.params;
    const { name, phone, email, currentPassword, newPassword } = req.body; // Add email

    if (!userId) {
      return throwCustomError(400, "User ID is required");
    }

    const userRecord = await User.findOne({ where: { id: userId } });

    if (!userRecord) {
      return throwCustomError(404, "User not found");
    }

    // Check if email is being changed and if it already exists
    if (email && email !== userRecord.get("email")) {
      const existingUser = await User.findOne({ where: { email } });
      if (existingUser) {
        return throwCustomError(400, "Email already exists");
      }
    }

    // Password verification logic
    if (currentPassword || newPassword) {
      const isPasswordCorrect = comparePassword(
        currentPassword,
        userRecord.get("password") as string,
      );

      if (!isPasswordCorrect) {
        return throwCustomError(400, "Current password is incorrect");
      }
    }

    // Update fields
    await userRecord.update({
      ...(name && { name }),
      ...(phone && { phone }),
      ...(email && { email }), // Add email update
      ...(currentPassword && newPassword && { password: hashPassword(newPassword) }),
    });

    const { password, ...safeUser } = userRecord.toJSON();

    res.status(200).json({
      data: safeUser,
    });
  } catch (error) {
    next(error);
  }
};

export { updateV1 };
