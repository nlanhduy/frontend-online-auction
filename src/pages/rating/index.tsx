import { Award, ThumbsDown, ThumbsUp, TrendingUp } from 'lucide-react'
import { useParams } from 'react-router-dom'

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { Spinner } from '@/components/ui/spinner'
import { QUERY_KEYS } from '@/constants/queryKey'
import { formatReadableDate, getInitials } from '@/lib/utils'
import { AuthAPI } from '@/services/api/auth.api'
import { useQuery } from '@tanstack/react-query'

import type { RatingData } from '@/types/rating.type'
function Rating() {
  const { userId } = useParams()
  const ratingQuery = useQuery<RatingData>({
    queryKey: [QUERY_KEYS.user.myRating(userId)],
    queryFn: async () => {
      const response = await AuthAPI.getUserRatings({
        variables: { userId },
      })
      return response.data
    },
    enabled: !!userId,
    staleTime: 1000 * 60 * 5,
  })

  if (ratingQuery.isLoading) {
    return (
      <div className='container mx-auto py-12 flex items-center justify-center min-h-screen'>
        <Button className='mx-auto' size='lg' disabled>
          <Spinner />
          Loading ratings...
        </Button>
      </div>
    )
  }

  if (!ratingQuery.data) {
    return (
      <div className='container mx-auto py-12'>
        <div className='text-center'>
          <p className='text-gray-500'>No rating data available</p>
        </div>
      </div>
    )
  }

  const {
    positiveRating,
    negativeRating,
    totalRatings,
    positivePercentage,
    ratings,
    user,
  } = ratingQuery.data

  return (
    <div className='max-w-7xl mx-auto p-6 space-y-6'>
      {/* Header */}
      <Card className='p-6 flex gap-4'>
        <Avatar className='h-12 w-12'>
          <AvatarImage src={user.profilePicture || user.avatar} alt={user.fullName} />
          <AvatarFallback>{getInitials(user.fullName)}</AvatarFallback>
        </Avatar>

        <div>
          <h1 className='text-3xl font-bold text-gray-900'>Ratings</h1>
          <p className='text-gray-600'>
            View all ratings and feedback from{' '}
            <span className='font-medium'>{user.fullName}</span>
          </p>
        </div>
      </Card>

      {/* Stats Overview */}
      <div className='grid grid-cols-1 md:grid-cols-4 gap-4'>
        {/* Total Ratings */}
        <Card>
          <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
            <CardTitle className='text-sm font-medium'>Total Ratings</CardTitle>
            <Award className='h-4 w-4 text-blue-600' />
          </CardHeader>
          <CardContent>
            <div className='text-2xl font-bold'>{totalRatings}</div>
            <p className='text-xs text-gray-500 mt-1'>All time</p>
          </CardContent>
        </Card>

        {/* Positive Ratings */}
        <Card>
          <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
            <CardTitle className='text-sm font-medium'>Positive</CardTitle>
            <ThumbsUp className='h-4 w-4 text-green-600' />
          </CardHeader>
          <CardContent>
            <div className='text-2xl font-bold text-green-600'>{positiveRating}</div>
            {totalRatings === 0 ? (
              <p className='text-xs text-gray-500 mt-1'>0% positive</p>
            ) : (
              <p className='text-xs text-gray-500 mt-1'>
                {positivePercentage.toFixed(1)}% positive
              </p>
            )}
          </CardContent>
        </Card>

        {/* Negative Ratings */}
        <Card>
          <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
            <CardTitle className='text-sm font-medium'>Negative</CardTitle>
            <ThumbsDown className='h-4 w-4 text-red-600' />
          </CardHeader>
          <CardContent>
            <div className='text-2xl font-bold text-red-600'>{negativeRating}</div>
            {totalRatings === 0 ? (
              <p className='text-xs text-gray-500 mt-1'>0% negative</p>
            ) : (
              <p className='text-xs text-gray-500 mt-1'>
                {(100 - positivePercentage).toFixed(1)}% negative
              </p>
            )}
          </CardContent>
        </Card>

        {/* Score */}
        <Card>
          <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
            <CardTitle className='text-sm font-medium'>Reputation Score</CardTitle>
            <TrendingUp className='h-4 w-4 text-purple-600' />
          </CardHeader>
          <CardContent>
            <div className='text-2xl font-bold text-purple-600'>
              {positiveRating - negativeRating}
            </div>
            <p className='text-xs text-gray-500 mt-1'>Net score</p>
          </CardContent>
        </Card>
      </div>

      {/* Progress Bar */}
      <Card>
        <CardHeader>
          <CardTitle>Rating Distribution</CardTitle>
        </CardHeader>
        <CardContent className='space-y-4'>
          <div className='space-y-2'>
            <div className='flex items-center justify-between text-sm'>
              <span className='flex items-center gap-2'>
                <ThumbsUp className='h-4 w-4 text-green-600' />
                Positive
              </span>
              <span className='font-medium'>{positiveRating}</span>
            </div>
            {totalRatings === 0 ? (
              <Progress value={0} className='h-3 [&>div]:bg-green-600' />
            ) : (
              <Progress value={positivePercentage} className='h-3 [&>div]:bg-green-600' />
            )}
          </div>
          <div className='space-y-2'>
            <div className='flex items-center justify-between text-sm'>
              <span className='flex items-center gap-2'>
                <ThumbsDown className='h-4 w-4 text-red-600' />
                Negative
              </span>
              <span className='font-medium'>{negativeRating}</span>
            </div>
            {totalRatings === 0 ? (
              <Progress value={0} className='h-3 [&>div]:bg-red-600' />
            ) : (
              <Progress
                value={100 - positivePercentage}
                className='h-3 [&>div]:bg-red-600'
              />
            )}
          </div>
        </CardContent>
      </Card>

      {/* Ratings List */}
      <div className='bg-white rounded-lg shadow-md p-6'>
        <h2 className='text-xl font-bold text-gray-900 mb-6'>
          All Ratings ({ratings.length})
        </h2>

        {ratings.length === 0 ? (
          <div className='text-center py-12'>
            <p className='text-gray-500'>No ratings yet</p>
          </div>
        ) : (
          <div className='space-y-4'>
            {ratings.map(rating => (
              <div
                key={rating.id}
                className={`border-l-4 ${
                  rating.value === 1 ? 'border-green-500' : 'border-red-500'
                } bg-gray-50 rounded-r-lg p-4 hover:shadow-md transition-shadow`}>
                <div className='flex items-start justify-between mb-3'>
                  <div className='flex items-center gap-3'>
                    <Avatar className='h-10 w-10'>
                      <AvatarImage
                        src={rating.giver.avatar || rating.giver.profilePicture}
                        alt={rating.giver.fullName}
                      />
                      <AvatarFallback>{rating.giver.fullName.charAt(0)}</AvatarFallback>
                    </Avatar>
                    <div>
                      <p className='font-semibold text-gray-900'>
                        {rating.giver.fullName}
                      </p>
                      <p className='text-xs text-gray-500'>
                        {formatReadableDate(rating.createdAt)}
                      </p>
                    </div>
                  </div>
                  <div
                    className={`flex items-center gap-1 px-3 py-1 rounded-full ${
                      rating.value === 1
                        ? 'bg-green-100 text-green-700'
                        : 'bg-red-100 text-red-700'
                    }`}>
                    {rating.value === 1 ? (
                      <>
                        <ThumbsUp className='h-4 w-4' />
                        <span className='text-sm font-medium'>Positive</span>
                      </>
                    ) : (
                      <>
                        <ThumbsDown className='h-4 w-4' />
                        <span className='text-sm font-medium'>Negative</span>
                      </>
                    )}
                  </div>
                </div>
                <p className='text-gray-700 ml-13'>{rating.comment}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

export default Rating
