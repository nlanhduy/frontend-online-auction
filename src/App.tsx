import { Navigate, Route, Routes } from 'react-router-dom'

import { GuestRoute } from '@/components/auth/GuestRoute'
import { ProtectedRoute } from '@/components/auth/ProtectedRoute'

import { Layout } from './components/layout/Layout'
import LoginPage from './pages/auth/LoginPage'
import RegisterPage from './pages/auth/RegisterPage'
import CategoryPage from './pages/category/CategoryPage'
import Homepage from './pages/homepage/Homepage'
import ProductDetail from './pages/product/Product'
import SearchPage from './pages/search/SearchPage'
import WatchListPage from './pages/watchList/WatchListPage'
import { UserRole } from './types/auth.types'

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

      {/* Public Routes with appropriate layout */}
      <Route element={<Layout />}>
        <Route path='/' element={<Homepage />} />
        <Route path='/category/:categoryId' element={<CategoryPage />} />
        <Route path='/search' element={<SearchPage />} />
        <Route path='/product/:productId' element={<ProductDetail />} />

        {/* Bidder Routes */}
        <Route
          path='profile'
          element={
            <ProtectedRoute
              allowedRoles={[UserRole.Bidder, UserRole.Seller, UserRole.Admin]}>
              {/* <ProfilePage /> */}
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
          path='my-bids'
          element={
            <ProtectedRoute allowedRoles={[UserRole.Bidder, UserRole.Seller]}>
              {/* <MyBidsPage /> */}
            </ProtectedRoute>
          }
        />
        <Route
          path='my-wins'
          element={
            <ProtectedRoute allowedRoles={[UserRole.Bidder, UserRole.Seller]}>
              {/* <MyWinsPage /> */}
            </ProtectedRoute>
          }
        />
        <Route
          path='upgrade-seller'
          element={
            <ProtectedRoute allowedRoles={[UserRole.Bidder]}>
              {/* <UpgradeSellerPage /> */}
            </ProtectedRoute>
          }
        />
        <Route
          path='settings'
          element={
            <ProtectedRoute
              allowedRoles={[UserRole.Bidder, UserRole.Seller, UserRole.Admin]}>
              {/* <SettingsPage /> */}
            </ProtectedRoute>
          }
        />

        {/* Seller Routes */}
        <Route
          path='seller/products/new'
          element={
            <ProtectedRoute allowedRoles={[UserRole.Seller]}>
              {/* <CreateProductPage /> */}
            </ProtectedRoute>
          }
        />
        <Route
          path='seller/products'
          element={
            <ProtectedRoute allowedRoles={[UserRole.Seller]}>
              {/* <SellerProductsPage /> */}
            </ProtectedRoute>
          }
        />
        <Route
          path='seller/products/:id/edit'
          element={
            <ProtectedRoute allowedRoles={[UserRole.Seller]}>
              {/* <EditProductPage /> */}
            </ProtectedRoute>
          }
        />
        <Route
          path='seller/sales'
          element={
            <ProtectedRoute allowedRoles={[UserRole.Seller]}>
              {/* <SellerSalesPage /> */}
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
              {/* <AdminProductsPage /> */}
            </ProtectedRoute>
          }
        />
        <Route
          path='admin/categories'
          element={
            <ProtectedRoute allowedRoles={[UserRole.Admin]}>
              {/* <AdminCategoriesPage /> */}
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
              {/* <AdminSellerRequestsPage /> */}
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
