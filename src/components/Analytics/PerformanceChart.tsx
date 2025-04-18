
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "@/components/ui/card";
import { 
  LineChart, Line, BarChart, Bar, XAxis, YAxis, 
  CartesianGrid, Tooltip, Legend, ResponsiveContainer 
} from "recharts";
import { DailyMetric } from "@/interfaces/analytics";

interface PerformanceChartProps {
  data: DailyMetric[];
  days: number;
}

const PerformanceChart = ({ data, days }: PerformanceChartProps) => {
  return (
    <Card className="col-span-2">
      <CardHeader>
        <CardTitle>Performance Trends</CardTitle>
        <CardDescription>
          Last {days} days of campaign performance
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="h-96">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart
              data={data}
              margin={{
                top: 10,
                right: 30,
                left: 10,
                bottom: 30,
              }}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis 
                dataKey="date" 
                angle={-45}
                textAnchor="end"
                tick={{ fontSize: 12 }}
                height={70}
              />
              <YAxis yAxisId="left" orientation="left" stroke="#8884d8" />
              <YAxis yAxisId="right" orientation="right" stroke="#82ca9d" />
              <Tooltip />
              <Legend />
              <Line 
                yAxisId="left"
                type="monotone" 
                dataKey="ctr" 
                name="CTR (%)" 
                stroke="#8884d8" 
                activeDot={{ r: 8 }}
                strokeWidth={2}
              />
              <Line 
                yAxisId="right"
                type="monotone" 
                dataKey="spend" 
                name="Spend ($)" 
                stroke="#82ca9d" 
                strokeWidth={2}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
};

export default PerformanceChart;
