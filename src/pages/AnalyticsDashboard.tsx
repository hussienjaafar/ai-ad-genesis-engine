
import React, { useState } from 'react';
import { useParams } from 'react-router-dom';
import { format } from 'date-fns';
import MainLayout from '@/components/Layout/MainLayout';
import { usePerformanceMetrics, usePerformanceInsights } from '@/hooks/useAnalytics';
import PerformanceMetrics from '@/components/Analytics/PerformanceMetrics';
import PerformanceChart from '@/components/Analytics/PerformanceChart';
import InsightsPanel from '@/components/Analytics/InsightsPanel';
import TopPatternsTable from '@/components/Analytics/TopPatternsTable';
import { GenerateFromInsightModal } from '@/components/Analytics/GenerateFromInsightModal';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { CircleHelp, CalendarClock } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

export default function AnalyticsDashboard() {
  const { id } = useParams<{ id: string }>();
  const businessId = id || '';
  
  const [selectedInsight, setSelectedInsight] = useState<string | null>(null);
  
  const { 
    data: performanceData, 
    isLoading: isLoadingMetrics, 
    error: metricsError 
  } = usePerformanceMetrics(businessId);

  const { 
    data: insights, 
    isLoading: isLoadingInsights, 
    error: insightsError 
  } = usePerformanceInsights(businessId);

  const isLoading = isLoadingMetrics || isLoadingInsights;
  const lastUpdated = performanceData?.lastUpdated || null;
  const kpis = performanceData?.kpis || null;
  const patternInsights = insights?.patternInsights || []; // Use patternInsights instead of patterns

  if (!businessId) {
    return (
      <MainLayout>
        <Alert>
          <AlertDescription>
            Please select a business to view analytics.
          </AlertDescription>
        </Alert>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Analytics</h1>
            <p className="text-muted-foreground">
              Track your ad performance and discover patterns
            </p>
          </div>
          
          {/* Data freshness indicator */}
          {lastUpdated && (
            <div className="flex items-center text-sm text-muted-foreground">
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger>
                    <div className="flex items-center gap-2">
                      <CalendarClock className="h-4 w-4" />
                      <span>
                        Data as of {format(new Date(lastUpdated), 'yyyy-MM-dd HH:mm')}
                      </span>
                      <CircleHelp className="h-4 w-4" />
                    </div>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Data is refreshed daily through our ETL process</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
              
              {new Date(lastUpdated).getTime() < Date.now() - 86400000 * 3 && (
                <Badge variant="outline" className="ml-2 text-amber-500 border-amber-500">
                  Data is more than 3 days old
                </Badge>
              )}
            </div>
          )}
        </div>

        {isLoading ? (
          <div className="grid gap-4 md:grid-cols-2">
            {/* Loading skeletons */}
            <div className="border rounded-lg p-4 h-[300px] bg-muted/10 animate-pulse" />
            <div className="border rounded-lg p-4 h-[300px] bg-muted/10 animate-pulse" />
            <div className="border rounded-lg p-4 h-[300px] bg-muted/10 animate-pulse md:col-span-2" />
          </div>
        ) : (
          <>
            <PerformanceMetrics 
              isLoading={isLoadingMetrics} 
              error={metricsError} 
              performanceData={performanceData} 
            />
            <div className="grid gap-4 md:grid-cols-2">
              <PerformanceChart 
                data={performanceData?.daily || []} 
                days={30} 
              />
              <InsightsPanel 
                isLoading={isLoadingInsights} 
                error={insightsError} 
                insightsData={insights} 
              />
              <TopPatternsTable 
                insights={patternInsights} 
              />
            </div>
            
            {selectedInsight && (
              <GenerateFromInsightModal 
                isOpen={!!selectedInsight} 
                onClose={() => setSelectedInsight(null)}
                insight={insights?.patternInsights.find(i => i._id === selectedInsight) || null}
              />
            )}
          </>
        )}
      </div>
    </MainLayout>
  );
}
