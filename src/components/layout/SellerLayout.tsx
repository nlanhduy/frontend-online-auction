import {
  Gavel,
  Heart,
  LogOut,
  Package,
  Plus,
  Settings,
  ShoppingBag,
  Trophy,
  User,
} from 'lucide-react'
import { Link, Outlet, useNavigate } from 'react-router-dom'

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { useAuthStore } from '@/store/authStore'

import { Footer } from './Footer'

export function SellerLayout() {
  const { user, logout } = useAuthStore()
  const navigate = useNavigate()

  const handleLogout = () => {
    logout()
    navigate('/')
  }

  return (
    <div className='min-h-screen flex flex-col'>
      {/* Seller Header */}
      <header className='sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur'>
        <div className='container flex h-16 items-center justify-between'>
          <Link to='/' className='flex items-center space-x-2'>
            <Gavel className='h-6 w-6' />
            <span className='font-bold text-xl'>AuctionHub</span>
          </Link>

          <nav className='flex items-center space-x-6'>
            <Link to='/' className='text-sm font-medium hover:text-primary'>
              Home
            </Link>
            <Link to='/products' className='text-sm font-medium hover:text-primary'>
              Products
            </Link>
            <Link
              to='/seller/products'
              className='text-sm font-medium hover:text-primary'>
              My Products
            </Link>
            <Link to='/seller/products/new'>
              <Button size='sm' className='ml-4'>
                <Plus className='h-4 w-4 mr-2' />
                Create Product
              </Button>
            </Link>
          </nav>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant='ghost' className='relative h-10 w-10 rounded-full'>
                <Avatar>
                  <AvatarImage src={user?.avatar} alt={user?.name} />
                  <AvatarFallback>{user?.name?.charAt(0).toUpperCase()}</AvatarFallback>
                </Avatar>
              </Button>
            </DropdownMenuTrigger>

            <DropdownMenuContent align='end' className='w-56'>
              <div className='flex items-center justify-start gap-2 p-2'>
                <div className='flex flex-col space-y-1'>
                  <p className='font-medium'>{user?.name}</p>
                  <p className='text-xs text-muted-foreground'>{user?.email}</p>
                  <p className='text-xs text-primary font-medium'>Seller</p>
                </div>
              </div>

              <DropdownMenuSeparator />

              <DropdownMenuItem asChild>
                <Link to='/profile' className='cursor-pointer'>
                  <User className='mr-2 h-4 w-4' />
                  My Profile
                </Link>
              </DropdownMenuItem>

              <DropdownMenuItem asChild>
                <Link to='/watchlist' className='cursor-pointer'>
                  <Heart className='mr-2 h-4 w-4' />
                  Watchlist
                </Link>
              </DropdownMenuItem>

              <DropdownMenuItem asChild>
                <Link to='/my-bids' className='cursor-pointer'>
                  <Gavel className='mr-2 h-4 w-4' />
                  My Bids
                </Link>
              </DropdownMenuItem>

              <DropdownMenuItem asChild>
                <Link to='/my-wins' className='cursor-pointer'>
                  <Trophy className='mr-2 h-4 w-4' />
                  Won Auctions
                </Link>
              </DropdownMenuItem>

              <DropdownMenuSeparator />

              <DropdownMenuItem asChild>
                <Link to='/seller/products/new' className='cursor-pointer text-primary'>
                  <Plus className='mr-2 h-4 w-4' />
                  Create Product
                </Link>
              </DropdownMenuItem>

              <DropdownMenuItem asChild>
                <Link to='/seller/products' className='cursor-pointer'>
                  <Package className='mr-2 h-4 w-4' />
                  My Products
                </Link>
              </DropdownMenuItem>

              <DropdownMenuItem asChild>
                <Link to='/seller/sales' className='cursor-pointer'>
                  <ShoppingBag className='mr-2 h-4 w-4' />
                  Sold Items
                </Link>
              </DropdownMenuItem>

              <DropdownMenuSeparator />

              <DropdownMenuItem asChild>
                <Link to='/settings' className='cursor-pointer'>
                  <Settings className='mr-2 h-4 w-4' />
                  Settings
                </Link>
              </DropdownMenuItem>

              <DropdownMenuItem onClick={handleLogout} className='cursor-pointer'>
                <LogOut className='mr-2 h-4 w-4' />
                Logout
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </header>

      <main className='flex-1'>
        <Outlet />
      </main>

      <Footer />
    </div>
  )
}
