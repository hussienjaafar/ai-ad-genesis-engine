
import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Industry } from "@/interfaces/types";
import { industryOptions } from "@/lib/mockData";
import { 
  ShoppingCartIcon,
  HomeIcon,
  HeartPulseIcon,
  BriefcaseIcon,
  StoreIcon,
  GraduationCapIcon,
  MonitorIcon,
  BarChartIcon,
  PlaneIcon,
  UtensilsIcon
} from "lucide-react";

interface IndustrySelectorProps {
  onSelect: (industry: Industry) => void;
  onNext: () => void;
}

const IndustrySelector = ({ onSelect, onNext }: IndustrySelectorProps) => {
  const [selectedIndustry, setSelectedIndustry] = useState<Industry>("ecommerce");
  const [businessName, setBusinessName] = useState("");

  const handleIndustrySelect = (value: string) => {
    setSelectedIndustry(value as Industry);
    onSelect(value as Industry);
  };

  const getIndustryIcon = (industry: string) => {
    switch (industry) {
      case "ecommerce":
        return <ShoppingCartIcon className="h-5 w-5" />;
      case "real_estate":
        return <HomeIcon className="h-5 w-5" />;
      case "healthcare":
        return <HeartPulseIcon className="h-5 w-5" />;
      case "professional_services":
        return <BriefcaseIcon className="h-5 w-5" />;
      case "local_business":
        return <StoreIcon className="h-5 w-5" />;
      case "education":
        return <GraduationCapIcon className="h-5 w-5" />;
      case "technology":
        return <MonitorIcon className="h-5 w-5" />;
      case "finance":
        return <BarChartIcon className="h-5 w-5" />;
      case "travel":
        return <PlaneIcon className="h-5 w-5" />;
      case "food_beverage":
        return <UtensilsIcon className="h-5 w-5" />;
      default:
        return <ShoppingCartIcon className="h-5 w-5" />;
    }
  };

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <h2 className="text-2xl font-bold">Tell us about your business</h2>
        <p className="text-muted-foreground">
          To help us generate the most relevant ads for your business, please tell us a bit more about it.
        </p>
      </div>
      
      <div className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="businessName">Business Name</Label>
          <Input 
            id="businessName" 
            placeholder="Enter your business name" 
            value={businessName}
            onChange={(e) => setBusinessName(e.target.value)}
          />
        </div>
        
        <div className="space-y-2">
          <Label>Industry</Label>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {industryOptions.map((industry) => (
              <Card 
                key={industry.value}
                className={`cursor-pointer transition-all ${
                  selectedIndustry === industry.value ? "border-brand-500 shadow-md" : ""
                }`}
                onClick={() => handleIndustrySelect(industry.value)}
              >
                <CardContent className="p-4 flex items-center gap-3">
                  <div className={`p-2 rounded-full ${
                    selectedIndustry === industry.value ? "bg-brand-100 text-brand-600" : "bg-muted text-muted-foreground"
                  }`}>
                    {getIndustryIcon(industry.value)}
                  </div>
                  <div>
                    <RadioGroup value={selectedIndustry} onValueChange={handleIndustrySelect}>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem 
                          value={industry.value} 
                          id={`industry-${industry.value}`}
                          className="sr-only"
                        />
                        <Label htmlFor={`industry-${industry.value}`} className="text-base font-medium">
                          {industry.label}
                        </Label>
                      </div>
                    </RadioGroup>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
      
      <div className="flex justify-end pt-4">
        <Button 
          onClick={onNext}
          disabled={!businessName.trim() || !selectedIndustry}
          className="w-full md:w-auto"
        >
          Next Step
        </Button>
      </div>
    </div>
  );
};

export default IndustrySelector;
