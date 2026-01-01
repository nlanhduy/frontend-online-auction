import { Loader2 } from 'lucide-react'
import { useEffect } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { toast } from 'sonner'

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { useGoogleAuth } from '@/hooks/use-google-oauth'

export function AuthCallbackPage() {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const { mutate: authenticateWithGoogle } = useGoogleAuth()

  useEffect(() => {
    const token = searchParams.get('token')
    const error = searchParams.get('error')

    if (error) {
      toast.error('Google authentication failed', {
        description: decodeURIComponent(error),
      })
      navigate('/login', { replace: true })
      return
    }

    if (!token) {
      toast.error('Authentication failed', {
        description: 'No credentials received. Please try again.',
      })
      navigate('/login', { replace: true })
      return
    }

    // Process Google authentication
    authenticateWithGoogle(token)
  }, [searchParams, navigate, authenticateWithGoogle])

  return (
    <div className='flex min-h-screen items-center justify-center p-4'>
      <Card className='w-full max-w-md'>
        <CardHeader className='text-center'>
          <CardTitle>Completing Authentication</CardTitle>
          <CardDescription>Please wait while we log you in...</CardDescription>
        </CardHeader>
        <CardContent className='flex justify-center py-8'>
          <Loader2 className='h-12 w-12 animate-spin text-primary' />
        </CardContent>
      </Card>
    </div>
  )
}
