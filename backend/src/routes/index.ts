import { Router } from "express";

import auth from "./auth";
import user from "./user";
import { validateExistenceV1 } from "../middlewares/existence";
import { User, Book, Sale, GoodsReturn, SalePayment } from "../models";
import book from "./book";
import client from "./client";
import goodsReturn from "./goods-return";
import goodsReturnProduct from "./goods-return-product";
import product from "./product";
import sale from "./sale";
import saleCommission from "./sale-commission";
import salePayment from "./sale-payment";
import paymentPlan from "./payment-plan";
import invoiceMail from "./invoice-mail";
import { paymentReminderRoutes } from "./payment-reminder";
import debug from "./debug";
import { dashboardRouter } from "./dashboard";
import invoiceExtract from "./invoice-extract";
import whatsapp from "./whatsapp";

const router = Router({ mergeParams: true });

router.param("userId", validateExistenceV1(User));
router.param("bookId", validateExistenceV1(Book));
router.param("saleId", validateExistenceV1(Sale));
router.param("goodsReturnId", validateExistenceV1(GoodsReturn));
router.param("salePaymentId", validateExistenceV1(SalePayment));

router.use("/auth", auth);
router.use("/users", user);
router.use("/users/:userId/books", book);
router.use("/users/:userId/books/:bookId/sales", sale);
router.use("/users/:userId/clients", client);
router.use("/users/:userId/books/:bookId/sales/:saleId/products", product);
router.use("/users/:userId/books/:bookId/sales/:saleId/goods-returns", goodsReturn);
router.use(
  "/users/:userId/books/:bookId/sales/:saleId/goods-returns/:goodsReturnId/products",
  goodsReturnProduct,
);
router.use("/users/:userId/books/:bookId/sales/:saleId/payments", salePayment);
router.use(
  "/users/:userId/books/:bookId/sales/:saleId/payments/:salePaymentId/commissions",
  saleCommission,
);
router.use("/users/:userId/subscriptions", paymentPlan);
router.use("/users/:userId/payment-reminders", paymentReminderRoutes);
router.use("/invoice-mail", invoiceMail);
router.use("/debug", debug);
router.use("/users", dashboardRouter);
router.use("/whatsapp", whatsapp);
router.use("/invoice-extract", invoiceExtract);

export default router;
