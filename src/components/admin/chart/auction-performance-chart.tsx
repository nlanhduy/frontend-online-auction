import { Legend, PolarGrid, RadialBar, RadialBarChart } from 'recharts'

// components/admin/AuctionPerformanceChart.tsx
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart'

interface AuctionStats {
  total: number
  completed: number
  withWinner: number
  cancelled: number
  completionRate: number
  successRate: number
}

interface AuctionPerformanceChartProps {
  data?: AuctionStats
}

export const AuctionPerformanceChart = ({ data }: AuctionPerformanceChartProps) => {
  const radialData = [
    {
      name: 'Completion Rate',
      value: data?.completionRate || 0,
      fill: 'var(--chart-1)',
    },
    {
      name: 'Success Rate',
      value: data?.successRate || 0,
      fill: 'var(--chart-2)',
    },
  ]

  return (
    <Card>
      <CardHeader>
        <CardTitle>Auction Performance</CardTitle>
        <CardDescription>Completion and success rates</CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer config={{}} className='h-[300px] w-full'>
          <RadialBarChart
            data={radialData}
            innerRadius='30%'
            outerRadius='100%'
            startAngle={90}
            endAngle={-270}>
            <PolarGrid gridType='circle' />
            <RadialBar dataKey='value' cornerRadius={10} />
            <ChartTooltip content={<ChartTooltipContent />} />
            <Legend
              iconSize={10}
              layout='vertical'
              verticalAlign='middle'
              align='right'
            />
          </RadialBarChart>
        </ChartContainer>
        <div className='mt-4 grid grid-cols-3 gap-4 text-center'>
          <div>
            <div className='text-2xl font-bold'>{data?.total}</div>
            <div className='text-xs text-muted-foreground'>Total</div>
          </div>
          <div>
            <div className='text-2xl font-bold'>{data?.completed}</div>
            <div className='text-xs text-muted-foreground'>Completed</div>
          </div>
          <div>
            <div className='text-2xl font-bold'>{data?.withWinner}</div>
            <div className='text-xs text-muted-foreground'>With Winner</div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
