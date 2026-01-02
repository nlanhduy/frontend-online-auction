import {
  ArrowLeft,
  Calendar,
  Mail,
  MapPin,
  Shield,
  Star,
  User as UserIcon,
} from 'lucide-react'
import { useNavigate, useParams } from 'react-router-dom'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { Spinner } from '@/components/ui/spinner'
import { QUERY_KEYS } from '@/constants/queryKey'
import { formatReadableDate, getUserRoleColor } from '@/lib/utils'
import { AuthAPI } from '@/services/api/auth.api'
import { UserRole } from '@/types/auth.types'
import { useQuery } from '@tanstack/react-query'

export const AdminUserDetail = () => {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()

  const userDetailQuery = useQuery({
    queryKey: [QUERY_KEYS.user.detail(id!)],
    queryFn: async () => {
      const response = await AuthAPI.getUserById({ variables: { userId: id } })
      return response.data
    },
    enabled: !!id,
  })

  const user = userDetailQuery.data

  if (userDetailQuery.isLoading) {
    return (
      <div className='py-12'>
        <div className='container mx-auto pt-10'>
          <div className='text-center py-12'>
            <Button disabled size='lg'>
              <Spinner />
              Loading user details...
            </Button>
          </div>
        </div>
      </div>
    )
  }

  if (userDetailQuery.isError || !user) {
    return (
      <div className='py-12'>
        <div className='container mx-auto pt-10'>
          <div className='text-center py-12'>
            <p className='text-lg text-red-600 mb-4'>
              An error occurred while loading data
            </p>
            <Button onClick={() => navigate('/admin/users')}>
              <ArrowLeft className='w-4 h-4 mr-2' />
              Back to Users
            </Button>
          </div>
        </div>
      </div>
    )
  }

  const rating = user.positiveRating - user.negativeRating

  return (
    <div className=''>
      <div className='container mx-auto pt-10 max-w-5xl'>
        {/* Header */}
        <div className='mb-8'>
          <Button
            variant='ghost'
            onClick={() => navigate('/admin/users')}
            className='mb-4'>
            <ArrowLeft className='w-4 h-4 mr-2' />
            Back to Users
          </Button>
          <h1 className='text-3xl font-bold'>User Details</h1>
          <p className='text-gray-600 mt-2'>View and manage user information</p>
        </div>

        <div className='grid grid-cols-1 lg:grid-cols-3 gap-6'>
          {/* Profile Card */}
          <Card className='lg:col-span-1'>
            <CardHeader>
              <CardTitle>Profile</CardTitle>
            </CardHeader>
            <CardContent className='flex flex-col items-center text-center'>
              {/* Avatar */}
              <div className='w-32 h-32 rounded-full bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center text-white text-4xl font-bold mb-4'>
                {user.profilePicture || user.avatar ? (
                  <img
                    src={user.profilePicture || user.avatar}
                    alt={user.fullName}
                    className='w-full h-full rounded-full object-cover'
                  />
                ) : (
                  <span>{user.fullName?.charAt(0).toUpperCase() || 'U'}</span>
                )}
              </div>

              {/* Name & Role */}
              <h2 className='text-2xl font-bold mb-2'>
                {user.fullName || 'Unnamed User'}
              </h2>
              <Badge className={`mb-4 ${getUserRoleColor(user.role)}`}>{user.role}</Badge>

              {/* Rating */}
              <div className='flex items-center gap-2 mb-4'>
                <Star className='w-5 h-5 fill-yellow-400 text-yellow-400' />
                <span className='text-lg font-semibold'>{rating}</span>
                <span className='text-sm text-gray-600'>
                  ({user.positiveRating} positive, {user.negativeRating} negative)
                </span>
              </div>

              <Separator className='my-4' />

              {/* Quick Info */}
              <div className='w-full space-y-3 text-left'>
                <div className='flex items-start gap-3'>
                  <Mail className='w-4 h-4 mt-1 text-gray-600' />
                  <div className='flex-1 break-all'>
                    <p className='text-sm text-gray-600'>Email</p>
                    <p className='font-medium'>{user.email}</p>
                  </div>
                </div>

                {user.address && (
                  <div className='flex items-start gap-3'>
                    <MapPin className='w-4 h-4 mt-1 text-gray-600' />
                    <div className='flex-1'>
                      <p className='text-sm text-gray-600'>Address</p>
                      <p className='font-medium'>{user.address}</p>
                    </div>
                  </div>
                )}

                {user.dateOfBirth && (
                  <div className='flex items-start gap-3'>
                    <Calendar className='w-4 h-4 mt-1 text-gray-600' />
                    <div className='flex-1'>
                      <p className='text-sm text-gray-600'>Date of Birth</p>
                      <p className='font-medium'>
                        {formatReadableDate(user.dateOfBirth)}
                      </p>
                    </div>
                  </div>
                )}
              </div>

              {/* Actions */}
              <div className='w-full mt-6 space-y-2'>
                <Button
                  className='w-full'
                  onClick={() => navigate(`/admin/users/${user.id}/edit`)}>
                  Edit User
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Details Cards */}
          <div className='lg:col-span-2 space-y-6'>
            {/* Account Information */}
            <Card>
              <CardHeader>
                <CardTitle className='flex items-center gap-2'>
                  <UserIcon className='w-5 h-5' />
                  Account Information
                </CardTitle>
                <CardDescription>User account details and authentication</CardDescription>
              </CardHeader>
              <CardContent className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                <div>
                  <p className='text-sm text-gray-600 mb-1'>User ID</p>
                  <p className='font-mono text-sm bg-gray-100 p-2 rounded break-all'>
                    {user.id}
                  </p>
                </div>

                <div>
                  <p className='text-sm text-gray-600 mb-1'>Account Status</p>
                  <Badge
                    variant='outline'
                    className='bg-green-50 text-green-700 border-green-200'>
                    Active
                  </Badge>
                </div>

                <div>
                  <p className='text-sm text-gray-600 mb-1'>Provider</p>
                  <p className='font-medium capitalize'>{user.provider || 'Email'}</p>
                </div>

                {user.googleId && (
                  <div>
                    <p className='text-sm text-gray-600 mb-1'>Google ID</p>
                    <p className='font-mono text-sm break-all'>{user.googleId}</p>
                  </div>
                )}

                <div>
                  <p className='text-sm text-gray-600 mb-1'>Created At</p>
                  <p className='font-medium'>{formatReadableDate(user.createdAt)}</p>
                </div>

                <div>
                  <p className='text-sm text-gray-600 mb-1'>Last Updated</p>
                  <p className='font-medium'>{formatReadableDate(user.updatedAt)}</p>
                </div>
              </CardContent>
            </Card>

            {/* Seller Information */}
            {user.role === UserRole.Seller && (
              <Card>
                <CardHeader>
                  <CardTitle className='flex items-center gap-2'>
                    <Shield className='w-5 h-5' />
                    Seller Information
                  </CardTitle>
                  <CardDescription>
                    Seller-specific details and permissions
                  </CardDescription>
                </CardHeader>
                <CardContent className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                  {user.sellerExpiration ? (
                    <div>
                      <p className='text-sm text-gray-600 mb-1'>Seller Expiration</p>
                      <p className='font-medium'>
                        {formatReadableDate(user.sellerExpiration)}
                      </p>
                    </div>
                  ) : (
                    <div>
                      <p className='text-sm text-gray-600 mb-1'>Seller Status</p>
                      <Badge
                        variant='outline'
                        className='bg-blue-50 text-blue-700 border-blue-200'>
                        Active Seller
                      </Badge>
                    </div>
                  )}

                  {user.paypalEmail && (
                    <div>
                      <p className='text-sm text-gray-600 mb-1'>PayPal Email</p>
                      <p className='font-medium break-all'>{user.paypalEmail}</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}

            {/* Rating Details */}
            <Card>
              <CardHeader>
                <CardTitle className='flex items-center gap-2'>
                  <Star className='w-5 h-5' />
                  Rating Details
                </CardTitle>
                <CardDescription>User reputation and feedback statistics</CardDescription>
              </CardHeader>
              <CardContent>
                <div className='space-y-4'>
                  <div className='flex items-center justify-between'>
                    <span className='text-sm text-gray-600'>Positive Ratings</span>
                    <Badge className='bg-green-100 text-green-800'>
                      +{user.positiveRating}
                    </Badge>
                  </div>
                  <Separator />
                  <div className='flex items-center justify-between'>
                    <span className='text-sm text-gray-600'>Negative Ratings</span>
                    <Badge className='bg-red-100 text-red-800'>
                      -{user.negativeRating}
                    </Badge>
                  </div>
                  <Separator />
                  <div className='flex items-center justify-between'>
                    <span className='text-sm font-medium'>Total Rating</span>
                    <Badge
                      className={
                        rating >= 0
                          ? 'bg-blue-100 text-blue-800'
                          : 'bg-gray-100 text-gray-800'
                      }>
                      {rating >= 0 ? '+' : ''}
                      {rating}
                    </Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
