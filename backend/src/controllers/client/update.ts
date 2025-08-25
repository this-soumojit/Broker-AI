import { Request, Response, NextFunction } from "express";

import { Client } from "../../models";
import { throwCustomError } from "../../utils/error";

const updateV1 = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { userId, clientId } = req.params;

    const { name, email, phone, pan, gstin, address, notes } = req.body;

    const clientRecord = await Client.findByPk(clientId, {
      attributes: {
        exclude: ["userId"],
      },
    });

    if (!clientRecord) {
      return throwCustomError(404, "Client not found");
    }

    if (Object.prototype.hasOwnProperty.call(req.body, "name")) {
      const query: Record<string, string | undefined> = {
        name,
        phone: clientRecord.dataValues.phone,
        pan: clientRecord.dataValues.pan,
        userId,
      };

      if (phone) {
        query.phone = phone.trim();
      }

      if (pan) {
        query.pan = pan.trim();
      }

      const clientAlreadyExists = await Client.findOne({
        where: query,
      });

      if (clientAlreadyExists) {
        return throwCustomError(400, "Client name already exists");
      }

      clientRecord.dataValues.name = name;
    }

    const updatedClientRecord = await Client.update(
      {
        name,
        email,
        phone,
        pan,
        gstin,
        address,
        notes,
      },
      { where: { id: clientId }, returning: true },
    );

    res.status(200).json({
      message: "Client updated successfully",
      data: updatedClientRecord[1][0]?.dataValues,
    });
  } catch (error) {
    next(error);
  }
};

export { updateV1 };
