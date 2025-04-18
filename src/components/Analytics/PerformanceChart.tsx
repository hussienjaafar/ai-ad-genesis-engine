
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { DailyMetric } from "@/interfaces/analytics";

interface PerformanceChartProps {
  data: DailyMetric[];
  timeframe: number;
}

const PerformanceChart = ({ data, timeframe }: PerformanceChartProps) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Performance Trends ({timeframe} days)</CardTitle>
        <CardDescription>
          Daily metrics for your ad campaigns
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={data}
              margin={{
                top: 5,
                right: 30,
                left: 20,
                bottom: 5,
              }}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="_id.date" />
              <YAxis yAxisId="left" />
              <YAxis yAxisId="right" orientation="right" />
              <Tooltip />
              <Legend />
              <Bar yAxisId="left" dataKey="metrics.clicks" name="Clicks" fill="#4f46e5" />
              <Bar yAxisId="right" dataKey="metrics.impressions" name="Impressions" fill="#10b981" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
};

export default PerformanceChart;
