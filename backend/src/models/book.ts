import { DataTypes } from "sequelize";

import { sequelize } from "../config/db";
import { BOOK_STATUSES } from "../constants";

const Book = sequelize.define(
  "Book",
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    startDate: {
      type: DataTypes.DATE,
      allowNull: false,
    },
    endDate: {
      type: DataTypes.DATE,
      allowNull: false,
    },
    openingBalance: {
      type: DataTypes.FLOAT,
      allowNull: false,
      defaultValue: 0,
    },
    closingBalance: {
      type: DataTypes.FLOAT,
      allowNull: false,
      defaultValue: 0,
    },
    notes: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    status: {
      type: DataTypes.ENUM(...Object.values(BOOK_STATUSES)),
      allowNull: false,
      defaultValue: BOOK_STATUSES.OPEN,
    },
    userId: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: "users",
        key: "id",
      },
    },
  },
  {
    tableName: "books",
    timestamps: true,
  },
);

export { Book };
