import { Request, Response, NextFunction } from "express";
import { Op } from "sequelize";

import { Client } from "../../models";

const getV1 = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { q } = req.query;
    const { userId } = req.params;

    const where: Record<string | symbol, unknown> = {
      userId,
    };

    if (q) {
      where[Op.or] = [
        { name: { [Op.iLike]: `%${q}%` } },
        { gstin: { [Op.iLike]: `%${q}%` } },
        { phone: { [Op.iLike]: `%${q}%` } },
        { email: { [Op.iLike]: `%${q}%` } },
      ];
    }

    const clientRecords = await Client.findAll({
      where,
      attributes: {
        exclude: ["userId"],
      },
    });

    res.status(200).json({
      message: "Clients retrieved successfully",
      data: clientRecords.map((record) => record.dataValues),
    });
  } catch (error) {
    next(error);
  }
};

export { getV1 };
