import { Area, AreaChart, CartesianGrid, XAxis, YAxis } from 'recharts'

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

interface UserGrowthData {
  date: string
  bidders: number
  sellers: number
  total: number
}

interface UserGrowthChartProps {
  data?: UserGrowthData[]
}

export const UserGrowthChart = ({ data }: UserGrowthChartProps) => {
  const config = {
    bidders: {
      label: 'Bidders',
      color: 'var(--chart-1)',
    },
    sellers: {
      label: 'Sellers',
      color: 'var(--chart-2)',
    },
    total: {
      label: 'Total',
      color: 'var(--chart-3)',
    },
  }

  const filteredData =
    data
      ?.filter(item => item.bidders > 0 || item.sellers > 0 || item.total > 0)
      .map(item => ({
        ...item,
        dateFormatted: new Date(item.date).toLocaleDateString('en-US', {
          month: 'short',
          day: 'numeric',
        }),
      })) || []

  return (
    <Card>
      <CardHeader>
        <CardTitle>User Growth</CardTitle>
        <CardDescription>New user registrations over time</CardDescription>
      </CardHeader>
      <CardContent>
        {filteredData.length > 0 ? (
          <ChartContainer config={config} className='h-[300px] w-full'>
            <AreaChart data={filteredData}>
              <CartesianGrid strokeDasharray='3 3' />

              <XAxis
                dataKey='dateFormatted'
                tickLine={false}
                tickMargin={10}
                axisLine={false}
              />
              <YAxis />

              <ChartTooltip content={<ChartTooltipContent />} />
              <ChartLegend content={<ChartLegendContent />} />

              <Area
                type='monotone'
                dataKey='total'
                stroke={config.total.color}
                fill={config.total.color}
                fillOpacity={0.12}
              />

              <Area
                type='monotone'
                dataKey='bidders'
                stroke={config.bidders.color}
                fill={config.bidders.color}
                fillOpacity={0.3}
              />

              <Area
                type='monotone'
                dataKey='sellers'
                stroke={config.sellers.color}
                fill={config.sellers.color}
                fillOpacity={0.3}
              />
            </AreaChart>
          </ChartContainer>
        ) : (
          <div className='h-[300px] flex items-center justify-center text-muted-foreground'>
            No user growth data available yet
          </div>
        )}
      </CardContent>
    </Card>
  )
}
