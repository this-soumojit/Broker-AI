import { DataTypes } from "sequelize";

import { sequelize } from "../config/db";
import { SALE_STATUSES } from "../constants";

const Sale = sequelize.define(
  "Sale",
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    lorryReceiptNumber: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    lorryReceiptDate: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    caseNumber: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    weight: {
      type: DataTypes.FLOAT,
      allowNull: true,
    },
    freight: {
      type: DataTypes.FLOAT,
      allowNull: true,
    },
    transportName: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    transportNumber: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    transportStation: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    eWayBillNumber: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    eWayBillDate: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    challanNumber: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    challanDate: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    invoiceNumber: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    invoiceDate: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    invoiceGrossAmount: {
      type: DataTypes.FLOAT,
      allowNull: true,
    },
    invoiceDiscountAmount: {
      type: DataTypes.FLOAT,
      allowNull: true,
    },
    invoiceTaxAmount: {
      type: DataTypes.FLOAT,
      allowNull: true,
    },
    invoiceNetAmount: {
      type: DataTypes.FLOAT,
      allowNull: true,
    },
    commissionRate: {
      type: DataTypes.FLOAT,
      allowNull: true,
    },
    invoiceDueDays: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 45,
    },
    status: {
      type: DataTypes.ENUM(...Object.values(SALE_STATUSES)),
      allowNull: false,
      defaultValue: SALE_STATUSES.PENDING,
    },
    notes: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    sellerId: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: "clients",
        key: "id",
      },
    },
    buyerId: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: "clients",
        key: "id",
      },
    },
    bookId: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: "books",
        key: "id",
      },
    },
  },
  {
    tableName: "sales",
    timestamps: true,
  },
);

export { Sale };
