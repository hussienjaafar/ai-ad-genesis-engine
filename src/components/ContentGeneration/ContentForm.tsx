
import { useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useContentGeneration } from "@/hooks/useContentGeneration";

const contentFormSchema = z.object({
  offering: z.string().min(1, { message: "Please select an offering" }),
  contentType: z.enum(["facebook", "google", "videoScript"], {
    required_error: "Please select a content type",
  }),
  tone: z.string().min(1, { message: "Please specify a tone" }),
  targetAudience: z.string().optional(),
  additionalNotes: z.string().optional(),
});

type ContentFormValues = z.infer<typeof contentFormSchema>;

interface ContentFormProps {
  businessId: string;
  offerings: string[];
  onContentGenerated: (content: any) => void;
}

export function ContentForm({ businessId, offerings, onContentGenerated }: ContentFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { generateContent, isGenerating } = useContentGeneration(businessId);

  const form = useForm<ContentFormValues>({
    resolver: zodResolver(contentFormSchema),
    defaultValues: {
      contentType: "facebook",
      tone: "professional",
      targetAudience: "",
      additionalNotes: "",
    },
  });

  function onSubmit(values: ContentFormValues) {
    setIsSubmitting(true);
    
    const params = {
      offering: values.offering,
      tone: values.tone,
      targetAudience: values.targetAudience || undefined,
      additionalDetails: values.additionalNotes || undefined,
    };
    
    generateContent(
      { contentType: values.contentType, params },
      {
        onSuccess: (data) => {
          onContentGenerated(data);
          setIsSubmitting(false);
        },
        onError: () => {
          setIsSubmitting(false);
        },
      }
    );
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="offering"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Offering</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select an offering" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {offerings.map((offering) => (
                    <SelectItem key={offering} value={offering}>
                      {offering}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="contentType"
          render={({ field }) => (
            <FormItem className="space-y-3">
              <FormLabel>Content Type</FormLabel>
              <FormControl>
                <RadioGroup
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                  className="flex flex-col space-y-1 sm:flex-row sm:space-y-0 sm:space-x-4"
                >
                  <FormItem className="flex items-center space-x-3 space-y-0">
                    <FormControl>
                      <RadioGroupItem value="facebook" />
                    </FormControl>
                    <FormLabel className="font-normal">Facebook Ad</FormLabel>
                  </FormItem>
                  <FormItem className="flex items-center space-x-3 space-y-0">
                    <FormControl>
                      <RadioGroupItem value="google" />
                    </FormControl>
                    <FormLabel className="font-normal">Google Ad</FormLabel>
                  </FormItem>
                  <FormItem className="flex items-center space-x-3 space-y-0">
                    <FormControl>
                      <RadioGroupItem value="videoScript" />
                    </FormControl>
                    <FormLabel className="font-normal">Video Script</FormLabel>
                  </FormItem>
                </RadioGroup>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="tone"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Tone</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a tone" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="professional">Professional</SelectItem>
                  <SelectItem value="casual">Casual</SelectItem>
                  <SelectItem value="humorous">Humorous</SelectItem>
                  <SelectItem value="formal">Formal</SelectItem>
                  <SelectItem value="friendly">Friendly</SelectItem>
                </SelectContent>
              </Select>
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
                <Textarea
                  placeholder="Describe your target audience"
                  className="resize-none"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="additionalNotes"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Additional Notes (Optional)</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Add any specific requirements or details"
                  className="resize-none"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button type="submit" disabled={isSubmitting || isGenerating}>
          {isSubmitting || isGenerating ? "Generating..." : "Generate Content"}
        </Button>
      </form>
    </Form>
  );
}
