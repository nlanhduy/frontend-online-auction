// components/admin/TopUsersList.tsx
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'

interface TopUser {
  id: string
  fullName: string
  email: string
  avatar: string | null
  totalBids?: number
  wonAuctions?: number
  totalSpent?: number
  totalSales?: number
  revenue?: number
  productCount?: number
}

interface TopUsersListProps {
  users?: TopUser[]
  title: string
  description: string
  icon: React.ComponentType<React.SVGProps<SVGSVGElement>>
  type: 'bidder' | 'seller'
}

export const TopUsersList = ({
  users,
  title,
  description,
  icon: Icon,
  type,
}: TopUsersListProps) => (
  <Card>
    <CardHeader>
      <CardTitle className='flex items-center gap-2'>
        <Icon className='h-5 w-5' />
        {title}
      </CardTitle>
      <CardDescription>{description}</CardDescription>
    </CardHeader>
    <CardContent>
      <div className='space-y-4'>
        {users?.map((user, index) => (
          <div key={user.id} className='flex items-center gap-4'>
            <div className='text-xl font-bold text-muted-foreground w-6'>
              #{index + 1}
            </div>
            <img
              src={
                user.avatar ||
                `https://ui-avatars.com/api/?name=${encodeURIComponent(user.fullName)}`
              }
              alt={user.fullName}
              className='h-10 w-10 rounded-full'
            />
            <div className='flex-1 min-w-0'>
              <div className='font-medium truncate'>{user.fullName}</div>
              <div className='text-sm text-muted-foreground truncate'>{user.email}</div>
            </div>
            <div className='text-right'>
              {type === 'bidder' ? (
                <>
                  <div className='font-bold'>{user.totalBids} bids</div>
                  <div className='text-sm text-muted-foreground'>
                    ${user.totalSpent?.toFixed(2)} spent
                  </div>
                </>
              ) : (
                <>
                  <div className='font-bold'>${user.revenue?.toFixed(2)}</div>
                  <div className='text-sm text-muted-foreground'>
                    {user.totalSales} sales · {user.productCount} products
                  </div>
                </>
              )}
            </div>
          </div>
        ))}
      </div>
    </CardContent>
  </Card>
)
