import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from 'recharts'

// components/admin/CategoryStatsChart.tsx
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

interface CategoryData {
  category: string
  productCount: number
  totalRevenue: number
}

interface CategoryStatsChartProps {
  data: CategoryData[]
}

export const CategoryStatsChart = ({ data }: CategoryStatsChartProps) => {
  const config = {
    totalRevenue: { label: 'Revenue', color: 'var(--chart-1)' },
    productCount: { label: 'Products', color: 'var(--chart-2)' },
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Category Performance</CardTitle>
        <CardDescription>Revenue and products by category</CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer config={config} className='h-[300px] w-full'>
          <BarChart data={data}>
            <CartesianGrid vertical={false} />
            <XAxis
              dataKey='category'
              tickLine={false}
              tickMargin={10}
              axisLine={false}
              angle={-45}
              textAnchor='end'
              height={100}
            />
            <YAxis yAxisId='left' />
            <YAxis yAxisId='right' orientation='right' />
            <ChartTooltip content={<ChartTooltipContent />} />
            <ChartLegend content={<ChartLegendContent />} />
            <Bar
              yAxisId='left'
              dataKey='totalRevenue'
              fill={config.totalRevenue.color}
              radius={[4, 4, 0, 0]}
              name='Revenue'
            />
            <Bar
              yAxisId='right'
              dataKey='productCount'
              fill={config.productCount.color}
              radius={[4, 4, 0, 0]}
              name='Products'
            />
          </BarChart>
        </ChartContainer>
      </CardContent>
    </Card>
  )
}
