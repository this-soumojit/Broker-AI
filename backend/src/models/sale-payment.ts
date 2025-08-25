import { DataTypes } from "sequelize";

import { sequelize } from "../config/db";
import { PAYMENT_METHODS } from "../constants";

const SalePayment = sequelize.define(
  "SalePayment",
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    amount: {
      type: DataTypes.FLOAT,
      allowNull: false,
    },
    paymentMethod: {
      type: DataTypes.ENUM(...Object.values(PAYMENT_METHODS)),
      allowNull: false,
      defaultValue: PAYMENT_METHODS.CASH,
    },
    referenceNumber: {
      type: DataTypes.STRING,
      allowNull: true,
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
    tableName: "sale_payments",
    timestamps: true,
  },
);

export { SalePayment };
