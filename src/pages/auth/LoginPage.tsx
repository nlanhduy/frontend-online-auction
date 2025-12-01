import { LoginForm } from '@/components/auth/LoginForm'

export default function LoginPage() {
  return (
    <div className='min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 p-4'>
      <div className='w-full max-w-md'>
        <div className='text-center mb-8'>
          <h1 className='text-3xl font-bold text-gray-900 mb-2'>Welcome Back</h1>
          <p className='text-muted-foreground'>Sign in to continue to AuctionHub</p>
        </div>

        <LoginForm />
      </div>
    </div>
  )
}
