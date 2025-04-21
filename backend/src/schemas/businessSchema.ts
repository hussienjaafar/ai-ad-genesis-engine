
import { z } from 'zod';

export const createBusinessSchema = z.object({
  name: z.string().min(1, 'Business name is required'),
  businessType: z.string().min(1, 'Business type is required'),
  description: z.string().optional(),
  contact: z.object({
    email: z.string().email('Invalid email address'),
    phone: z.string().optional(),
    address: z.string().optional(),
  }),
  offerings: z.array(z.string()).optional(),
  brandVoice: z.object({
    tone: z.string(),
    style: z.string(),
    examples: z.array(z.string()),
  }).optional(),
});

export const updateBusinessSchema = createBusinessSchema.partial();

export const offeringsSchema = z.object({
  offerings: z.array(z.string().min(1, 'Offering name is required')),
});

export type CreateBusinessInput = z.infer<typeof createBusinessSchema>;
export type UpdateBusinessInput = z.infer<typeof updateBusinessSchema>;
export type OfferingsInput = z.infer<typeof offeringsSchema>;
