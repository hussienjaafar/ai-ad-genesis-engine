
import { z } from "zod";

export const contentFormSchema = z.object({
  offering: z.string().min(1, { message: "Please select an offering" }),
  contentType: z.enum(["facebook", "google", "videoScript"], {
    required_error: "Please select a content type",
  }),
  tone: z.string().min(1, { message: "Please specify a tone" }),
  targetAudience: z.string().optional(),
  additionalNotes: z.string().optional(),
});

export type ContentFormValues = z.infer<typeof contentFormSchema>;

export const contentTypeMap: Record<string, string> = {
  facebook: 'metaAdCopy',
  google: 'googleAdCopy',
  videoScript: 'videoScript'
};

