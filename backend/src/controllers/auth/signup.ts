import { Request, Response, NextFunction } from "express";

import { sequelize } from "../../config/db";
import { User, Otp } from "../../models";
import { sendEmail } from "../../services/smtp";
import { hashPassword } from "../../utils/bcrypt";
import { throwCustomError } from "../../utils/error";
import { generateToken } from "../../utils/jwt";

const signupV1 = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  const transaction = await sequelize.transaction();

  try {
    const { email, name, phone, password } = req.body;

    const user = await User.findOne({ where: { email: email.toLowerCase() }, transaction });

    if (user) {
      return throwCustomError(400, "Email already in use by another account");
    }

    const userRecord = await User.create(
      {
        email,
        name,
        phone,
        password: hashPassword(password),
      },
      { transaction },
    );

    const otp = Math.floor(100000 + Math.random() * 900000).toString();

    await Otp.create(
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
      subject: "Verify your email",
      template: "auth/signup",
      context: {
        name: userRecord.dataValues.name,
        otp,
      },
      attachments: [],
    });

    res
      .status(201)
      .json({ message: "Signup successful, please check your email for verification" });
  } catch (error) {
    await transaction.rollback();
    next(error);
  }
};

const signupOtpVerificationV1 = async (
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
      where: { email: otpRecord.dataValues.email },
      transaction,
    });

    if (!userRecord) {
      return throwCustomError(400, "Email record not found");
    }

    if (userRecord.dataValues.isVerified) {
      return throwCustomError(400, "Email already verified");
    }

    await userRecord.update(
      {
        isVerified: true,
      },
      { transaction },
    );

    await otpRecord.destroy({ transaction });

    await transaction.commit();

    const token = generateToken({ id: userRecord.dataValues.id });

    res.status(200).json({
      message: "Email verified successfully",
      data: {
        token,
      },
    });
  } catch (error) {
    await transaction.rollback();
    next(error);
  }
};

const signupOtpResendV1 = async (
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

    const query: Record<string, unknown> = {};

    if (email) {
      query.email = email.trim().toLowerCase();
    }

    const userRecord = await User.findOne({ where: query, transaction });

    if (!userRecord) {
      return throwCustomError(400, "User record not found");
    }

    if (userRecord.dataValues.isVerified) {
      return throwCustomError(400, "Email already verified");
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

    await sendEmail({
      to: userRecord.dataValues.email,
      subject: "Verify your email",
      template: "auth/signup",
      context: {
        name: userRecord.dataValues.name,
        otp: otpRecord.dataValues.otp,
      },
      attachments: [],
    });

    await transaction.commit();
    res.status(200).json({ message: "OTP sent successfully" });
  } catch (error) {
    await transaction.rollback();
    next(error);
  }
};

export { signupV1, signupOtpVerificationV1, signupOtpResendV1 };
