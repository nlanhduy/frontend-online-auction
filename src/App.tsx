import { Navigate, Route, Routes } from 'react-router-dom'

import { GuestRoute } from '@/components/auth/GuestRoute'
import { ProtectedRoute } from '@/components/auth/ProtectedRoute'

import { Layout } from './components/layout/Layout'
import { CategoryManager } from './pages/admin/category/CategoryManagementPage'
import ProductManageMentPage from './pages/admin/product/ProductManagementPage'
import RequestToSellerList from './pages/admin/request-to-sellers/RequestToSellerPage'
import ForgotPasswordPage from './pages/auth/ForgotPasswordPage'
import LoginPage from './pages/auth/LoginPage'
import RegisterPage from './pages/auth/RegisterPage'
import ActiveBidsPage from './pages/bidder/ActiveBidsPage'
import RatingWonAuctionPage from './pages/bidder/RatingWonAuctionPage'
import WonAuctionsPage from './pages/bidder/WonAuctionsPage'
import CategoryPage from './pages/category/CategoryPage'
import Homepage from './pages/homepage/Homepage'
import OrderFulfillmentPage from './pages/order/OrderFulfillmentPage'
import PaymentCancelPage from './pages/order/PaymentCancelPage'
import PaymentSuccessPage from './pages/order/PaymentSuccessPage'
import ProductDetail from './pages/product/ProductDetailPage'
import RatingPage from './pages/rating/RatingPage'
import SearchPage from './pages/search/SearchPage'
import CompletedAuctionsPage from './pages/seller/auction/CompletedAuctionsPage'
import RatingCompletedAuctionPage from './pages/seller/auction/RatingCompletedAuctionPage'
import CreateProductPage from './pages/seller/product/CreateProductPage'
import EditProductPage from './pages/seller/product/EditProductPage'
import SellerProductsPage from './pages/seller/product/SellerProductsPage'
import { SettingsPage } from './pages/setting/SettingPage'
import PaymentDemoPage from './pages/test/PaymentDemoPage'
import PaymentTestPage from './pages/test/PaymentTestPage'
import WatchListPage from './pages/watchList/WatchListPage'
import { UserRole } from './types/auth.types'
import { SellerOrderConfirmationPage } from './pages/seller/order/SellerOrderConfirmationPage'

