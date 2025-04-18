
import { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import MainLayout from "../components/Layout/MainLayout";
import PageHeader from "../components/Common/PageHeader";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { usePerformanceMetrics, usePerformanceInsights } from "@/hooks/useAnalytics";
import { Loader2, RefreshCw } from "lucide-react";
import { toast } from "sonner";
import KpiCard from "@/components/Analytics/KpiCard";
import PerformanceChart from "@/components/Analytics/PerformanceChart";
import TopPatternsTable from "@/components/Analytics/TopPatternsTable";

const AnalyticsDashboard = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const daysParam = searchParams.get("days");
  const [timeframe, setTimeframe] = useState<number>(daysParam ? parseInt(daysParam) : 30);
  const [businessId, setBusinessId] = useState<string>("123"); // In a real app, this would come from context
  
  const { 
    data: performanceData, 
    isLoading: isLoadingPerformance, 
    error: performanceError, 
    refetch: refetchPerformance 
  } = usePerformanceMetrics(businessId, timeframe);
  
  const { 
    data: insightsData, 
    isLoading: isLoadingInsights, 
    error: insightsError, 
    refetch: refetchInsights 
  } = usePerformanceInsights(businessId);
  
  useEffect(() => {
    if (daysParam && !isNaN(parseInt(daysParam))) {
      setTimeframe(parseInt(daysParam));
    }
  }, [daysParam]);

  const handleTimeframeChange = (days: number) => {
    setTimeframe(days);
    setSearchParams({ days: days.toString() });
  };

  const handleRefresh = () => {
    refetchPerformance();
    refetchInsights();
    toast.success("Refreshing analytics data...");
  };

  if (isLoadingPerformance && !performanceData) {
    return (
      <MainLayout>
        <div className="flex h-screen items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </MainLayout>
    );
  }

  if (performanceError) {
    return (
      <MainLayout>
        <PageHeader 
          title="Analytics Dashboard" 
          description="Performance metrics and insights for your advertising"
        />
        <Card>
          <CardContent className="py-10">
            <div className="text-center">
              <p className="text-destructive mb-4">Error loading performance data</p>
              <Button onClick={() => refetchPerformance()}>Try Again</Button>
            </div>
          </CardContent>
        </Card>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="flex justify-between items-center mb-6">
        <PageHeader 
          title="Analytics Dashboard" 
          description="Performance metrics and insights for your advertising"
        />
        <Button onClick={handleRefresh} variant="outline" className="flex gap-2">
          <RefreshCw className="h-4 w-4" />
          Refresh Data
        </Button>
      </div>
      
      <div className="mb-6">
        <div className="inline-flex items-center rounded-md border border-input bg-background p-1 shadow-sm">
          <Button 
            variant={timeframe === 7 ? "default" : "ghost"} 
            className="rounded"
            onClick={() => handleTimeframeChange(7)}
          >
            7 Days
          </Button>
          <Button 
            variant={timeframe === 30 ? "default" : "ghost"}
            className="rounded"
            onClick={() => handleTimeframeChange(30)}
          >
            30 Days
          </Button>
          <Button 
            variant={timeframe === 90 ? "default" : "ghost"}
            className="rounded"
            onClick={() => handleTimeframeChange(90)}
          >
            90 Days
          </Button>
        </div>
      </div>
      
      {performanceData && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <KpiCard 
              title="Total Spend" 
              value={performanceData.kpis.spend}
              change={5.2} // Mock value for change - would come from API
              unit="currency"
              isPositiveGood={false}
            />
            <KpiCard 
              title="ROAS" 
              value={performanceData.kpis.roas}
              change={3.8}
              unit="number"
              isPositiveGood={true}
            />
            <KpiCard 
              title="CPL" 
              value={performanceData.kpis.cpl}
              change={-2.1}
              unit="currency"
              isPositiveGood={false}
            />
            <KpiCard 
              title="CTR" 
              value={performanceData.kpis.ctr}
              change={7.5}
              unit="percentage"
              isPositiveGood={true}
            />
          </div>
          
          <Tabs defaultValue="performance" className="space-y-6">
            <TabsList>
              <TabsTrigger value="performance">Performance</TabsTrigger>
              <TabsTrigger value="patterns">Patterns & Insights</TabsTrigger>
            </TabsList>
            
            <TabsContent value="performance" className="space-y-6">
              <PerformanceChart 
                data={performanceData.daily} 
                days={timeframe} 
              />
            </TabsContent>
            
            <TabsContent value="patterns" className="space-y-6">
              {isLoadingInsights && !insightsData ? (
                <div className="flex justify-center py-10">
                  <Loader2 className="h-6 w-6 animate-spin text-primary" />
                </div>
              ) : insightsError ? (
                <Card>
                  <CardContent className="py-10">
                    <div className="text-center">
                      <p className="text-destructive mb-4">Error loading insights data</p>
                      <Button onClick={() => refetchInsights()}>Try Again</Button>
                    </div>
                  </CardContent>
                </Card>
              ) : insightsData ? (
                <TopPatternsTable insights={insightsData.patternInsights} />
              ) : (
                <Card>
                  <CardContent className="py-10 text-center text-muted-foreground">
                    No insights data available
                  </CardContent>
                </Card>
              )}
            </TabsContent>
          </Tabs>
        </div>
      )}
    </MainLayout>
  );
};

export default AnalyticsDashboard;
