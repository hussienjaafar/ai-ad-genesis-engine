
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { CheckIcon, AlertTriangle } from 'lucide-react';

interface Plan {
  id: string;
  name: string;
  description: string;
  price: number;
  tokens: number;
}

interface ChangePlanModalProps {
  isOpen: boolean;
  onClose: () => void;
  plans: Plan[];
  currentPlanId?: string;
  onSubscribe: (planId: string) => void;
  isLoading: boolean;
}

export function ChangePlanModal({ 
  isOpen, 
  onClose, 
  plans, 
  currentPlanId, 
  onSubscribe, 
  isLoading 
}: ChangePlanModalProps) {
  const [selectedPlanId, setSelectedPlanId] = useState<string>(currentPlanId || '');

  const handleSubmit = () => {
    if (selectedPlanId) {
      onSubscribe(selectedPlanId);
    }
  };

  const formatTokens = (tokens: number) => {
    if (tokens >= 1000000) {
      return `${tokens / 1000000}M`;
    } else if (tokens >= 1000) {
      return `${tokens / 1000}K`;
    }
    return tokens.toString();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Choose a Plan</DialogTitle>
          <DialogDescription>
            Select a plan that matches your needs
          </DialogDescription>
        </DialogHeader>
        
        <RadioGroup 
          value={selectedPlanId} 
          onValueChange={setSelectedPlanId}
          className="gap-4 py-4"
        >
          {plans?.map((plan) => (
            <div 
              key={plan.id} 
              className={`flex items-center space-x-2 border rounded-lg p-4 transition-all ${
                selectedPlanId === plan.id ? 'border-primary bg-primary/5' : 'border-border'
              }`}
            >
              <RadioGroupItem value={plan.id} id={plan.id} />
              <Label
                htmlFor={plan.id}
                className="flex flex-col sm:flex-row sm:justify-between w-full cursor-pointer"
              >
                <div>
                  <span className="font-medium text-foreground">{plan.name}</span>
                  <p className="text-sm text-muted-foreground mt-1">{plan.description}</p>
                </div>
                <div className="mt-2 sm:mt-0 text-right">
                  <span className="font-bold">${plan.price}/month</span>
                  <p className="text-sm text-muted-foreground">{formatTokens(plan.tokens)} tokens</p>
                </div>
              </Label>
              
              {currentPlanId === plan.id && (
                <div className="flex items-center rounded bg-primary/10 px-2 py-1 text-xs text-primary">
                  <CheckIcon className="h-3 w-3 mr-1" />
                  Current
                </div>
              )}
            </div>
          ))}

          {plans?.length === 0 && (
            <div className="flex items-center justify-center p-6 text-center">
              <AlertTriangle className="h-5 w-5 text-yellow-500 mr-2" />
              <span>No plans available. Please try again later.</span>
            </div>
          )}
        </RadioGroup>

        <DialogFooter className="sm:justify-between">
          <Button variant="outline" onClick={onClose} disabled={isLoading}>
            Cancel
          </Button>
          <Button 
            onClick={handleSubmit} 
            disabled={!selectedPlanId || isLoading || selectedPlanId === currentPlanId}
          >
            {isLoading ? "Processing..." : "Confirm Subscription"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
