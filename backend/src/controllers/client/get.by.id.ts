import { Request, Response, NextFunction } from "express";

import { Client } from "../../models";
import { throwCustomError } from "../../utils/error";

const getByIdV1 = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { clientId } = req.params;

    const clientRecord = await Client.findByPk(clientId, {
      attributes: {
        exclude: ["userId"],
      },
    });

    if (!clientRecord) {
      return throwCustomError(404, "Client not found");
    }

    res.status(200).json({
      message: "Client retrieved successfully",
      data: clientRecord.dataValues,
    });
  } catch (error) {
    next(error);
  }
};

export { getByIdV1 };
