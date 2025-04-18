
import React, { useState } from 'react';
import { useParams } from 'react-router-dom';
import MainLayout from '@/components/Layout/MainLayout';
import { UsageCard } from '@/components/Billing/UsageCard';
import { QuotaProgress } from '@/components/Billing/QuotaProgress';
import { ChangePlanModal } from '@/components/Billing/ChangePlanModal';
import { useBilling } from '@/hooks/useBilling';
import { Button } from '@/components/ui/button';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { ReloadIcon } from '@radix-ui/react-icons';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';
import { AlertTriangle } from 'lucide-react';

export default function Billing() {
  const { id } = useParams<{ id: string }>();
  const businessId = id || '';
  const [showChangePlanModal, setShowChangePlanModal] = useState(false);
  const [showCancelDialog, setShowCancelDialog] = useState(false);
  
  const { 
    billingDetails, 
    isLoadingBillingDetails,
    plans, 
    isLoadingPlans,
    subscribe, 
    isSubscribing,
    cancelSubscription,
    isCanceling
  } = useBilling(businessId);

  if (!businessId) {
    return (
      <MainLayout>
        <div className="flex flex-col items-center justify-center h-64">
          <Alert variant="destructive">
            <AlertTriangle className="h-4 w-4" />
            <AlertTitle>Business ID missing</AlertTitle>
            <AlertDescription>
              Please select a valid business to view billing information.
            </AlertDescription>
          </Alert>
        </div>
      </MainLayout>
    );
  }

  const handleSubscribe = (planId: string) => {
    subscribe(planId);
    setShowChangePlanModal(false);
  };

  const handleCancelSubscription = () => {
    cancelSubscription();
    setShowCancelDialog(false);
  };

  return (
    <MainLayout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Billing & Usage</h1>
            <p className="text-muted-foreground">
              Manage your subscription and monitor token usage
            </p>
          </div>
          {isLoadingBillingDetails && (
            <Button variant="outline" disabled>
              <ReloadIcon className="mr-2 h-4 w-4 animate-spin" />
              Loading
            </Button>
          )}
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          {/* Quota Card */}
          <QuotaProgress
            currentUsage={billingDetails?.usage?.currentUsage || 0}
            quota={billingDetails?.usage?.quota || 100000}
            billingStatus={billingDetails?.subscription?.billingStatus || 'none'}
            planName={billingDetails?.subscription?.planName || 'Free Tier'}
            periodEnd={billingDetails?.subscription?.currentPeriodEnd}
            cancelAtPeriodEnd={billingDetails?.subscription?.cancelAtPeriodEnd}
            onChangePlan={() => setShowChangePlanModal(true)}
            onCancelPlan={() => setShowCancelDialog(true)}
          />

          {/* Usage Card */}
          <UsageCard businessId={businessId} />
        </div>

        {/* Change Plan Modal */}
        <ChangePlanModal
          isOpen={showChangePlanModal}
          onClose={() => setShowChangePlanModal(false)}
          plans={plans || []}
          currentPlanId={billingDetails?.subscription?.planId}
          onSubscribe={handleSubscribe}
          isLoading={isSubscribing || isLoadingPlans}
        />

        {/* Cancel Subscription Dialog */}
        <AlertDialog open={showCancelDialog} onOpenChange={setShowCancelDialog}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Are you sure?</AlertDialogTitle>
              <AlertDialogDescription>
                Your subscription will remain active until the end of the current billing period. 
                After that, you'll be downgraded to the free tier with limited token usage.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction
                onClick={handleCancelSubscription}
                disabled={isCanceling}
              >
                {isCanceling ? "Canceling..." : "Cancel Subscription"}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </MainLayout>
  );
}
