
import { useState } from "react";
import MainLayout from "../components/Layout/MainLayout";
import PageHeader from "../components/Common/PageHeader";
import AdGeneratorForm from "../components/AdGenerator/AdGeneratorForm";
import AdPreview from "../components/AdGenerator/AdPreview";
import { Button } from "@/components/ui/button";
import { PlusIcon, SettingsIcon } from "lucide-react";
import { GeneratedAd } from "@/interfaces/types";

const AdGenerator = () => {
  const [currentAd, setCurrentAd] = useState<GeneratedAd | null>(null);

  const handleAdGenerated = (ad: GeneratedAd) => {
    setCurrentAd(ad);
  };

  return (
    <MainLayout>
      <PageHeader 
        title="Ad Generator" 
        description="Create high-converting ads powered by AI"
        actions={
          <>
            <Button variant="outline" size="sm">
              <SettingsIcon className="mr-2 h-4 w-4" />
              Settings
            </Button>
            <Button size="sm">
              <PlusIcon className="mr-2 h-4 w-4" />
              New Collection
            </Button>
          </>
        }
      />
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div>
          <AdGeneratorForm onAdGenerated={handleAdGenerated} />
        </div>
        
        <div className="h-full">
          <AdPreview ad={currentAd} />
        </div>
      </div>
    </MainLayout>
  );
};

export default AdGenerator;
