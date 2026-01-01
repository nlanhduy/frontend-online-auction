import {
  ChartBarStacked,
  FileText,
  Gavel,
  LayoutDashboard,
  LogOut,
  Package,
  Search,
  Settings,
  TableProperties,
  User,
} from 'lucide-react'
import { useState } from 'react'
import { Link, Outlet, useNavigate } from 'react-router-dom'

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Input } from '@/components/ui/input'
import { useAuth, useLogout } from '@/hooks/use-auth'
import { UserRole } from '@/types/auth.types'

import { Footer } from './Footer'
import { CategoriesMenu } from './NavigationMenu'

export function Layout() {
  const navigate = useNavigate()
  const { user, isAuthenticated } = useAuth()
  const logout = useLogout()
  const [searchQuery, setSearchQuery] = useState('')

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    if (searchQuery.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchQuery)}`)
    } else {
      navigate('/search')
    }
  }

  const handleLogout = () => {
    logout.mutate()
  }

  // Get user initials for avatar fallback
  const getInitials = (name?: string) => {
    if (!name) return 'U'
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2)
  }

  // Render menu items based on user role
  const renderMenuItems = () => {
    if (!user) return null

    const commonItems = (
      <>
        <DropdownMenuItem onClick={() => navigate('/profile')}>
          <User className='mr-2 h-4 w-4' />
          Profile
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => navigate('/settings')}>
          <Settings className='mr-2 h-4 w-4' />
          Settings
        </DropdownMenuItem>
      </>
    )

    switch (user.role) {
      case UserRole.Bidder:
        return (
          <>
            {commonItems}
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => navigate('/bidder/active-bids')}>
              <Package className='mr-2 h-4 w-4' />
              My active bids
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => navigate('/bidder/won-auctions')}>
              <Gavel className='mr-2 h-4 w-4' />
              My won auctions
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => navigate('/watchlist')}>
              <FileText className='mr-2 h-4 w-4' />
              Watchlist
            </DropdownMenuItem>
          </>
        )

      case UserRole.Seller:
        return (
          <>
            {commonItems}
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => navigate('/watchlist')}>
              <FileText className='mr-2 h-4 w-4' />
              Watchlist
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => navigate('/seller/completed-auctions')}>
              <Gavel className='mr-2 h-4 w-4' />
              Completed Auctions
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => navigate('/seller/products')}>
              <TableProperties className='mr-2 h-4 w-4' />
              Manage Products
            </DropdownMenuItem>
          </>
        )

      case UserRole.Admin:
        return (
          <>
            {commonItems}
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => navigate('/admin/dashboard')}>
              <LayoutDashboard className='mr-2 h-4 w-4' />
              Dashboard
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => navigate('/admin/categories')}>
              <ChartBarStacked className='mr-2 h-4 w-4' />
              Manage Categories
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => navigate('/admin/users')}>
              <User className='mr-2 h-4 w-4' />
              Manage Users
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => navigate('/admin/products')}>
              <TableProperties className='mr-2 h-4 w-4' />
              Manage Products
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => navigate('/admin/seller-requests')}>
              <Package className='mr-2 h-4 w-4' />
              Seller Requests
            </DropdownMenuItem>
          </>
        )

      default:
        return commonItems
    }
  }

  return (
    <div className='min-h-screen flex flex-col'>
      {/* Header */}
      <header className='sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur'>
        <div className='container mx-auto flex h-16 items-center justify-between px-4'>
          {/* Logo */}
          <Link to='/' className='flex items-center space-x-2'>
            <Gavel className='h-6 w-6' />
            <span className='font-bold text-xl'>AuctionHub</span>
          </Link>

          {/* Navigation */}
          <nav className='flex items-center space-x-6'>
            <Link to='/' className='text-sm font-medium hover:text-primary'>
              Home
            </Link>

            <CategoriesMenu />

            <Link to='/products' className='text-sm font-medium hover:text-primary'>
              Products
            </Link>
          </nav>

          {/* Search Bar */}
          <form onSubmit={handleSearch} className='flex-1 max-w-lg mx-8'>
            <div className='relative'>
              <Search className='absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5' />
              <Input
                type='text'
                placeholder='Find products...'
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className='pl-10 h-10 bg-gray-50'
              />
            </div>
          </form>

          {/* Auth Section */}
          <div className='flex items-center space-x-4'>
            {isAuthenticated && user ? (
              /* Authenticated User Menu */
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant='ghost' className='relative h-10 w-10 rounded-full'>
                    <Avatar className='h-10 w-10'>
                      <AvatarImage
                        src={user.avatar || user.profilePicture}
                        alt={user.fullName}
                      />
                      <AvatarFallback>{getInitials(user.fullName)}</AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className='w-56' align='end'>
                  <DropdownMenuLabel>
                    <div className='flex flex-col space-y-1'>
                      <p className='text-sm font-medium leading-none'>{user.fullName}</p>
                      <p className='text-xs leading-none text-muted-foreground'>
                        {user.email}
                      </p>
                      <p className='text-xs leading-none text-muted-foreground mt-1'>
                        Role: {user.role}
                      </p>
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />

                  {renderMenuItems()}

                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    onClick={handleLogout}
                    disabled={logout.isPending}
                    className='text-red-600 focus:text-red-600'>
                    <LogOut className='mr-2 h-4 w-4' />
                    {logout.isPending ? 'Logging out...' : 'Logout'}
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <>
                <Link to='/login'>
                  <Button variant='ghost'>Login</Button>
                </Link>
                <Link to='/register'>
                  <Button>Register</Button>
                </Link>
              </>
            )}
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className='flex-1'>
        <Outlet />
      </main>

      {/* Footer */}
      <Footer />
    </div>
  )
}
