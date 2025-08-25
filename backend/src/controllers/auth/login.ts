import { Request, Response, NextFunction } from "express";

import { User } from "../../models";
import { comparePassword } from "../../utils/bcrypt";
import { throwCustomError } from "../../utils/error";
import { generateToken } from "../../utils/jwt";

const loginV1 = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return throwCustomError(400, "Email and password are required");
    }

    const user = await User.findOne({ where: { email: email.toLowerCase() } });

    if (!user) {
      return throwCustomError(400, "Invalid email or password");
    }

    const isPasswordValid = comparePassword(password, user.dataValues.password);

    if (!isPasswordValid) {
      return throwCustomError(400, "Invalid email or password");
    }

    const token = generateToken({ id: user.dataValues.id });

    res.status(200).json({
      message: "Login successful",
      data: {
        token,
      },
    });
  } catch (error) {
    next(error);
  }
};

export { loginV1 };
