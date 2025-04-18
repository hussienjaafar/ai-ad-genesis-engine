
import { useState } from "react";
import MainLayout from "../components/Layout/MainLayout";
import PageHeader from "../components/Common/PageHeader";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { usePerformanceMetrics, usePerformanceInsights } from "@/hooks/useAnalytics";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import PerformanceMetrics from "@/components/Analytics/PerformanceMetrics";
import PerformanceChart from "@/components/Analytics/PerformanceChart";
import InsightsPanel from "@/components/Analytics/InsightsPanel";

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
          <PerformanceMetrics 
            isLoading={isLoadingPerformance}
            error={performanceError}
            performanceData={performanceData}
          />
          {performanceData && (
            <PerformanceChart 
              data={performanceData.data}
              timeframe={timeframe}
            />
          )}
        </TabsContent>
        
        <TabsContent value="insights" className="space-y-6">
          <InsightsPanel 
            isLoading={isLoadingInsights}
            error={insightsError}
            insightsData={insightsData}
          />
        </TabsContent>
      </Tabs>
    </MainLayout>
  );
};

export default AnalyticsDashboard;
