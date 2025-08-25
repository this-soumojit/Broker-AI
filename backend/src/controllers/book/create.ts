import { Request, Response, NextFunction } from "express";

import { Book } from "../../models";
import { throwCustomError } from "../../utils/error";

const createV1 = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { userId } = req.params;

    const { name, startDate, endDate, openingBalance, closingBalance, notes, status } = req.body;

    const query: Record<string, string | undefined> = {
      userId,
      name: name.trim(),
      startDate,
      endDate,
    };

    const bookRecord = await Book.findOne({
      where: query,
    });

    if (bookRecord) {
      return throwCustomError(400, "Book with same details already exists");
    }

    const newBookRecord = await Book.create({
      name,
      startDate,
      endDate,
      openingBalance,
      closingBalance,
      notes,
      status,
      userId,
    });

    if (!newBookRecord) {
      return throwCustomError(500, "Failed to create book");
    }

    res.status(201).json({
      message: "Book created successfully",
      data: newBookRecord.dataValues,
    });
  } catch (error) {
    next(error);
  }
};

export { createV1 };
