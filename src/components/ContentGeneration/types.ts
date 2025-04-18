
import { z } from "zod";

// Define the content types as a union type for better type safety
export type ContentType = "facebook" | "google" | "videoScript";

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

// Define the map with specific keys and values to maintain type safety
export const contentTypeMap: Record<ContentType, string> = {
  facebook: 'metaAdCopy',
  google: 'googleAdCopy',
  videoScript: 'videoScript'
};
