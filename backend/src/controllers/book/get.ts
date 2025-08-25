import { Request, Response, NextFunction } from "express";
import { Op } from "sequelize";

import { Book } from "../../models";

const getV1 = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { q } = req.query;
    const { userId } = req.params;

    const where: Record<string, unknown> = {
      userId,
    };

    if (q) {
      where.name = {
        [Op.iLike]: `%${q}%`,
      };
    }

    const bookRecords = await Book.findAll({
      where,
      attributes: {
        exclude: ["userId"],
      },
      order: [["createdAt", "DESC"]],
    });

    res.status(200).json({
      message: "Books retrieved successfully",
      data: bookRecords.map((record) => record.dataValues),
    });
  } catch (error) {
    next(error);
  }
};

export { getV1 };
