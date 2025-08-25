import { Request, Response, NextFunction } from "express";

import { Book } from "../../models";
import { throwCustomError } from "../../utils/error";

const deleteV1 = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { bookId } = req.params;

    const bookRecord = await Book.findByPk(bookId);

    if (!bookRecord) {
      return throwCustomError(404, "Book not found");
    }

    await bookRecord.destroy();

    res.status(204).send();
  } catch (error) {
    next(error);
  }
};

export { deleteV1 };
