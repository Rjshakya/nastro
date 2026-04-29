import { z } from "zod";

/**
 * Base template schema with common validations
 */
const baseTemplateSchema = z.object({
  name: z.string().min(1, "Template name is required"),
  url: z.url().min(1, "Template URL is required"),
  thumbnail: z.url("Thumbnail URL must be a valid URL").optional(),
  description: z.string().min(1, "Description is required"),
  instructionsPageUrl: z.url().min(1, "Instructions page URL is required"),
  notionPageUrl: z.url().min(1, "Notion page URL is required"),
  isPaid: z.boolean().default(false),
  paymentLink: z.string().optional(),
  price: z.number().optional(),
  tags: z.array(z.string()).optional(),
});

/**
 * Template form schema with conditional validation for paid templates
 * Use this for both create and edit template forms
 */
export const templateFormSchema = baseTemplateSchema;
// .refine(
//   (data) => {
//     if (data.isPaid) {
//       return data?.price && data.price > 0 && data?.paymentLink && data.paymentLink.length > 0;
//     }
//     return true;
//   },
//   {
//     message: "Price and payment link are required for paid templates",
//     path: ["isPaid"],
//   },
// );

/**
 * Type inferred from the template form schema
 */
export type TemplateFormData = z.infer<typeof templateFormSchema>;

/**
 * Helper function to validate template form data
 * Returns an object with success flag and either data or error message
 */
export const validateTemplateForm = (
  data: unknown,
): { success: true; data: TemplateFormData } | { success: false; error: string } => {
  const result = templateFormSchema.safeParse(data);

  if (result.success) {
    return { success: true, data: result.data };
  }

  return { success: false, error: result.error.message };
};
