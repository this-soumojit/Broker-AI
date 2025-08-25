import { DataTypes } from "sequelize";
import { sequelize } from "../../config/db";

const UserSubscription = sequelize.define(
  "UserSubscription",
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    userId: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: "users",
        key: "id",
      },
    },
    planName: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    planPrice: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      defaultValue: 0,
    },
    duration: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 1, // 1 month
    },
    orderId: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
    },
    status: {
      type: DataTypes.ENUM("PENDING", "ACTIVE", "EXPIRED", "CANCELLED", "UPGRADED", "DOWNGRADED"),
      allowNull: false,
      defaultValue: "PENDING",
    },
    paymentStatus: {
      type: DataTypes.ENUM("PENDING", "COMPLETED", "FAILED", "REFUNDED"),
      allowNull: false,
      defaultValue: "PENDING",
    },
    startDate: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    endDate: {
      type: DataTypes.DATE,
      allowNull: true,
    },
  },
  {
    tableName: "user_subscriptions",
    timestamps: true,
  },
);

export { UserSubscription };
