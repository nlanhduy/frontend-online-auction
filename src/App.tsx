import { Navigate, Route, Routes } from 'react-router-dom'

import { GuestRoute } from '@/components/auth/GuestRoute'
import { ProtectedRoute } from '@/components/auth/ProtectedRoute'
// Layouts
import { AdminLayout } from '@/components/layout/AdminLayout'
import { BidderLayout } from '@/components/layout/BidderLayout'
import { GuestLayout } from '@/components/layout/GuestLayout'
import { SellerLayout } from '@/components/layout/SellerLayout'
// Pages - Admin (commented if not available)
// import AdminCategoriesPage from '@/pages/admin/CategoriesPage'
// import AdminDashboard from '@/pages/admin/DashboardPage'
// import AdminProductsPage from '@/pages/admin/ProductsPage'
// import AdminSellerRequestsPage from '@/pages/admin/SellerRequestsPage'
// import AdminSettingsPage from '@/pages/admin/SettingsPage'
// import AdminUsersPage from '@/pages/admin/UsersPage'
// Pages - Auth
// import LoginPage from '@/pages/auth/LoginPage'
// import RegisterPage from '@/pages/auth/RegisterPage'
// Pages - Public
// import HomePage from '@/pages/HomePage'
// import ProductDetailPage from '@/pages/ProductDetailPage'
// import ProductsPage from '@/pages/ProductsPage'
// import SearchPage from '@/pages/SearchPage'
// Pages - Bidder
// import ProfilePage from '@/pages/profile/ProfilePage'
// import WatchlistPage from '@/pages/profile/WatchlistPage'
// import MyBidsPage from '@/pages/profile/MyBidsPage'
// import MyWinsPage from '@/pages/profile/MyWinsPage'
// import SettingsPage from '@/pages/profile/SettingsPage'
// import UpgradeSellerPage from '@/pages/profile/UpgradeSellerPage'
// Pages - Seller
// import CreateProductPage from '@/pages/seller/CreateProductPage'
// import EditProductPage from '@/pages/seller/EditProductPage'
// import SellerProductsPage from '@/pages/seller/ProductsPage'
// import SellerSalesPage from '@/pages/seller/SalesPage'
import { useAuthStore } from '@/store/authStore'

import LoginPage from './pages/auth/LoginPage'
import RegisterPage from './pages/auth/RegisterPage'
import CategoryPage from './pages/category/CategoryPage'
import Homepage from './pages/homepage/Homepage'
import SearchPage from './pages/search/SearchPage'

// Enum for user roles
export const UserRole = {
  Guest: 'guest',
  Bidder: 'bidder',
  Seller: 'seller',
  Admin: 'admin',
} as const

function App() {
  const { isAuthenticated, user } = useAuthStore()

  const getLayout = () => {
    if (!isAuthenticated || !user) return GuestLayout

    switch (user.role) {
      case UserRole.Admin:
        return AdminLayout
      case UserRole.Seller:
        return SellerLayout
      case UserRole.Bidder:
        return BidderLayout
      default:
        return GuestLayout
    }
  }

  const Layout = getLayout()

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
        {/* <Route index element={<HomePage />} /> */}
        {/* <Route path='products' element={<ProductsPage />} /> */}
        {/* <Route path='products/:id' element={<ProductDetailPage />} /> */}
        {/* <Route path='search' element={<SearchPage />} /> */}
        <Route path='/' element={<Homepage />} />
        <Route path='/category/:categoryId' element={<CategoryPage />} />
        <Route path='/search' element={<SearchPage />} />

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
              {/* <WatchlistPage /> */}
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
