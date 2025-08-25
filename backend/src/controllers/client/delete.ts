import { Request, Response, NextFunction } from "express";

import { Client } from "../../models";
import { throwCustomError } from "../../utils/error";

const deleteV1 = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { clientId } = req.params;

    const clientRecord = await Client.findByPk(clientId);

    if (!clientRecord) {
      return throwCustomError(404, "Client not found");
    }

    await clientRecord.destroy();

    res.status(204).send();
  } catch (error) {
    next(error);
  }
};

export { deleteV1 };
