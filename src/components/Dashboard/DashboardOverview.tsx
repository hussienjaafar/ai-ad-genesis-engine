
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { mockPerformanceMetrics, mockAdInsights } from "@/lib/mockData";
import MetricCard from "../Common/MetricCard";
import { Badge } from "@/components/ui/badge";
import { AlertTriangleIcon, LightbulbIcon, InfoIcon } from "lucide-react";

const DashboardOverview = () => {
  const topMetrics = mockPerformanceMetrics.slice(0, 4);
  const insights = mockAdInsights.slice(0, 3);

  const getInsightIcon = (type: string) => {
    switch (type) {
      case "opportunity":
        return <LightbulbIcon className="h-5 w-5 text-brand-600" />;
      case "issue":
        return <AlertTriangleIcon className="h-5 w-5 text-destructive" />;
      default:
        return <InfoIcon className="h-5 w-5 text-insight-500" />;
    }
  };

  const getImpactBadge = (impact: string) => {
    switch (impact) {
      case "high":
        return <Badge variant="destructive">High Impact</Badge>;
      case "medium":
        return <Badge variant="outline" className="border-amber-500 text-amber-700">Medium Impact</Badge>;
      default:
        return <Badge variant="outline">Low Impact</Badge>;
    }
  };

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-xl font-semibold mb-4">Performance Overview</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {topMetrics.map((metric) => (
            <MetricCard key={metric.id} metric={metric} />
          ))}
        </div>
      </div>

      <div>
        <h2 className="text-xl font-semibold mb-4">Key Insights</h2>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {insights.map((insight) => (
            <Card key={insight.id} className="card-hover">
              <CardHeader className="pb-2 flex flex-row items-center justify-between">
                <div className="flex space-x-2">
                  {getInsightIcon(insight.type)}
                  <CardTitle className="text-md">{insight.title}</CardTitle>
                </div>
                {getImpactBadge(insight.impact)}
              </CardHeader>
              <CardContent>
                <CardDescription className="text-foreground/70">
                  {insight.description}
                </CardDescription>
                {insight.actionable && (
                  <div className="mt-4">
                    <div className="text-sm text-brand-600 hover:text-brand-700 cursor-pointer font-medium">
                      Take action →
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
};

export default DashboardOverview;
