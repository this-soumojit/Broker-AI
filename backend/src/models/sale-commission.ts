import { DataTypes } from "sequelize";

import { sequelize } from "../config/db";
import { PAYMENT_METHODS } from "../constants";

const SaleCommission = sequelize.define(
  "SaleCommission",
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
    salePaymentId: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: "sale_payments",
        key: "id",
      },
    },
  },
  {
    tableName: "sale_commissions",
    timestamps: true,
  },
);

export { SaleCommission };
