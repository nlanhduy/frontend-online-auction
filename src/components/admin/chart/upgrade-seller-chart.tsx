import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from 'recharts'

// components/admin/UpgradeRequestsChart.tsx
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

interface UpgradeRequests {
  pending: number
  approved: number
  rejected: number
}

interface UpgradeRequestsChartProps {
  data?: UpgradeRequests
}

export const UpgradeRequestsChart = ({ data }: UpgradeRequestsChartProps) => {
  const config = {
    pending: { label: 'Pending', color: 'var(--chart-1)' },
    approved: { label: 'Approved', color: 'var(--chart-2)' },
    rejected: { label: 'Rejected', color: 'var(--chart-3)' },
  }

  const chartData = data
    ? [
        {
          name: 'Upgrade Requests',
          pending: data.pending,
          approved: data.approved,
          rejected: data.rejected,
        },
      ]
    : []

  return (
    <Card>
      <CardHeader>
        <CardTitle>Upgrade Requests</CardTitle>
        <CardDescription>Seller upgrade request status</CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer config={config} className='h-[300px] w-full'>
          <BarChart data={chartData} layout='vertical'>
            <CartesianGrid horizontal={false} />
            <XAxis type='number' />
            <YAxis type='category' dataKey='name' hide />

            <ChartTooltip content={<ChartTooltipContent />} />
            <ChartLegend content={<ChartLegendContent />} />

            <Bar dataKey='pending' fill={config.pending.color} radius={[0, 4, 4, 0]} />
            <Bar dataKey='approved' fill={config.approved.color} radius={[0, 4, 4, 0]} />
            <Bar dataKey='rejected' fill={config.rejected.color} radius={[0, 4, 4, 0]} />
          </BarChart>
        </ChartContainer>
      </CardContent>
    </Card>
  )
}
