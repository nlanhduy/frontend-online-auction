export type Bid = {
  id: string
  amount: number
  createdAt: string
  rejected: boolean
  user: {
    id: string
    fullName: string
  }
}

export type Bids = Bid[]
