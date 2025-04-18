
import { PerformanceMetric } from '@/interfaces/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowDownIcon, ArrowUpIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

interface MetricCardProps {
  metric: PerformanceMetric;
}

const MetricCard = ({ metric }: MetricCardProps) => {
  const isPositive = metric.change > 0;
  const isGood = isPositive === metric.isPositiveGood;
  
  const formatValue = (value: number, unit: string, currency?: string) => {
    if (unit === 'currency' && currency) {
      return new Intl.NumberFormat('en-US', { 
        style: 'currency', 
        currency,
        maximumFractionDigits: 2 
      }).format(value);
    } else if (unit === 'percentage') {
      return `${value.toFixed(1)}%`;
    } else {
      return value >= 1000 
        ? `${(value / 1000).toFixed(1)}k` 
        : value.toFixed(1);
    }
  };

  return (
    <Card className="card-hover">
      <CardHeader className="pb-2">
        <CardTitle className="text-md font-medium">{metric.name}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">
          {formatValue(metric.value, metric.unit, metric.currency)}
        </div>
        <div className={cn(
          "flex items-center mt-2 text-sm",
          isGood ? "text-success-600" : "text-destructive"
        )}>
          {isPositive ? (
            <ArrowUpIcon className="h-4 w-4 mr-1" />
          ) : (
            <ArrowDownIcon className="h-4 w-4 mr-1" />
          )}
          <span>
            {Math.abs(metric.change).toFixed(1)}% {isGood ? "improved" : "worsened"}
          </span>
        </div>
      </CardContent>
    </Card>
  );
};

export default MetricCard;
