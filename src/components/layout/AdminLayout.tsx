import {
  FolderTree,
  LayoutDashboard,
  LogOut,
  Menu,
  Package,
  Settings as SettingsIcon,
  TrendingUp,
  Users,
} from 'lucide-react'
import { useState } from 'react'
import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom'

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { useAuthStore } from '@/store/authStore'

import { Footer } from './Footer'

const adminNavItems = [
  { to: '/admin', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/admin/products', label: 'Manage Products', icon: Package },
  { to: '/admin/categories', label: 'Manage Categories', icon: FolderTree },
  { to: '/admin/users', label: 'Manage Users', icon: Users },
  { to: '/admin/seller-requests', label: 'Seller Upgrade Requests', icon: TrendingUp },
  { to: '/admin/settings', label: 'System Settings', icon: SettingsIcon },
]

export function AdminLayout() {
  const { user, logout } = useAuthStore()
  const navigate = useNavigate()
  const location = useLocation()
  const [sidebarOpen, setSidebarOpen] = useState(true)

  const handleLogout = () => {
    logout()
    navigate('/')
  }

  return (
    <div className='min-h-screen flex'>
      {/* Sidebar */}
      <aside
        className={cn(
          'fixed inset-y-0 left-0 z-50 w-64 bg-card border-r transform transition-transform duration-200',
          sidebarOpen ? 'translate-x-0' : '-translate-x-full',
        )}>
        <div className='flex flex-col h-full'>
          {/* Logo */}
          <div className='flex items-center gap-2 px-6 py-4 border-b'>
            <LayoutDashboard className='h-6 w-6 text-primary' />
            <span className='font-bold text-xl'>Admin Panel</span>
          </div>

          {/* Navigation */}
          <nav className='flex-1 overflow-y-auto py-4'>
            {adminNavItems.map(item => {
              const Icon = item.icon
              const isActive = location.pathname === item.to

              return (
                <Link
                  key={item.to}
                  to={item.to}
                  className={cn(
                    'flex items-center gap-3 px-6 py-3 text-sm font-medium transition-colors',
                    isActive
                      ? 'bg-primary/10 text-primary border-r-2 border-primary'
                      : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground',
                  )}>
                  <Icon className='h-5 w-5' />
                  {item.label}
                </Link>
              )
            })}
          </nav>

          {/* User Profile */}
          <div className='border-t p-4'>
            <div className='flex items-center gap-3 mb-2'>
              <Avatar className='h-10 w-10'>
                <AvatarImage src={user?.avatar} />
                <AvatarFallback>{user?.name?.charAt(0)}</AvatarFallback>
              </Avatar>
              <div className='flex-1 min-w-0'>
                <p className='text-sm font-medium truncate'>{user?.name}</p>
                <p className='text-xs text-muted-foreground truncate'>{user?.email}</p>
              </div>
            </div>
            <Button
              variant='ghost'
              size='sm'
              className='w-full justify-start'
              onClick={handleLogout}>
              <LogOut className='mr-2 h-4 w-4' />
              Logout
            </Button>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <div
        className={cn(
          'flex-1 transition-all duration-200',
          sidebarOpen ? 'ml-64' : 'ml-0',
        )}>
        {/* Top Bar */}
        <header className='sticky top-0 z-40 border-b bg-background/95 backdrop-blur'>
          <div className='flex h-16 items-center gap-4 px-6'>
            <Button
              variant='ghost'
              size='icon'
              onClick={() => setSidebarOpen(!sidebarOpen)}>
              <Menu className='h-5 w-5' />
            </Button>

            <div className='flex-1' />

            <Link to='/'>
              <Button variant='outline' size='sm'>
                Back to Home
              </Button>
            </Link>
          </div>
        </header>

        {/* Page Content */}
        <main className='p-6'>
          <Outlet />
        </main>

        <Footer />
      </div>
    </div>
  )
}
