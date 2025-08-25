import { DataTypes } from "sequelize";

import { sequelize } from "../config/db";

const GoodsReturn = sequelize.define(
  "GoodsReturn",
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    grossAmount: {
      type: DataTypes.FLOAT,
      allowNull: false,
      defaultValue: 0,
    },
    discountAmount: {
      type: DataTypes.FLOAT,
      allowNull: false,
      defaultValue: 0,
    },
    taxAmount: {
      type: DataTypes.FLOAT,
      allowNull: false,
      defaultValue: 0,
    },
    netAmount: {
      type: DataTypes.FLOAT,
      allowNull: false,
      defaultValue: 0,
    },
    notes: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    saleId: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: "sales",
        key: "id",
      },
    },
  },
  {
    tableName: "goods_returns",
    timestamps: true,
  },
);

export { GoodsReturn };
