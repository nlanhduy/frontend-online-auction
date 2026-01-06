import { Area, AreaChart, CartesianGrid, XAxis, YAxis } from 'recharts'

// components/admin/RevenueChart.tsx
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

interface RevenueData {
  date: string
  revenue: number
  orderCount: number
}

interface RevenueChartProps {
  data: RevenueData[]
}

export const RevenueChart = ({ data }: RevenueChartProps) => {
  const config = {
    revenue: { label: 'Revenue', color: 'var(--chart-1)' },
    orderCount: { label: 'Orders', color: 'var(--chart-2)' },
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Revenue by Day</CardTitle>
        <CardDescription>Daily revenue and order count</CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer config={config} className='h-[300px] w-full'>
          <AreaChart data={data}>
            <CartesianGrid strokeDasharray='3 3' />
            <XAxis
              dataKey='date'
              tickFormatter={value =>
                new Date(value).toLocaleDateString('en-US', {
                  month: 'short',
                  day: 'numeric',
                })
              }
            />
            <YAxis yAxisId='left' />
            <YAxis yAxisId='right' orientation='right' />
            <ChartTooltip content={<ChartTooltipContent />} />
            <ChartLegend content={<ChartLegendContent />} />
            <Area
              yAxisId='left'
              type='monotone'
              dataKey='revenue'
              stroke='var(--color-revenue)'
              fill='var(--color-revenue)'
              fillOpacity={0.6}
            />
            <Area
              yAxisId='right'
              type='monotone'
              dataKey='orderCount'
              stroke='var(--color-orderCount)'
              fill='var(--color-orderCount)'
              fillOpacity={0.6}
            />
          </AreaChart>
        </ChartContainer>
      </CardContent>
    </Card>
  )
}
