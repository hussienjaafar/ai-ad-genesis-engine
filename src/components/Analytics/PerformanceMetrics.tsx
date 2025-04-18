
import { Card, CardContent } from "@/components/ui/card";
import { Loader2 } from "lucide-react";
import MetricCard from "@/components/Common/MetricCard";
import { PerformanceMetric } from "@/interfaces/types";
import { PerformanceMetrics as IPerformanceMetrics } from "@/interfaces/analytics";

interface PerformanceMetricsProps {
  isLoading: boolean;
  error: any;
  performanceData: IPerformanceMetrics | null;
}

const PerformanceMetrics = ({ isLoading, error, performanceData }: PerformanceMetricsProps) => {
  if (isLoading) {
    return (
      <div className="h-40 flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (error) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="text-center text-destructive">
            Error loading performance data. Please try again.
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!performanceData) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="text-center text-muted-foreground">
            No performance data available yet.
          </div>
        </CardContent>
      </Card>
    );
  }

  const metrics: PerformanceMetric[] = [
    {
      id: "impressions",
      name: "Impressions",
      value: performanceData.totals.impressions || 0,
      change: 10,
      unit: "number",
      isPositiveGood: true
    },
    {
      id: "clicks",
      name: "Clicks",
      value: performanceData.totals.clicks || 0,
      change: 5,
      unit: "number",
      isPositiveGood: true
    },
    {
      id: "ctr",
      name: "CTR",
      value: (performanceData.totals.ctr || 0) * 100,
      change: 2,
      unit: "percentage",
      isPositiveGood: true
    },
    {
      id: "spend",
      name: "Spend",
      value: performanceData.totals.spend || 0,
      change: -3,
      unit: "currency",
      currency: "USD",
      isPositiveGood: false
    }
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      {metrics.map((metric) => (
        <MetricCard key={metric.id} metric={metric} />
      ))}
    </div>
  );
};

export default PerformanceMetrics;
