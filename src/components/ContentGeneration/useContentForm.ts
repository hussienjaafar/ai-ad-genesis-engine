
import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useContentGeneration } from "@/hooks/useContentGeneration";
import { ContentFormValues, contentFormSchema, contentTypeMap, ContentType } from "./types";

export function useContentForm(businessId: string, onContentGenerated: (content: any) => void) {
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

  const onSubmit = (values: ContentFormValues) => {
    setIsSubmitting(true);
    
    const params = {
      offering: values.offering,
      tone: values.tone,
      targetAudience: values.targetAudience || undefined,
      additionalDetails: values.additionalNotes || undefined,
    };
    
    // The contentType is validated by Zod schema, so we can safely assert its type here
    const contentType = values.contentType as ContentType;
    
    generateContent(
      { 
        contentType: contentTypeMap[contentType],
        params 
      },
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
  };

  return {
    form,
    isSubmitting,
    isGenerating,
    onSubmit
  };
}
