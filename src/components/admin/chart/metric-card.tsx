// components/admin/MetricCard.tsx
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

interface MetricCardProps {
  title: string
  value: string | number
  subtitle: string
  icon: React.ComponentType<React.SVGProps<SVGSVGElement>>
}

export const MetricCard = ({ title, value, subtitle, icon: Icon }: MetricCardProps) => (
  <Card>
    <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
      <CardTitle className='text-sm font-medium'>{title}</CardTitle>
      <Icon className='h-4 w-4 text-muted-foreground' />
    </CardHeader>
    <CardContent>
      <div className='text-2xl font-bold'>{value}</div>
      <p className='text-xs text-muted-foreground'>{subtitle}</p>
    </CardContent>
  </Card>
)
