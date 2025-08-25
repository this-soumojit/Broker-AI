import { Request, Response, NextFunction } from "express";

import { Book } from "../../models";
import { throwCustomError } from "../../utils/error";

const updateV1 = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { userId, bookId } = req.params;

    const { name, startDate, endDate, openingBalance, closingBalance, notes, status } = req.body;

    const bookRecord = await Book.findByPk(bookId, {
      attributes: {
        exclude: ["userId"],
      },
    });

    if (!bookRecord) {
      return throwCustomError(404, "Book not found");
    }

    if (name) {
      const query: Record<string, string | undefined> = {
        name,
        userId,
      };

      if (startDate) {
        query.startDate = startDate;
      }

      if (endDate) {
        query.endDate = endDate;
      }

      const bookAlreadyExists = await Book.findOne({
        where: query,
      });

      if (bookAlreadyExists && bookAlreadyExists.dataValues.id !== bookId) {
        return throwCustomError(400, "Book with same details already exists");
      }
    }

    await bookRecord.update({
      name,
      startDate,
      endDate,
      openingBalance,
      closingBalance,
      notes,
      status,
    });

    res.status(200).json({
      message: "Book updated successfully",
      data: bookRecord.dataValues,
    });
  } catch (error) {
    next(error);
  }
};

export { updateV1 };