function App() {
  return (
    <Routes>
      <Route
        path='/login'
        element={
          <GuestRoute>
            <LoginPage />
          </GuestRoute>
        }
      />
      <Route
        path='/register'
        element={
          <GuestRoute>
            <RegisterPage />
          </GuestRoute>
        }
      />

      <Route
        path='/forgot-password'
        element={
          <GuestRoute>
            <ForgotPasswordPage />
          </GuestRoute>
        }
      />

      {/* Public Routes with appropriate layout */}
      <Route element={<Layout />}>
        <Route path='/' element={<Homepage />} />
        <Route path='/category/:categoryId' element={<CategoryPage />} />
        <Route path='/search' element={<SearchPage />} />
        <Route path='/product/:productId' element={<ProductDetail />} />

        {/* Payment Routes */}
        <Route
          path='/payment/success'
          element={
            <ProtectedRoute allowedRoles={[UserRole.Bidder, UserRole.Seller]}>
              <PaymentSuccessPage />
            </ProtectedRoute>
          }
        />
        <Route
          path='/payment/cancel'
          element={
            <ProtectedRoute allowedRoles={[UserRole.Bidder, UserRole.Seller]}>
              <PaymentCancelPage />
            </ProtectedRoute>
          }
        />

        {/* Order Fulfillment Route */}
        <Route
          path='/order/:orderId'
          element={
            <ProtectedRoute allowedRoles={[UserRole.Bidder, UserRole.Seller]}>
              <OrderFulfillmentPage />
            </ProtectedRoute>
          }
        />

        {/* Test Route - Remove in production */}
        <Route path='/test/payment' element={<PaymentTestPage />} />
        <Route path='/demo/payment' element={<PaymentDemoPage />} />

        {/* Bidder Routes */}
        <Route
          path='profile'
          element={
            <ProtectedRoute
              allowedRoles={[UserRole.Bidder, UserRole.Seller, UserRole.Admin]}>
              <RatingPage />
            </ProtectedRoute>
          }
        />
        <Route
          path='watchlist'
          element={
            <ProtectedRoute allowedRoles={[UserRole.Bidder, UserRole.Seller]}>
              <WatchListPage />
            </ProtectedRoute>
          }
        />
        <Route
          path='bidder/active-bids'
          element={
            <ProtectedRoute allowedRoles={[UserRole.Bidder]}>
              <ActiveBidsPage />
            </ProtectedRoute>
          }
        />
        <Route
          path='bidder/won-auctions'
          element={
            <ProtectedRoute allowedRoles={[UserRole.Bidder]}>
              <WonAuctionsPage />
            </ProtectedRoute>
          }
        />
        <Route
          path='bidder/won-auctions/:id/rating'
          element={
            <ProtectedRoute allowedRoles={[UserRole.Bidder]}>
              <RatingWonAuctionPage />
            </ProtectedRoute>
          }
        />

        <Route
          path='settings'
          element={
            <ProtectedRoute
              allowedRoles={[UserRole.Bidder, UserRole.Seller, UserRole.Admin]}>
              <SettingsPage />
            </ProtectedRoute>
          }
        />

        {/* Seller Routes */}
        <Route
          path='seller/products/new'
          element={
            <ProtectedRoute allowedRoles={[UserRole.Seller]}>
              <CreateProductPage />
            </ProtectedRoute>
          }
        />
        <Route
          path='seller/products'
          element={
            <ProtectedRoute allowedRoles={[UserRole.Seller]}>
              <SellerProductsPage />
            </ProtectedRoute>
          }
        />
        <Route
          path='seller/products/:id/edit'
          element={
            <ProtectedRoute allowedRoles={[UserRole.Seller]}>
              <EditProductPage />
            </ProtectedRoute>
          }
        />
        <Route
          path='seller/completed-auctions'
          element={
            <ProtectedRoute allowedRoles={[UserRole.Seller]}>
              <CompletedAuctionsPage />
            </ProtectedRoute>
          }
        />

        <Route
          path='seller/completed-auctions/:id/rating'
          element={
            <ProtectedRoute allowedRoles={[UserRole.Seller]}>
              <RatingCompletedAuctionPage />
            </ProtectedRoute>
          }
        />

        <Route
          path='seller/orders/:productId/confirm'
          element={
            <ProtectedRoute allowedRoles={[UserRole.Seller]}>
              <SellerOrderConfirmationPage />
            </ProtectedRoute>
          }
        />

        {/* Admin Routes */}
        <Route
          path='admin'
          element={
            <ProtectedRoute allowedRoles={[UserRole.Admin]}>
              {/* <AdminDashboard /> */}
            </ProtectedRoute>
          }
        />
        <Route
          path='admin/products'
          element={
            <ProtectedRoute allowedRoles={[UserRole.Admin]}>
              <ProductManageMentPage />
            </ProtectedRoute>
          }
        />
        <Route
          path='admin/categories'
          element={
            <ProtectedRoute allowedRoles={[UserRole.Admin]}>
              <CategoryManager />
            </ProtectedRoute>
          }
        />
        <Route
          path='admin/users'
          element={
            <ProtectedRoute allowedRoles={[UserRole.Admin]}>
              {/* <AdminUsersPage /> */}
            </ProtectedRoute>
          }
        />
        <Route
          path='admin/seller-requests'
          element={
            <ProtectedRoute allowedRoles={[UserRole.Admin]}>
              <RequestToSellerList />
            </ProtectedRoute>
          }
        />
        <Route
          path='admin/settings'
          element={
            <ProtectedRoute allowedRoles={[UserRole.Admin]}>
              {/* <AdminSettingsPage /> */}
            </ProtectedRoute>
          }
        />

        {/* 404 - Redirect to home */}
        <Route path='*' element={<Navigate to='/' replace />} />
      </Route>
    </Routes>
  )
}

export default App
