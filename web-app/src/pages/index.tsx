import { Routes, Route } from "react-router-dom";

import Layout from "@/components/layout";
import ProtectedRoute from "@/pages/ProtectedRoute";
import AuthLayout from "@/pages/AuthLayout";
import NotFound from "@/pages/NotFound";
import RootRedirect from "@/pages/RootRedirect";
import LoginPage from "@/pages/auth/login";
import SignUpPage from "@/pages/auth/sign-up";
import ForgotPasswordPage from "@/pages/auth/forgot-password";
import DashboardPage from "@/pages/app/dashboard";
import BooksPage from "@/pages/app/books";
import NewBookPage from "@/pages/app/books/new";
import EditBookPage from "@/pages/app/books/edit";
import ClientsPage from "@/pages/app/clients";
import NewClientPage from "@/pages/app/clients/new";
import ClientDetailsPage from "@/pages/app/clients/details";
import EditClientPage from "@/pages/app/clients/edit";
import SalesPage from "@/pages/app/sale";
import NewSalePage from "@/pages/app/sale/new";
import EditSalePage from "@/pages/app/sale/edit";
import UpgradePlans from "@/pages/app/UpgradePlans";
import ProfilePage from "@/pages/app/profile"; // Adjust if it's elsewhere
import PaymentRemindersPage from "@/pages/app/payment-reminders";

import PaymentSuccess from "@/pages/app/payment/PaymentSuccess";

import ViewSalePage from "./app/sale/view-sale";
import GoodsReturnPage from "./app/goods-return";
import SalePaymentPage from "./app/sale-payment";
import SaleInvoicePage from "./app/sale/sale-invoice";

export default function Index() {
  return (
    <Routes>
      <Route path="/" element={<RootRedirect />} />

      {/* Payment success route - outside protected routes for accessibility */}
      <Route path="/payment/success" element={<PaymentSuccess />} />

      <Route path="/auth" element={<AuthLayout />}>
        <Route path="login" element={<LoginPage />} />
        <Route path="sign-up" element={<SignUpPage />} />
        <Route path="forgot-password" element={<ForgotPasswordPage />} />
      </Route>

      <Route
        path="/:userId/*"
        element={
          <ProtectedRoute>
            <Layout />
          </ProtectedRoute>
        }
      >
        <Route path="dashboard" element={<DashboardPage />} />
        <Route path="books" element={<BooksPage />} />
        <Route path="books/new" element={<NewBookPage />} />
        <Route path="books/:bookId" element={<EditBookPage />} />
        <Route path="books/:bookId/sales" element={<SalesPage />} />
        <Route path="books/:bookId/sales/new" element={<NewSalePage />} />
        <Route path="books/:bookId/sales/:saleId" element={<EditSalePage />} />
        <Route
          path="books/:bookId/sales/:saleId/view"
          element={<ViewSalePage />}
        />
        <Route
          path="books/:bookId/sales/:saleId/payments"
          element={<SalePaymentPage />}
        />
        <Route
          path="books/:bookId/sales/:saleId/goods-return"
          element={<GoodsReturnPage />}
        />
        <Route
          path="books/:bookId/sales/:saleId/invoice"
          element={<SaleInvoicePage />}
        />
        <Route path="clients" element={<ClientsPage />} />
        <Route path="clients/new" element={<NewClientPage />} />
        <Route path="clients/:clientId" element={<ClientDetailsPage />} />
        <Route path="clients/:clientId/edit" element={<EditClientPage />} />
        <Route path="payment-reminders" element={<PaymentRemindersPage />} />
        <Route path="upgrade" element={<UpgradePlans />} />
        <Route path="profile" element={<ProfilePage />} />
        <Route path="*" element={<NotFound />} />
      </Route>

      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}
