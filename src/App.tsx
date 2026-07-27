import { BrowserRouter, Navigate, Outlet, Route, Routes } from "react-router-dom"
import { AuthProvider } from "@/context/auth-context"
import { ProtectedRoute } from "@/components/auth/protected-route"
import { LoginPage } from "@/components/auth/login-page"
import { DashboardLayout } from "@/components/layout/dashboard-layout"
import { DashboardPage } from "@/components/dashboard/dashboard-page"
import { MarketplacePage } from "@/components/marketplace/marketplace-page"
import { ProductsPage } from "@/components/products/products-page"
import { AddProductPage } from "@/components/products/add-product-page"
import { EditProductPage } from "@/components/products/edit-product-page"
import { UploadHistoryPage } from "@/components/upload-history/upload-history-page"
import { OrdersPage } from "@/components/orders/orders-page"
import { AnalyticsPage } from "@/components/analytics/analytics-page"
import { SettingsPage } from "@/components/settings/settings-page"

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route element={<ProtectedRoute />}>
            <Route
              element={
                <DashboardLayout>
                  <Outlet />
                </DashboardLayout>
              }
            >
              <Route path="/" element={<DashboardPage />} />
              <Route path="/products" element={<ProductsPage />} />
              <Route path="/products/add" element={<AddProductPage />} />
              <Route
                path="/products/:productId/edit"
                element={<EditProductPage />}
              />
              <Route path="/orders" element={<OrdersPage />} />
              <Route path="/marketplace" element={<MarketplacePage />} />
              <Route path="/upload-history" element={<UploadHistoryPage />} />
              <Route path="/analytics" element={<AnalyticsPage />} />
              <Route path="/settings" element={<SettingsPage />} />
            </Route>
          </Route>
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  )
}
