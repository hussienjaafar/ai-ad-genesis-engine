
import OnboardingWizard from "../components/Onboarding/OnboardingWizard";

const Onboarding = () => {
  return (
    <div className="min-h-screen bg-muted/30 flex items-center justify-center py-12 px-4">
      <div className="w-full">
        <div className="text-center mb-10">
          <h1 className="text-3xl font-bold mb-2">Welcome to Ad Genesis Engine</h1>
          <p className="text-muted-foreground">
            Let's set up your account in just a few steps
          </p>
        </div>
        
        <OnboardingWizard />
      </div>
    </div>
  );
};

export default Onboarding;
