export interface Rating {
  id: string
  value: 1 | -1
  comment: string
  createdAt: string
  giverId: string
  receiverId: string
  giver: {
    id: string
    fullName: string
    avatar: string
    profilePicture?: string
  }
}

export interface RatingData {
  positiveRating: number
  negativeRating: number
  totalRatings: number
  positivePercentage: number
  ratings: Rating[]
}
