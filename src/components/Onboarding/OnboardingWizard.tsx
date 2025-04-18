
import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import IndustrySelector from "./IndustrySelector";
import PlatformConnector from "../PlatformIntegration/PlatformConnector";
import { toast } from "sonner";
import { Industry } from "@/interfaces/types";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";

const steps = [
  { name: "Industry", description: "Select your business industry" },
  { name: "Platform", description: "Connect your ad platforms" },
  { name: "Complete", description: "Start generating ads" }
];

const OnboardingWizard = () => {
  const [currentStep, setCurrentStep] = useState(0);
  const [selectedIndustry, setSelectedIndustry] = useState<Industry>("ecommerce");
  const navigate = useNavigate();

  const nextStep = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      completeOnboarding();
    }
  };

  const prevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleIndustrySelect = (industry: Industry) => {
    setSelectedIndustry(industry);
  };

  const completeOnboarding = () => {
    toast.success("Onboarding completed! Welcome to Ad Genesis Engine");
    navigate("/");
  };

  return (
    <div className="max-w-3xl mx-auto">
      <Card className="p-6 shadow-lg">
        <div className="mb-8">
          <div className="flex justify-between mb-2">
            {steps.map((step, index) => (
              <div 
                key={step.name}
                className={`text-sm font-medium ${
                  index <= currentStep ? "text-brand-600" : "text-muted-foreground"
                }`}
              >
                {step.name}
              </div>
            ))}
          </div>
          <Progress value={(currentStep + 1) / steps.length * 100} className="h-2" />
        </div>

        {currentStep === 0 && (
          <IndustrySelector 
            onSelect={handleIndustrySelect} 
            onNext={nextStep}
          />
        )}

        {currentStep === 1 && (
          <div className="space-y-6">
            <div className="space-y-2">
              <h2 className="text-2xl font-bold">Connect your ad platforms</h2>
              <p className="text-muted-foreground">
                Connect your advertising accounts to start analyzing performance and generating optimized ads.
              </p>
            </div>
            
            <PlatformConnector 
              onConnected={() => {}} 
              minimal={true} 
            />
            
            <div className="flex justify-between pt-4">
              <Button variant="outline" onClick={prevStep}>
                Back
              </Button>
              <Button onClick={nextStep}>
                Next Step
              </Button>
            </div>
          </div>
        )}

        {currentStep === 2 && (
          <div className="space-y-6 py-8">
            <div className="text-center space-y-3">
              <div className="w-20 h-20 mx-auto bg-brand-100 rounded-full flex items-center justify-center">
                <svg
                  className="w-10 h-10 text-brand-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M5 13l4 4L19 7"
                  ></path>
                </svg>
              </div>
              <h2 className="text-2xl font-bold">You're all set!</h2>
              <p className="text-muted-foreground max-w-md mx-auto">
                Your Ad Genesis Engine is ready to create optimized ads for your {selectedIndustry.replace("_", " ")} business.
              </p>
            </div>
            
            <div className="flex justify-center pt-8">
              <Button onClick={completeOnboarding} className="px-8">
                Start Generating Ads
              </Button>
            </div>
          </div>
        )}
      </Card>
    </div>
  );
};

export default OnboardingWizard;
