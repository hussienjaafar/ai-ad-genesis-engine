
import { Card, CardContent } from "@/components/ui/card";
import { ArrowDownIcon, ArrowUpIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface KpiCardProps {
  title: string;
  value: number;
  change: number;
  unit: "percentage" | "currency" | "number";
  currency?: string;
  isPositiveGood?: boolean;
}

const KpiCard = ({ title, value, change, unit, currency = "USD", isPositiveGood = true }: KpiCardProps) => {
  const isPositive = change > 0;
  const isGood = isPositive === isPositiveGood;
  
  const formatValue = (value: number, unit: string, currency?: string) => {
    if (unit === "currency" && currency) {
      return new Intl.NumberFormat(undefined, { 
        style: "currency", 
        currency,
        maximumFractionDigits: 2 
      }).format(value);
    } else if (unit === "percentage") {
      return `${value.toFixed(2)}%`;
    } else {
      return value.toFixed(2);
    }
  };

  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex flex-col">
          <p className="text-sm font-medium text-muted-foreground">{title}</p>
          <div className="mt-2 flex items-baseline">
            <h3 className="text-2xl font-semibold">
              {formatValue(value, unit, currency)}
            </h3>
            <div className={cn(
              "ml-2 flex items-baseline text-sm",
              isGood ? "text-green-600" : "text-red-600"
            )}>
              {isPositive ? (
                <ArrowUpIcon className="h-3 w-3 mr-1" />
              ) : (
                <ArrowDownIcon className="h-3 w-3 mr-1" />
              )}
              <span>
                {Math.abs(change).toFixed(1)}%
              </span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default KpiCard;
