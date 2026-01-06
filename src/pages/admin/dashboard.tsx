import {
  Award,
  DollarSign,
  Gavel,
  Package,
  ShoppingCart,
  TrendingUp,
  Users,
} from 'lucide-react'

import { AuctionPerformanceChart } from '@/components/admin/chart/auction-performance-chart'
import { CategoryStatsChart } from '@/components/admin/chart/category-stats-chart'
import { MetricCard } from '@/components/admin/chart/metric-card'
import { RevenueChart } from '@/components/admin/chart/revenue-chart'
import { TopSellersGroupedBarChart } from '@/components/admin/chart/top-seller-grouped-bar-chart'
import { TopUsersList } from '@/components/admin/chart/top-user-list'
import { UpgradeRequestsChart } from '@/components/admin/chart/upgrade-seller-chart'
import { UserGrowthChart } from '@/components/admin/chart/user-growth-chart'
import { QUERY_KEYS } from '@/constants/queryKey'
import { AdminAPI } from '@/services/api/admin.api'
// pages/admin/AdminDashboard.tsx
import { useQuery } from '@tanstack/react-query'

export const AdminDashboard = () => {
  const statsQuery = useQuery({
    queryKey: QUERY_KEYS.admin.stats,
    queryFn: async () => {
      const response = await AdminAPI.getDashboardStats({})
      return response.data
    },
    staleTime: 1000 * 60 * 5,
  })

  const userGrowthQuery = useQuery({
    queryKey: QUERY_KEYS.admin.userGrowth,
    queryFn: async () => {
      const response = await AdminAPI.getDashboardUserGrowth({})
      return response.data
    },
    staleTime: 1000 * 60 * 5,
  })

  const auctionsStatsQuery = useQuery({
    queryKey: QUERY_KEYS.admin.auctionsStats,
    queryFn: async () => {
      const response = await AdminAPI.getDashboardAuctionsStats({})
      return response.data
    },
    staleTime: 1000 * 60 * 5,
  })

  const stats = statsQuery.data
  const userGrowth = userGrowthQuery.data
  const auctionsStats = auctionsStatsQuery.data

  if (statsQuery.isLoading || userGrowthQuery.isLoading || auctionsStatsQuery.isLoading) {
    return (
      <div className='flex items-center justify-center h-screen'>
        <div className='text-lg'>Loading dashboard...</div>
      </div>
    )
  }

  return (
    <div className='space-y-8 py-12 container mx-auto'>
      <div>
        <h1 className='text-3xl font-bold tracking-tight'>Admin Dashboard</h1>
        <p className='text-muted-foreground'>Overview of your auction platform</p>
      </div>

      <div className='grid gap-4 md:grid-cols-2 lg:grid-cols-4'>
        <MetricCard
          title='Total Revenue'
          value={`$${stats?.totalRevenue?.toFixed(2)}`}
          subtitle={`Platform: $${stats?.platformRevenue?.toFixed(2)}`}
          icon={DollarSign}
        />
        <MetricCard
          title='Orders'
          value={stats?.totalOrders || 0}
          subtitle={`${stats?.completedOrders} completed`}
          icon={ShoppingCart}
        />
        <MetricCard
          title='Total Users'
          value={stats?.totalUsers || 0}
          subtitle={`+${stats?.newUsers} new users`}
          icon={Users}
        />
        <MetricCard
          title='Active Products'
          value={stats?.activeProducts || 0}
          subtitle={`${stats?.completedProducts} completed`}
          icon={Package}
        />
      </div>

      <div className='grid gap-4 md:grid-cols-2'>
        <RevenueChart data={stats?.revenueByDay || []} />
        <UserGrowthChart data={userGrowth} />
      </div>

      <div className='grid gap-4 md:grid-cols-2'>
        <CategoryStatsChart data={stats?.categoryStats || []} />
        <TopSellersGroupedBarChart data={stats?.topSellers} />
      </div>

      <div className='grid gap-4 md:grid-cols-2'>
        <AuctionPerformanceChart data={auctionsStats} />
        <UpgradeRequestsChart data={stats?.upgradeRequests} />
      </div>

      <div className='grid gap-4 md:grid-cols-2'>
        <TopUsersList
          users={stats?.topBidders}
          title='Top Bidders'
          description='Most active bidders on the platform'
          icon={Award}
          type='bidder'
        />
        <TopUsersList
          users={stats?.topSellers}
          title='Top Sellers'
          description='Highest performing sellers'
          icon={TrendingUp}
          type='seller'
        />
      </div>

      <div className='grid gap-4 md:grid-cols-3'>
        <MetricCard
          title='Total Bids'
          value={stats?.totalBids || 0}
          subtitle={`Avg ${stats?.avgBidsPerProduct?.toFixed(2)} per product`}
          icon={Gavel}
        />
        <MetricCard
          title='Total Sellers'
          value={stats?.totalSellers || 0}
          subtitle={`+${stats?.newSellers} new sellers`}
          icon={Users}
        />
        <MetricCard
          title='New Products'
          value={stats?.newProducts || 0}
          subtitle={`${stats?.activeProducts} currently active`}
          icon={Package}
        />
      </div>
    </div>
  )
}
