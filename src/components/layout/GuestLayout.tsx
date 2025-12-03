import { Gavel, Search } from 'lucide-react'
import { useState } from 'react'
import { Link, Outlet, useNavigate } from 'react-router-dom'

import { Button } from '@/components/ui/button'

import { Input } from '../ui/input'
import { Footer } from './Footer'
import { CategoriesMenu } from './NavigationMenu'

export function GuestLayout() {
  const navigate = useNavigate()
  const [searchQuery, setSearchQuery] = useState('')

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    if (searchQuery.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchQuery)}`)
    } else {
      navigate('/search')
    }
  }

  return (
    <div className='min-h-screen flex flex-col'>
      {/* Guest Header */}
      <header className='sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur'>
        <div className='container mx-auto flex h-16 items-center justify-between'>
          <Link to='/' className='flex items-center space-x-2'>
            <Gavel className='h-6 w-6' />
            <span className='font-bold text-xl'>AuctionHub</span>
          </Link>

          <nav className='flex items-center space-x-6'>
            <Link to='/' className='text-sm font-medium hover:text-primary'>
              Home
            </Link>

            {/* Categories NavigationMenu */}
            <CategoriesMenu />

            <Link to='/products' className='text-sm font-medium hover:text-primary'>
              Products
            </Link>
          </nav>

          <div className='flex items-center space-x-4'>
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
            <Link to='/login'>
              <Button variant='ghost'>Login</Button>
            </Link>
            <Link to='/register'>
              <Button>Register</Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className='flex-1 py-12'>
        <Outlet />
      </main>

      {/* Footer */}
      <Footer />
    </div>
  )
}
