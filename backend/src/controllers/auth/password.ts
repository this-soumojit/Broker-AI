import { Request, Response, NextFunction } from "express";

import { sequelize } from "../../config/db";
import { User, Otp } from "../../models";
import { sendEmail } from "../../services/smtp";
import { hashPassword } from "../../utils/bcrypt";
import { throwCustomError } from "../../utils/error";
import { generateToken } from "../../utils/jwt";

const forgotPasswordV1 = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  const transaction = await sequelize.transaction();

  try {
    const { email } = req.body;

    const userRecord = await User.findOne({
      where: { email: email.toLowerCase(), isVerified: true },
      transaction,
    });

    if (!userRecord) {
      return throwCustomError(400, "Email not found or not verified");
    }

    await Otp.destroy({ where: { email: userRecord.dataValues.email }, transaction });

    const otp = Math.floor(100000 + Math.random() * 900000).toString();

    const otpRecord = await Otp.create(
      {
        otp,
        email: userRecord.dataValues.email,
        phone: userRecord.dataValues.phone,
        expiresAt: new Date(Date.now() + 1000 * 60 * 5),
      },
      { transaction },
    );

    await transaction.commit();

    await sendEmail({
      to: userRecord.dataValues.email,
      subject: "Reset your password",
      template: "auth/forgot-password",
      context: {
        name: userRecord.dataValues.name,
        otp: otpRecord.dataValues.otp,
      },
      attachments: [],
    });

    res.status(200).json({ message: "An email has been sent to reset your password" });
  } catch (error) {
    await transaction.rollback();
    next(error);
  }
};

const forgotPasswordOtpVerificationV1 = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  const transaction = await sequelize.transaction();

  try {
    const { email, otp } = req.body;

    if (!otp) {
      return throwCustomError(400, "OTP is required");
    }

    if (!email) {
      return throwCustomError(400, "Email is required");
    }

    const query: Record<string, unknown> = {
      otp,
    };

    if (email) {
      query.email = email.trim().toLowerCase();
    }

    const otpRecord = await Otp.findOne({ where: query, transaction });

    if (!otpRecord) {
      return throwCustomError(400, "Invalid OTP");
    }

    if (otpRecord.dataValues.expiresAt < new Date()) {
      return throwCustomError(400, "OTP expired");
    }

    const userRecord = await User.findOne({
      where: { email: otpRecord.dataValues.email, isVerified: true },
      transaction,
    });

    if (!userRecord) {
      return throwCustomError(400, "Email record not found or not verified");
    }

    await transaction.commit();

    const token = generateToken({ id: userRecord.dataValues.id });

    res.status(200).json({
      message: "OTP verified successfully",
      data: {
        token,
      },
    });
  } catch (error) {
    await transaction.rollback();
    next(error);
  }
};

const forgotPasswordOtpResendV1 = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  const transaction = await sequelize.transaction();

  try {
    const { email } = req.body;

    if (!email) {
      return throwCustomError(400, "Email is required");
    }

    const query: Record<string, unknown> = {
      isVerified: true,
      email: email.trim().toLowerCase(),
    };

    const userRecord = await User.findOne({ where: query, transaction });

    if (!userRecord) {
      return throwCustomError(400, "User record not found or not verified");
    }

    await Otp.destroy({ where: { email: userRecord.dataValues.email }, transaction });

    const otp = Math.floor(100000 + Math.random() * 900000).toString();

    const otpRecord = await Otp.create(
      {
        otp,
        email: userRecord.dataValues.email,
        phone: userRecord.dataValues.phone,
        expiresAt: new Date(Date.now() + 1000 * 60 * 5),
      },
      { transaction },
    );

    await transaction.commit();

    await sendEmail({
      to: userRecord.dataValues.email,
      subject: "Reset your password",
      template: "auth/forgot-password",
      context: {
        name: userRecord.dataValues.name,
        otp: otpRecord.dataValues.otp,
      },
      attachments: [],
    });

    res.status(200).json({ message: "An email has been sent to reset your password" });
  } catch (error) {
    await transaction.rollback();
    next(error);
  }
};

const setNewPasswordV1 = async (
  req: Request & { user?: { id: string } },
  res: Response,
  next: NextFunction,
): Promise<void> => {
  const transaction = await sequelize.transaction();

  try {
    const { password, confirmPassword } = req.body;

    if (!req.user) {
      return throwCustomError(401, "Unauthorized");
    }

    const { id } = req.user;

    if (!password || !confirmPassword) {
      return throwCustomError(400, "Password and confirm password are required");
    }

    if (password !== confirmPassword) {
      return throwCustomError(400, "Passwords do not match");
    }

    const userRecord = await User.findOne({ where: { id }, transaction });

    if (!userRecord) {
      return throwCustomError(400, "User record not found");
    }

    await userRecord.update({ password: hashPassword(password) }, { transaction });

    await transaction.commit();

    res.status(200).json({ message: "Password updated successfully" });
  } catch (error) {
    await transaction.rollback();
    next(error);
  }
};

export {
  forgotPasswordV1,
  forgotPasswordOtpVerificationV1,
  forgotPasswordOtpResendV1,
  setNewPasswordV1,
};
