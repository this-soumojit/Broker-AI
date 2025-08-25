import { DataTypes } from "sequelize";

import { sequelize } from "../config/db";

const Product = sequelize.define(
  "Product",
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
    quantity: {
      type: DataTypes.FLOAT,
      allowNull: false,
      defaultValue: 0,
    },
    unit: {
      type: DataTypes.STRING,
      allowNull: false,
      defaultValue: "Nos",
    },
    rate: {
      type: DataTypes.FLOAT,
      allowNull: false,
      defaultValue: 0,
    },
    gstRate: {
      type: DataTypes.FLOAT,
      allowNull: false,
      defaultValue: 0,
    },
    discountRate: {
      type: DataTypes.FLOAT,
      allowNull: false,
      defaultValue: 0,
    },
    grossAmount: {
      type: DataTypes.FLOAT,
      allowNull: false,
      defaultValue: 0,
    },
    discountAmount: {
      type: DataTypes.FLOAT,
      allowNull: false,
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
      allowNull: true,
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
    tableName: "products",
    timestamps: true,
  },
);

export { Product };
