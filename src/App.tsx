import { Navigate, Route, Routes } from 'react-router-dom'

import { GuestRoute } from '@/components/auth/GuestRoute'
import { ProtectedRoute } from '@/components/auth/ProtectedRoute'

import { Layout } from './components/layout/Layout'
import { AdminCategories } from './pages/admin/categories'
import { AdminDashboard } from './pages/admin/dashboard'
import AdminProducts from './pages/admin/products'
import AdminRequestToSeller from './pages/admin/request-to-seller'
import { AdminUsers } from './pages/admin/users'
import { AdminCreateUser } from './pages/admin/users/create'
import { AdminUserDetail } from './pages/admin/users/detail'
import { AdminEditUser } from './pages/admin/users/edit'
import { AuthCallback } from './pages/auth/auth-callback'
import ForgotPassword from './pages/auth/forgot-password'
import Login from './pages/auth/login'
import Register from './pages/auth/register'
import ActiveBids from './pages/bidder/active-bids'
import RatingWonAuction from './pages/bidder/rating'
import WonAuctions from './pages/bidder/won-auctions'
import Category from './pages/category'
import Homepage from './pages/homepage'
import OrderFulfillmentPage from './pages/order/OrderFulfillmentPage'
import PaymentCancelPage from './pages/order/PaymentCancelPage'
import PaymentSuccessPage from './pages/order/PaymentSuccessPage'
import ProductDetail from './pages/product/ProductDetailPage'
import Rating from './pages/rating'
import Search from './pages/search'
import SellerCompletedAuctions from './pages/seller/auction/completed'
import SellerAuctionRating from './pages/seller/auction/rating'
import { SellerOrderConfirmationPage } from './pages/seller/order/SellerOrderConfirmationPage'
import SellerProducts from './pages/seller/product'
import SellerCreateProduct from './pages/seller/product/create'
import SellerProductEdit from './pages/seller/product/edit'
import { Setting } from './pages/setting'
import WatchList from './pages/watchList'
import { UserRole } from './types/auth.types'

function App() {
  return (
    <Routes>
      <Route
        path='/login'
        element={
          <GuestRoute>
            <Login />
          </GuestRoute>
        }
      />
      <Route
        path='/register'
        element={
          <GuestRoute>
            <Register />
          </GuestRoute>
        }
      />

      <Route
        path='/forgot-password'
        element={
          <GuestRoute>
            <ForgotPassword />
          </GuestRoute>
        }
      />

      <Route path='/auth/callback' element={<AuthCallback />} />

      {/* Public Routes with appropriate layout */}
      <Route element={<Layout />}>
        <Route path='/' element={<Homepage />} />
        <Route path='/category/:categoryId' element={<Category />} />
        <Route path='/search' element={<Search />} />
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

        {/* Bidder Routes */}
        <Route
          path='profile'
          element={
            <ProtectedRoute
              allowedRoles={[UserRole.Bidder, UserRole.Seller, UserRole.Admin]}>
              <Rating />
            </ProtectedRoute>
          }
        />
        <Route
          path='watchlist'
          element={
            <ProtectedRoute allowedRoles={[UserRole.Bidder, UserRole.Seller]}>
              <WatchList />
            </ProtectedRoute>
          }
        />
        <Route
          path='bidder/active-bids'
          element={
            <ProtectedRoute allowedRoles={[UserRole.Bidder]}>
              <ActiveBids />
            </ProtectedRoute>
          }
        />
        <Route
          path='bidder/auctions/won'
          element={
            <ProtectedRoute allowedRoles={[UserRole.Bidder]}>
              <WonAuctions />
            </ProtectedRoute>
          }
        />
        <Route
          path='bidder/auctions/won/:id/rating'
          element={
            <ProtectedRoute allowedRoles={[UserRole.Bidder]}>
              <RatingWonAuction />
            </ProtectedRoute>
          }
        />

        <Route
          path='settings'
          element={
            <ProtectedRoute
              allowedRoles={[UserRole.Bidder, UserRole.Seller, UserRole.Admin]}>
              <Setting />
            </ProtectedRoute>
          }
        />

        {/* Seller Routes */}
        <Route
          path='seller/products/new'
          element={
            <ProtectedRoute allowedRoles={[UserRole.Seller]}>
              <SellerCreateProduct />
            </ProtectedRoute>
          }
        />
        <Route
          path='seller/products'
          element={
            <ProtectedRoute allowedRoles={[UserRole.Seller]}>
              <SellerProducts />
            </ProtectedRoute>
          }
        />
        <Route
          path='seller/products/:id/edit'
          element={
            <ProtectedRoute allowedRoles={[UserRole.Seller]}>
              <SellerProductEdit />
            </ProtectedRoute>
          }
        />
        <Route
          path='seller/auctions/completed'
          element={
            <ProtectedRoute allowedRoles={[UserRole.Seller]}>
              <SellerCompletedAuctions />
            </ProtectedRoute>
          }
        />

        <Route
          path='seller/auctions/completed/:id/rating'
          element={
            <ProtectedRoute allowedRoles={[UserRole.Seller]}>
              <SellerAuctionRating />
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
              <AdminDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path='admin/products'
          element={
            <ProtectedRoute allowedRoles={[UserRole.Admin]}>
              <AdminProducts />
            </ProtectedRoute>
          }
        />
        <Route
          path='admin/categories'
          element={
            <ProtectedRoute allowedRoles={[UserRole.Admin]}>
              <AdminCategories />
            </ProtectedRoute>
          }
        />
        <Route
          path='admin/users'
          element={
            <ProtectedRoute allowedRoles={[UserRole.Admin]}>
              <AdminUsers />
            </ProtectedRoute>
          }
        />
        <Route path='admin/users/:id' element={<AdminUserDetail />} />
        <Route path='admin/users/:id/edit' element={<AdminEditUser />} />
        <Route path='admin/users/create' element={<AdminCreateUser />} />
        <Route
          path='admin/seller-requests'
          element={
            <ProtectedRoute allowedRoles={[UserRole.Admin]}>
              <AdminRequestToSeller />
            </ProtectedRoute>
          }
        />
        <Route
          path='admin/settings'
          element={
            <ProtectedRoute allowedRoles={[UserRole.Admin]}>
              {/* <AdminSettings /> */}
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
