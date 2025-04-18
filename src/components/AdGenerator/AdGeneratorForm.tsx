
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import { SparklesIcon, LoaderIcon } from "lucide-react";
import { mockBusinessProfile } from "@/lib/mockData";
import { GeneratedAd } from "@/interfaces/types";

interface AdGeneratorFormProps {
  onAdGenerated: (ad: GeneratedAd) => void;
}

const AdGeneratorForm = ({ onAdGenerated }: AdGeneratorFormProps) => {
  const [isGenerating, setIsGenerating] = useState(false);
  const [platform, setPlatform] = useState<string>("facebook");
  const [adType, setAdType] = useState<string>("image");
  const [audienceType, setAudienceType] = useState<string>("existing");
  const [objective, setObjective] = useState<string>("conversions");
  const [prompt, setPrompt] = useState<string>("");

  const handleGenerate = () => {
    if (!prompt) {
      toast.error("Please enter a prompt to generate an ad");
      return;
    }
    
    setIsGenerating(true);
    
    // Simulate API call with timeout
    setTimeout(() => {
      const newAd: GeneratedAd = {
        id: `gen-${Date.now()}`,
        platform: platform as "facebook" | "google" | "tiktok" | "linkedin",
        type: adType as "image" | "video" | "carousel" | "text",
        headline: "Elevate Your Home with Artisan Craftsmanship",
        description: "Discover our handcrafted home decor pieces that combine sustainability with luxury. Each item tells a story of artisan dedication and environmental responsibility.",
        callToAction: "Shop Collection",
        imagePrompt: adType === "image" ? prompt : undefined,
        industry: mockBusinessProfile.industry,
        createdAt: new Date().toISOString()
      };
      
      onAdGenerated(newAd);
      setIsGenerating(false);
      toast.success("Ad generated successfully!");
    }, 2000);
  };

  return (
    <Tabs defaultValue="basic" className="w-full">
      <TabsList className="mb-6">
        <TabsTrigger value="basic">Basic</TabsTrigger>
        <TabsTrigger value="advanced">Advanced</TabsTrigger>
        <TabsTrigger value="prompt">Custom Prompt</TabsTrigger>
      </TabsList>
      
      <TabsContent value="basic" className="animate-fade-in">
        <Card>
          <CardContent className="pt-6">
            <div className="grid gap-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="platform">Platform</Label>
                  <Select value={platform} onValueChange={setPlatform}>
                    <SelectTrigger id="platform">
                      <SelectValue placeholder="Select a platform" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="facebook">Facebook / Instagram</SelectItem>
                      <SelectItem value="google">Google Ads</SelectItem>
                      <SelectItem value="tiktok">TikTok</SelectItem>
                      <SelectItem value="linkedin">LinkedIn</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <Label>Ad Type</Label>
                  <RadioGroup value={adType} onValueChange={setAdType} className="flex gap-4">
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="image" id="image" />
                      <Label htmlFor="image">Image</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="video" id="video" />
                      <Label htmlFor="video">Video</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="carousel" id="carousel" />
                      <Label htmlFor="carousel">Carousel</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="text" id="text" />
                      <Label htmlFor="text">Text</Label>
                    </div>
                  </RadioGroup>
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="audience">Target Audience</Label>
                  <Select value={audienceType} onValueChange={setAudienceType}>
                    <SelectTrigger id="audience">
                      <SelectValue placeholder="Select audience" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="existing">Existing Customers</SelectItem>
                      <SelectItem value="new">New Customers</SelectItem>
                      <SelectItem value="lookalike">Lookalike Audience</SelectItem>
                      <SelectItem value="custom">Custom Audience</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="objective">Campaign Objective</Label>
                  <Select value={objective} onValueChange={setObjective}>
                    <SelectTrigger id="objective">
                      <SelectValue placeholder="Select objective" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="awareness">Brand Awareness</SelectItem>
                      <SelectItem value="traffic">Traffic</SelectItem>
                      <SelectItem value="engagement">Engagement</SelectItem>
                      <SelectItem value="leads">Lead Generation</SelectItem>
                      <SelectItem value="conversions">Conversions</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              {adType !== "text" && (
                <div className="space-y-2">
                  <Label htmlFor="prompt">Image/Video Description</Label>
                  <Textarea 
                    id="prompt" 
                    placeholder="Describe what you want in your image or video..." 
                    className="resize-none h-24"
                    value={prompt}
                    onChange={(e) => setPrompt(e.target.value)}
                  />
                </div>
              )}
              
              <div className="flex justify-end">
                <Button 
                  onClick={handleGenerate}
                  disabled={isGenerating}
                  className="w-full md:w-auto"
                >
                  {isGenerating ? (
                    <>
                      <LoaderIcon className="mr-2 h-4 w-4 animate-spin" />
                      Generating
                    </>
                  ) : (
                    <>
                      <SparklesIcon className="mr-2 h-4 w-4" />
                      Generate Ad
                    </>
                  )}
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </TabsContent>
      
      <TabsContent value="advanced" className="animate-fade-in">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-center h-32">
              <p className="text-muted-foreground">Advanced options are coming soon</p>
            </div>
          </CardContent>
        </Card>
      </TabsContent>
      
      <TabsContent value="prompt" className="animate-fade-in">
        <Card>
          <CardContent className="pt-6">
            <div className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="custom-prompt">Custom Prompt</Label>
                <Textarea 
                  id="custom-prompt" 
                  placeholder="Write a detailed custom prompt for the AI to generate an ad..." 
                  className="resize-none h-40"
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                />
                <p className="text-sm text-muted-foreground mt-2">
                  Advanced: Write a custom prompt to guide the AI in creating your ad.
                </p>
              </div>
              
              <div className="flex justify-end">
                <Button 
                  onClick={handleGenerate}
                  disabled={isGenerating}
                  className="w-full md:w-auto"
                >
                  {isGenerating ? (
                    <>
                      <LoaderIcon className="mr-2 h-4 w-4 animate-spin" />
                      Generating
                    </>
                  ) : (
                    <>
                      <SparklesIcon className="mr-2 h-4 w-4" />
                      Generate with Custom Prompt
                    </>
                  )}
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </TabsContent>
    </Tabs>
  );
};

export default AdGeneratorForm;
