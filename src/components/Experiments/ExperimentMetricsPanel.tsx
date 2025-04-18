
import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { ExperimentResult } from "@/interfaces/experiment";
import { TrendingUp, TrendingDown, Users, MousePointer, CheckCircle } from "lucide-react";

interface ExperimentMetricsPanelProps {
  results: ExperimentResult;
}

const ExperimentMetricsPanel = ({ results }: ExperimentMetricsPanelProps) => {
  const { original, variant } = results.results;

  // Format percentage with + sign for positive values
  const formatPercentage = (value: number) => {
    const sign = value > 0 ? '+' : '';
    return `${sign}${value.toFixed(2)}%`;
  };

  // Format numbers with commas
  const formatNumber = (num: number) => {
    return new Intl.NumberFormat().format(Math.round(num));
  };

  // Format percentage (0-1) to show as percentage
  const formatRate = (rate: number) => {
    return (rate * 100).toFixed(2) + '%';
  };

  const getMetrics = () => [
    {
      name: "Conversions",
      originalValue: original.conversions,
      variantValue: variant.conversions,
      format: formatNumber,
      icon: CheckCircle,
      color: "text-green-500"
    },
    {
      name: "Impressions",
      originalValue: original.impressions,
      variantValue: variant.impressions,
      format: formatNumber,
      icon: Users,
      color: "text-blue-500"
    },
    {
      name: "Clicks",
      originalValue: original.clicks,
      variantValue: variant.clicks,
      format: formatNumber,
      icon: MousePointer,
      color: "text-purple-500"
    },
    {
      name: "Conversion Rate",
      originalValue: original.conversionRate,
      variantValue: variant.conversionRate,
      format: formatRate,
      icon: results.lift > 0 ? TrendingUp : TrendingDown,
      color: results.lift > 0 ? "text-green-500" : "text-red-500"
    }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {getMetrics().map((metric) => (
        <Card key={metric.name}>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between mb-2">
              <div className="text-sm font-medium text-muted-foreground">{metric.name}</div>
              <metric.icon className={`h-4 w-4 ${metric.color}`} />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <div className="text-xs text-muted-foreground uppercase mb-1">Original</div>
                <div className="text-2xl font-bold">{metric.format(metric.originalValue)}</div>
              </div>
              
              <div>
                <div className="text-xs text-muted-foreground uppercase mb-1">Variant</div>
                <div className="text-2xl font-bold">{metric.format(metric.variantValue)}</div>
              </div>
            </div>
            
            {metric.name === "Conversion Rate" && (
              <div className="mt-2 text-sm font-medium">
                <span className={results.lift > 0 ? "text-green-500" : "text-red-500"}>
                  {formatPercentage(results.lift)} lift
                </span>
              </div>
            )}
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

export default ExperimentMetricsPanel;
