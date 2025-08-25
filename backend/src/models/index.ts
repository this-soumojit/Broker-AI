import { Book } from "./book";
import { Client } from "./client";
import { GoodsReturn } from "./goods.return";
import { GoodsReturnProduct } from "./goods.return.product";
import { Otp } from "./otp";
import { Product } from "./product";
import { Sale } from "./sale";
import { SaleCommission } from "./sale-commission";
import { SalePayment } from "./sale-payment";
import { User } from "./user";
import { UserSubscription } from "./user-subscription";

/*
    Client and User associations start
*/

Client.belongsTo(User, { foreignKey: "userId", onDelete: "CASCADE" });
User.hasMany(Client, { foreignKey: "userId", onDelete: "CASCADE" });

/*
    Client and User associations end
*/

/*
    Book and User associations start
*/

Book.belongsTo(User, { foreignKey: "userId", onDelete: "CASCADE" });
User.hasMany(Book, { foreignKey: "userId", onDelete: "CASCADE" });

/*
    Book and User associations end
*/

/*
    Sale and Book associations start
*/

Sale.belongsTo(Book, { foreignKey: "bookId", onDelete: "CASCADE" });
Book.hasMany(Sale, { foreignKey: "bookId", onDelete: "CASCADE" });

/*
    Sale and Book associations end
*/

/*
    Sale and Client associations start
*/

Sale.belongsTo(Client, { foreignKey: "sellerId", as: "seller", onDelete: "CASCADE" });
Client.hasMany(Sale, { foreignKey: "sellerId", as: "saleAsSeller", onDelete: "CASCADE" });

Sale.belongsTo(Client, { foreignKey: "buyerId", as: "buyer", onDelete: "CASCADE" });
Client.hasMany(Sale, { foreignKey: "buyerId", as: "saleAsBuyer", onDelete: "CASCADE" });

/*
      Sale and Client associations end
*/

/*
    Product and Sale associations start
*/

Product.belongsTo(Sale, { foreignKey: "saleId", onDelete: "CASCADE" });
Sale.hasMany(Product, { foreignKey: "saleId", onDelete: "CASCADE" });

/*
    Product and Sale associations end
*/

/*
    GoodsReturn and Sale associations start
*/

GoodsReturn.belongsTo(Sale, { foreignKey: "saleId", onDelete: "CASCADE" });
Sale.hasMany(GoodsReturn, { foreignKey: "saleId", onDelete: "CASCADE" });

/*
    GoodsReturn and Sale associations end
*/

/*
    GoodsReturnProduct and GoodsReturn associations start
*/

GoodsReturnProduct.belongsTo(GoodsReturn, { foreignKey: "goodsReturnId", onDelete: "CASCADE" });
GoodsReturn.hasMany(GoodsReturnProduct, { foreignKey: "goodsReturnId", onDelete: "CASCADE" });

GoodsReturnProduct.belongsTo(Product, { foreignKey: "productId", onDelete: "CASCADE" });
Product.hasMany(GoodsReturnProduct, { foreignKey: "productId", onDelete: "CASCADE" });

/*
    GoodsReturnProduct and GoodsReturn associations end
*/

/*
    SalePayment and Sale associations start
*/

SalePayment.belongsTo(Sale, { foreignKey: "saleId", onDelete: "CASCADE" });
Sale.hasMany(SalePayment, { foreignKey: "saleId", onDelete: "CASCADE" });

/*
    SalePayment and Sale associations end
*/

/*
    SaleCommission and Sale associations start
*/

SaleCommission.belongsTo(Sale, { foreignKey: "saleId", onDelete: "CASCADE" });
Sale.hasMany(SaleCommission, { foreignKey: "saleId", onDelete: "CASCADE" });

/*
    SaleCommission and Sale associations end
*/

/*
    User and UserSubscription associations start
*/
User.hasMany(UserSubscription, { foreignKey: "userId", onDelete: "CASCADE" });
UserSubscription.belongsTo(User, { foreignKey: "userId", onDelete: "CASCADE" });

/*
    User and UserSubscription associations end
*/

export {
  Book,
  Client,
  GoodsReturn,
  GoodsReturnProduct,
  Otp,
  Product,
  Sale,
  SaleCommission,
  SalePayment,
  User,
  UserSubscription,
};
