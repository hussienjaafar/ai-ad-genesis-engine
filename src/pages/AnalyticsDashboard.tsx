
import { useState } from "react";
import MainLayout from "../components/Layout/MainLayout";
import PageHeader from "../components/Common/PageHeader";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { usePerformanceMetrics, usePerformanceInsights } from "@/hooks/useAnalytics";
import MetricCard from "@/components/Common/MetricCard";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

const AnalyticsDashboard = () => {
  const [businessId, setBusinessId] = useState("123"); // In a real app, this would come from context
  const [timeframe, setTimeframe] = useState(30); // Days
  
  const { data: performanceData, isLoading: isLoadingPerformance, error: performanceError, refetch: refetchPerformance } = 
    usePerformanceMetrics(businessId, timeframe);
  
  const { data: insightsData, isLoading: isLoadingInsights, error: insightsError, refetch: refetchInsights } = 
    usePerformanceInsights(businessId);
  
  const handleRefresh = () => {
    refetchPerformance();
    refetchInsights();
    toast.success("Refreshing analytics data...");
  };
  
  return (
    <MainLayout>
      <div className="flex justify-between items-center">
        <PageHeader 
          title="Analytics Dashboard" 
          description="Performance metrics and insights for your advertising"
        />
        <Button onClick={handleRefresh}>Refresh Data</Button>
      </div>
      
      <Tabs defaultValue="performance" className="space-y-6">
        <TabsList>
          <TabsTrigger value="performance">Performance</TabsTrigger>
          <TabsTrigger value="insights">Insights</TabsTrigger>
        </TabsList>
        
        <TabsContent value="performance" className="space-y-6">
          {isLoadingPerformance ? (
            <div className="h-40 flex items-center justify-center">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : performanceError ? (
            <Card>
              <CardContent className="pt-6">
                <div className="text-center text-destructive">
                  Error loading performance data. Please try again.
                </div>
              </CardContent>
            </Card>
          ) : !performanceData ? (
            <Card>
              <CardContent className="pt-6">
                <div className="text-center text-muted-foreground">
                  No performance data available yet.
                </div>
              </CardContent>
            </Card>
          ) : (
            <>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <MetricCard 
                  title="Impressions" 
                  value={performanceData.totals.impressions.toLocaleString()} 
                  trend={10}
                  icon="eye"
                />
                <MetricCard 
                  title="Clicks" 
                  value={performanceData.totals.clicks.toLocaleString()} 
                  trend={5}
                  icon="mouse-pointer"
                />
                <MetricCard 
                  title="CTR" 
                  value={`${(performanceData.totals.ctr * 100).toFixed(2)}%`}
                  trend={2}
                  icon="percent"
                />
                <MetricCard 
                  title="Spend" 
                  value={`$${performanceData.totals.spend.toFixed(2)}`}
                  trend={-3}
                  icon="dollar-sign"
                />
              </div>
              
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
                        data={performanceData.data}
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
            </>
          )}
        </TabsContent>
        
        <TabsContent value="insights" className="space-y-6">
          {isLoadingInsights ? (
            <div className="h-40 flex items-center justify-center">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : insightsError ? (
            <Card>
              <CardContent className="pt-6">
                <div className="text-center text-destructive">
                  Error loading insights. Please try again.
                </div>
              </CardContent>
            </Card>
          ) : !insightsData || !insightsData.patternInsights || insightsData.patternInsights.length === 0 ? (
            <Card>
              <CardContent className="pt-6">
                <div className="text-center text-muted-foreground">
                  No insights available yet. Run more ads to generate insights.
                </div>
              </CardContent>
            </Card>
          ) : (
            <>
              <Card>
                <CardHeader>
                  <CardTitle>Performance Insights</CardTitle>
                  <CardDescription>
                    Content patterns that deliver better performance
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {insightsData.patternInsights.map((insight: any, index: number) => (
                      <div key={index} className="border rounded-lg p-4">
                        <div className="flex justify-between items-start">
                          <div>
                            <p className="font-medium text-lg">{insight.element}</p>
                            <p className="text-sm text-muted-foreground capitalize">{insight.elementType}</p>
                          </div>
                          <div className="bg-primary/10 text-primary px-2 py-1 rounded">
                            +{(insight.performance.uplift * 100).toFixed(0)}% CTR
                          </div>
                        </div>
                        <div className="mt-2 grid grid-cols-2 gap-4">
                          <div>
                            <p className="text-sm text-muted-foreground">With Element</p>
                            <div className="grid grid-cols-2 gap-2 mt-1">
                              <div>
                                <p className="text-sm font-medium">CTR</p>
                                <p>{(insight.performance.withElement.ctr * 100).toFixed(2)}%</p>
                              </div>
                              <div>
                                <p className="text-sm font-medium">Sample</p>
                                <p>{insight.performance.withElement.sampleSize} ads</p>
                              </div>
                            </div>
                          </div>
                          <div>
                            <p className="text-sm text-muted-foreground">Without Element</p>
                            <div className="grid grid-cols-2 gap-2 mt-1">
                              <div>
                                <p className="text-sm font-medium">CTR</p>
                                <p>{(insight.performance.withoutElement.ctr * 100).toFixed(2)}%</p>
                              </div>
                              <div>
                                <p className="text-sm font-medium">Sample</p>
                                <p>{insight.performance.withoutElement.sampleSize} ads</p>
                              </div>
                            </div>
                          </div>
                        </div>
                        <p className="text-xs text-muted-foreground mt-2">
                          {(insight.performance.confidence * 100).toFixed(0)}% confidence level
                        </p>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </>
          )}
        </TabsContent>
      </Tabs>
    </MainLayout>
  );
};

export default AnalyticsDashboard;
