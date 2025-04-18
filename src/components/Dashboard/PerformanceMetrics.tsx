
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  AreaChart,
  Area,
  BarChart,
  Bar,
  Legend,
} from "recharts";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

// Mock data for charts
const dailyData = [
  { name: "Apr 10", impressions: 25600, clicks: 1020, conversions: 35, ctr: 3.98 },
  { name: "Apr 11", impressions: 28400, clicks: 1180, conversions: 42, ctr: 4.15 },
  { name: "Apr 12", impressions: 27200, clicks: 1240, conversions: 38, ctr: 4.56 },
  { name: "Apr 13", impressions: 32100, clicks: 1350, conversions: 44, ctr: 4.21 },
  { name: "Apr 14", impressions: 30500, clicks: 1280, conversions: 40, ctr: 4.19 },
  { name: "Apr 15", impressions: 29800, clicks: 1320, conversions: 43, ctr: 4.43 },
  { name: "Apr 16", impressions: 31200, clicks: 1390, conversions: 45, ctr: 4.45 },
];

const platformData = [
  { name: "Facebook", impressions: 85600, clicks: 3820, conversions: 115, ctr: 4.46 },
  { name: "Google", impressions: 112400, clicks: 4580, conversions: 132, ctr: 4.07 },
  { name: "TikTok", impressions: 45200, clicks: 1840, conversions: 48, ctr: 4.07 },
];

const PerformanceMetrics = () => {
  return (
    <Tabs defaultValue="daily" className="w-full">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold">Performance Metrics</h2>
        <TabsList>
          <TabsTrigger value="daily">Daily</TabsTrigger>
          <TabsTrigger value="weekly">Weekly</TabsTrigger>
          <TabsTrigger value="monthly">Monthly</TabsTrigger>
          <TabsTrigger value="platform">By Platform</TabsTrigger>
        </TabsList>
      </div>

      <TabsContent value="daily" className="animate-fade-in">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-md">Impressions & Clicks</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart
                    data={dailyData}
                    margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
                    <XAxis dataKey="name" />
                    <YAxis yAxisId="left" />
                    <YAxis yAxisId="right" orientation="right" />
                    <Tooltip />
                    <Legend />
                    <Line
                      yAxisId="left"
                      type="monotone"
                      dataKey="impressions"
                      stroke="#009aff"
                      activeDot={{ r: 8 }}
                      strokeWidth={2}
                    />
                    <Line
                      yAxisId="right"
                      type="monotone"
                      dataKey="clicks"
                      stroke="#00c4c9"
                      strokeWidth={2}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-md">Conversions & CTR</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart
                    data={dailyData}
                    margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
                    <XAxis dataKey="name" />
                    <YAxis yAxisId="left" />
                    <YAxis yAxisId="right" orientation="right" />
                    <Tooltip />
                    <Legend />
                    <Area
                      yAxisId="left"
                      type="monotone"
                      dataKey="conversions"
                      fill="#00cd41"
                      stroke="#00cd41"
                      fillOpacity={0.3}
                    />
                    <Area
                      yAxisId="right"
                      type="monotone"
                      dataKey="ctr"
                      fill="#00c4c9"
                      stroke="#00c4c9"
                      fillOpacity={0.3}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </div>
      </TabsContent>

      <TabsContent value="weekly" className="animate-fade-in">
        <Card>
          <CardHeader>
            <CardTitle className="text-md">Weekly Performance Data</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-80 flex items-center justify-center text-muted-foreground">
              Select date range to view weekly data
            </div>
          </CardContent>
        </Card>
      </TabsContent>

      <TabsContent value="monthly" className="animate-fade-in">
        <Card>
          <CardHeader>
            <CardTitle className="text-md">Monthly Performance Data</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-80 flex items-center justify-center text-muted-foreground">
              Select date range to view monthly data
            </div>
          </CardContent>
        </Card>
      </TabsContent>

      <TabsContent value="platform" className="animate-fade-in">
        <Card>
          <CardHeader>
            <CardTitle className="text-md">Performance by Platform</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={platformData}
                  margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="impressions" fill="#009aff" name="Impressions" />
                  <Bar dataKey="clicks" fill="#00c4c9" name="Clicks" />
                  <Bar dataKey="conversions" fill="#00cd41" name="Conversions" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </TabsContent>
    </Tabs>
  );
};

export default PerformanceMetrics;
