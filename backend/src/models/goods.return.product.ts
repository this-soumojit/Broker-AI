import { DataTypes } from "sequelize";

import { sequelize } from "../config/db";

const GoodsReturnProduct = sequelize.define(
  "GoodsReturnProduct",
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    quantity: {
      type: DataTypes.FLOAT,
      allowNull: false,
      defaultValue: 0,
    },
    productId: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: "products",
        key: "id",
      },
    },
    goodsReturnId: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: "goods_returns",
        key: "id",
      },
    },
  },
  {
    tableName: "goods_return_products",
    timestamps: true,
  },
);

export { GoodsReturnProduct };
