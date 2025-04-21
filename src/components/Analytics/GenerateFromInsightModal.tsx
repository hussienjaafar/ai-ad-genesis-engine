
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogDescription,
  DialogFooter
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { PatternInsight } from "@/interfaces/analytics";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { useContentGeneration } from "@/hooks/useContentGeneration";
import { ArrowRight, CheckCircle, Sparkles } from "lucide-react";

interface GenerateFromInsightModalProps {
  insight: PatternInsight;
  isOpen: boolean;
  onClose: () => void;
}

const formSchema = z.object({
  contentType: z.enum(["facebook", "google", "videoScript"], {
    required_error: "Please select a content type",
  }),
  customNotes: z.string().optional(),
  tone: z.string().optional(),
  targetAudience: z.string().optional(),
});

type FormValues = z.infer<typeof formSchema>;

export function GenerateFromInsightModal({ insight, isOpen, onClose }: GenerateFromInsightModalProps) {
  const navigate = useNavigate();
  const [businessId, setBusinessId] = useState<string>("123"); // In a real app, this would come from context
  const [generatedContentId, setGeneratedContentId] = useState<string | null>(null);
  
  const { generateContent, isGenerating } = useContentGeneration(businessId);
  
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      contentType: "facebook",
      customNotes: "",
      tone: "",
      targetAudience: "",
    },
  });

  const onSubmit = (data: FormValues) => {
    generateContent(
      {
        contentType: data.contentType,
        params: {
          tone: data.tone,
          targetAudience: data.targetAudience,
          customNotes: data.customNotes,
        },
        sourceInsightId: insight._id,
      },
      {
        onSuccess: (response) => {
          setGeneratedContentId(response.contentId);
        },
      }
    );
  };

  const handleViewInLibrary = () => {
    navigate(`/content/${businessId}?highlight=${generatedContentId}`);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-primary" />
            Generate Variation from Insight
          </DialogTitle>
          <DialogDescription>
            Create new content based on this high-performing element
          </DialogDescription>
        </DialogHeader>

        <div className="bg-muted p-4 rounded-md mb-4">
          <div className="mb-3">
            <span className="text-sm font-medium text-muted-foreground">Winning Element:</span>
            <p className="text-md font-medium">{insight.element}</p>
          </div>
          <div className="mb-3">
            <span className="text-sm font-medium text-muted-foreground">Element Type:</span>
            <p className="capitalize">{insight.elementType}</p>
          </div>
          <div>
            <span className="text-sm font-medium text-muted-foreground">Performance Uplift:</span>
            <p className="text-green-600 font-medium">
              +{(insight.performance.uplift * 100).toFixed(2)}% 
              <span className="text-muted-foreground text-sm font-normal ml-2">
                ({(insight.performance.confidence * 100).toFixed(0)}% confidence)
              </span>
            </p>
          </div>
        </div>

        {generatedContentId ? (
          <div className="space-y-4">
            <div className="flex items-center justify-center p-4 bg-green-50 rounded-md">
              <CheckCircle className="text-green-600 h-5 w-5 mr-2" />
              <p className="text-green-800">Content successfully generated!</p>
            </div>
            <Button className="w-full" onClick={handleViewInLibrary}>
              View in Content Library
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </div>
        ) : (
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="contentType"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Content Type</FormLabel>
                    <Select 
                      onValueChange={field.onChange} 
                      defaultValue={field.value}
                      disabled={isGenerating}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select content type" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="facebook">Facebook Ad</SelectItem>
                        <SelectItem value="google">Google Ad</SelectItem>
                        <SelectItem value="videoScript">Video Script</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="tone"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Tone (Optional)</FormLabel>
                    <FormControl>
                      <Input 
                        placeholder="e.g., Professional, Casual, Excited" 
                        {...field} 
                        disabled={isGenerating}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="targetAudience"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Target Audience (Optional)</FormLabel>
                    <FormControl>
                      <Input 
                        placeholder="e.g., Young professionals, Parents" 
                        {...field}
                        disabled={isGenerating}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="customNotes"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Additional Notes (Optional)</FormLabel>
                    <FormControl>
                      <Textarea 
                        placeholder="Any additional requirements or tweaks for the content"
                        className="resize-none" 
                        {...field}
                        disabled={isGenerating}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <DialogFooter>
                <Button variant="outline" type="button" onClick={onClose} disabled={isGenerating}>
                  Cancel
                </Button>
                <Button type="submit" disabled={isGenerating}>
                  {isGenerating ? "Generating..." : "Generate Content"}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        )}
      </DialogContent>
    </Dialog>
  );
}
