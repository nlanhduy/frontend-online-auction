'use client'

import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from 'recharts'

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import {
  ChartContainer,
  ChartLegend,
  ChartLegendContent,
  ChartTooltip,
  ChartTooltipContent,
} from '@/components/ui/chart'

import type { ChartConfig } from '@/components/ui/chart'

const chartConfig = {
  sales: {
    label: 'Sales',
    color: 'var(--chart-1)',
  },
  revenue: {
    label: 'Revenue ($)',
    color: 'var(--chart-2)',
  },
  products: {
    label: 'Products',
    color: 'var(--chart-3)',
  },
} satisfies ChartConfig

interface TopSeller {
  id: string
  fullName: string
  totalSales: number
  revenue: number
  productCount: number
}

interface Props {
  data?: TopSeller[]
}

export function TopSellersGroupedBarChart({ data }: Props) {
  const chartData =
    data?.slice(0, 5).map(seller => ({
      name: seller.fullName.split(' ')[0],
      sales: seller.totalSales,
      revenue: Math.round(seller.revenue / 100),
      products: seller.productCount,
    })) ?? []

  return (
    <Card>
      <CardHeader>
        <CardTitle>Top Sellers Performance</CardTitle>
        <CardDescription>Sales, revenue and product count comparison</CardDescription>
      </CardHeader>

      <CardContent>
        {chartData.length > 0 ? (
          <ChartContainer config={chartConfig} className='h-[350px] w-full'>
            <BarChart data={chartData}>
              <CartesianGrid vertical={false} />
              <XAxis dataKey='name' tickLine={false} axisLine={false} />
              <YAxis />

              <ChartTooltip content={<ChartTooltipContent />} />
              <ChartLegend content={<ChartLegendContent />} />

              <Bar dataKey='sales' fill='var(--color-sales)' radius={[4, 4, 0, 0]} />
              <Bar dataKey='revenue' fill='var(--color-revenue)' radius={[4, 4, 0, 0]} />
              <Bar
                dataKey='products'
                fill='var(--color-products)'
                radius={[4, 4, 0, 0]}
              />
            </BarChart>
          </ChartContainer>
        ) : (
          <div className='h-[350px] flex items-center justify-center text-muted-foreground'>
            No seller data available yet
          </div>
        )}
      </CardContent>
    </Card>
  )
}
