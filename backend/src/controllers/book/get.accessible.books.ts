import { Request, Response, NextFunction } from "express";
import { Book, UserSubscription } from "../../models";
import { Op } from "sequelize";

export const getAccessibleBooksV1 = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const { userId } = req.params;

    // Get user's subscription plan
    const userSubscription = await UserSubscription.findOne({
      where: { userId, status: "ACTIVE" },
      order: [["createdAt", "DESC"]],
    });

    const planName = userSubscription?.dataValues?.planName || "Basic";

    // Get all books ordered by last accessed/updated
    const books = await Book.findAll({
      where: { userId },
      order: [["updatedAt", "DESC"]],
    });

    // For basic plan, only the most recent book is unlocked
    // For professional/enterprise, all books are unlocked
    const accessibleBooks = books.map((book, index) => ({
      ...book.dataValues,
      isLocked: planName === "Basic" && index > 0, // Lock all except the first/most recent book for basic plan
    }));

    res.status(200).json({
      message: "Accessible books retrieved successfully",
      data: {
        books: accessibleBooks,
        planName,
        currentCount: books.length,
        unlockedCount: planName === "Basic" ? Math.min(1, books.length) : books.length,
      },
    });
  } catch (error) {
    next(error);
  }
};
