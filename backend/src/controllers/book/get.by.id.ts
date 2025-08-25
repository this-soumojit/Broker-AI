import { Request, Response, NextFunction } from "express";

import { Book } from "../../models";
import { throwCustomError } from "../../utils/error";

const getByIdV1 = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { bookId } = req.params;

    const bookRecord = await Book.findByPk(bookId, {
      attributes: {
        exclude: ["userId"],
      },
    });

    if (!bookRecord) {
      return throwCustomError(404, "Book not found");
    }

    res.status(200).json({
      message: "Book retrieved successfully",
      data: bookRecord.dataValues,
    });
  } catch (error) {
    next(error);
  }
};

export { getByIdV1 };
