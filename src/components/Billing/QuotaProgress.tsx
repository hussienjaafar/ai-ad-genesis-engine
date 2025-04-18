
import React from 'react';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { AlertTriangle, CheckCircle } from 'lucide-react';
import { format } from 'date-fns';

interface QuotaProgressProps {
  currentUsage: number;
  quota: number;
  billingStatus: string;
  planName: string;
  periodEnd?: number;
  cancelAtPeriodEnd?: boolean;
  onChangePlan: () => void;
  onCancelPlan: () => void;
}

export function QuotaProgress({
  currentUsage,
  quota,
  billingStatus,
  planName,
  periodEnd,
  cancelAtPeriodEnd,
  onChangePlan,
  onCancelPlan,
}: QuotaProgressProps) {
  const percentUsed = Math.min(Math.round((currentUsage / quota) * 100), 100);
  
  // Format numbers for display
  const formatNumber = (num: number) => {
    if (num >= 1000000) {
      return `${(num / 1000000).toFixed(1)}M`;
    } else if (num >= 1000) {
      return `${(num / 1000).toFixed(1)}K`;
    }
    return num.toString();
  };

  const getStatusColor = () => {
    if (billingStatus === 'past_due') return 'text-red-500';
    if (billingStatus === 'canceled' || cancelAtPeriodEnd) return 'text-yellow-500';
    return 'text-green-500';
  };

  const getStatusMessage = () => {
    if (billingStatus === 'past_due') return 'Payment required';
    if (billingStatus === 'canceled') return 'Canceled';
    if (cancelAtPeriodEnd) return 'Will cancel at period end';
    return 'Active';
  };

  return (
    <Card>
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-xl font-semibold">Token Quota</CardTitle>
          <div className={`flex items-center ${getStatusColor()}`}>
            {billingStatus === 'past_due' ? (
              <AlertTriangle className="h-4 w-4 mr-1" />
            ) : (
              <CheckCircle className="h-4 w-4 mr-1" />
            )}
            <span className="text-sm font-medium">{getStatusMessage()}</span>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div>
            <div className="mb-1 flex items-center justify-between">
              <span className="text-sm font-medium">Current plan: <span className="font-bold">{planName}</span></span>
              {percentUsed >= 90 && (
                <span className="text-xs font-medium text-red-500">
                  {percentUsed === 100 ? "Quota reached" : "Quota almost reached"}
                </span>
              )}
            </div>
            <Progress value={percentUsed} className="h-2" />
            <div className="mt-1 flex justify-between text-xs text-muted-foreground">
              <span>{formatNumber(currentUsage)} tokens used</span>
              <span>{formatNumber(quota)} tokens limit</span>
            </div>
          </div>

          {periodEnd && (
            <div className="text-sm">
              <span className="text-muted-foreground">
                {cancelAtPeriodEnd ? 
                  "Subscription ends on: " : 
                  "Next billing date: "
                }
              </span>
              <span className="font-medium">{format(new Date(periodEnd * 1000), 'MMMM d, yyyy')}</span>
            </div>
          )}
        </div>
      </CardContent>
      <CardFooter className="flex justify-between">
        <Button variant="outline" size="sm" onClick={onChangePlan}>
          {billingStatus === 'active' ? 'Change Plan' : 'Subscribe'}
        </Button>
        {billingStatus === 'active' && !cancelAtPeriodEnd && (
          <Button variant="ghost" size="sm" onClick={onCancelPlan}>
            Cancel Plan
          </Button>
        )}
      </CardFooter>
    </Card>
  );
}
