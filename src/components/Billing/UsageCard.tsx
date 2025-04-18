
import React from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { AreaChart, Tooltip, Area, ResponsiveContainer, XAxis } from 'recharts';
import { ArrowUpRight, InfoIcon } from 'lucide-react';
import { useUsage } from '@/hooks/useUsage';

interface UsageCardProps {
  businessId: string;
  className?: string;
}

export function UsageCard({ businessId, className }: UsageCardProps) {
  const { todayUsage, totalUsage, chartData, isLoading } = useUsage(businessId);

  if (isLoading) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle className="text-xl font-semibold">Usage</CardTitle>
          <CardDescription>Loading usage data...</CardDescription>
        </CardHeader>
      </Card>
    );
  }

  // Format numbers for display
  const formatNumber = (num: number) => {
    if (num >= 1000000) {
      return `${(num / 1000000).toFixed(1)}M`;
    } else if (num >= 1000) {
      return `${(num / 1000).toFixed(1)}K`;
    }
    return num.toString();
  };

  return (
    <Card className={className}>
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-xl font-semibold">Token Usage</CardTitle>
          <span className="text-xs text-muted-foreground">Last 30 days</span>
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 gap-4 mb-2">
          <div>
            <p className="text-sm font-medium text-muted-foreground mb-1">Today</p>
            <p className="text-2xl font-bold">{formatNumber(todayUsage.tokensConsumed)}</p>
            <div className="flex items-center text-xs text-muted-foreground mt-1">
              <ArrowUpRight className="h-3 w-3 mr-1" />
              <span>Tokens used today</span>
            </div>
          </div>
          <div>
            <p className="text-sm font-medium text-muted-foreground mb-1">Month to Date</p>
            <p className="text-2xl font-bold">{formatNumber(totalUsage)}</p>
            <div className="flex items-center text-xs text-muted-foreground mt-1">
              <InfoIcon className="h-3 w-3 mr-1" />
              <span>Total tokens this month</span>
            </div>
          </div>
        </div>
        
        {/* Token usage sparkline chart */}
        <div className="h-24 mt-4">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart
              data={chartData}
              margin={{ top: 0, right: 0, left: 0, bottom: 0 }}
            >
              <defs>
                <linearGradient id="colorTokens" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#2563eb" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#2563eb" stopOpacity={0} />
                </linearGradient>
              </defs>
              <XAxis 
                dataKey="date" 
                hide 
              />
              <Tooltip 
                formatter={(value: number) => [`${value} tokens`, 'Usage']}
                labelFormatter={(label) => `Date: ${label}`}
              />
              <Area 
                type="monotone" 
                dataKey="tokens" 
                stroke="#2563eb" 
                fillOpacity={1}
                fill="url(#colorTokens)" 
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}
