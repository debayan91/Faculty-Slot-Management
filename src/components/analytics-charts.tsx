'use client';

import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface SlotData {
  name: string;
  value: number;
}

interface AnalyticsChartsProps {
  slotsByStatus: SlotData[];
  slotsByDay: SlotData[];
}

// Linear-style colors - works in both light and dark mode
const COLORS_LIGHT = ['#171717', '#d4d4d4']; // Black and light gray
const COLORS_DARK = ['#fafafa', '#404040']; // White and dark gray

export function AnalyticsCharts({ slotsByStatus, slotsByDay }: AnalyticsChartsProps) {
  return (
    <div className='grid gap-4 md:grid-cols-2 lg:grid-cols-7'>
      <Card className='col-span-4 bg-card'>
        <CardHeader>
          <CardTitle className='text-sm font-medium'>Weekly Distribution</CardTitle>
        </CardHeader>
        <CardContent className='pl-2'>
          <ResponsiveContainer width='100%' height={300}>
            <BarChart data={slotsByDay}>
              <CartesianGrid strokeDasharray='3 3' vertical={false} className='stroke-border' />
              <XAxis
                dataKey='name'
                className='text-muted-foreground'
                fontSize={12}
                tickLine={false}
                axisLine={false}
              />
              <YAxis
                className='text-muted-foreground'
                fontSize={12}
                tickLine={false}
                axisLine={false}
              />
              <Tooltip
                cursor={{ className: 'fill-secondary' }}
                contentStyle={{
                  backgroundColor: 'hsl(var(--card))',
                  borderColor: 'hsl(var(--border))',
                  borderRadius: '6px',
                  color: 'hsl(var(--foreground))',
                }}
              />
              <Bar
                dataKey='value'
                name='Booked Slots'
                className='fill-foreground'
                radius={[4, 4, 0, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
      <Card className='col-span-3 bg-card'>
        <CardHeader>
          <CardTitle className='text-sm font-medium'>Booking Status</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width='100%' height={300}>
            <PieChart>
              <Pie
                data={slotsByStatus}
                cx='50%'
                cy='50%'
                innerRadius={60}
                outerRadius={80}
                paddingAngle={4}
                dataKey='value'
                stroke='none'
              >
                {slotsByStatus.map((entry, index) => (
                  <Cell
                    key={`cell-${index}`}
                    className={index === 0 ? 'fill-foreground' : 'fill-muted'}
                  />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{
                  backgroundColor: 'hsl(var(--card))',
                  borderColor: 'hsl(var(--border))',
                  borderRadius: '6px',
                  color: 'hsl(var(--foreground))',
                }}
              />
              <Legend
                verticalAlign='bottom'
                height={36}
                iconType='circle'
                formatter={(value) => <span className='text-foreground text-sm'>{value}</span>}
              />
            </PieChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  );
}
