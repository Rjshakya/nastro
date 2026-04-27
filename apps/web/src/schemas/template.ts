import { z } from "zod";

/**
 * Base template schema with common validations
 */
const baseTemplateSchema = z.object({
  name: z.string().min(1, "Template name is required"),
  url: z
    .string()
    .min(1, "Template URL is required")
    .url("Template URL must be a valid URL"),
  thumbnail: z
    .string()
    .url("Thumbnail URL must be a valid URL")
    .nullable(),
  description: z.string().min(1, "Description is required"),
  instructionsPageUrl: z
    .string()
    .min(1, "Instructions page URL is required")
    .url("Instructions page URL must be a valid URL"),
  notionPageUrl: z
    .string()
    .min(1, "Notion page URL is required")
    .url("Notion page URL must be a valid URL"),
  isPaid: z.boolean().default(false),
  paymentLink: z.string().nullable(),
  price: z.number().nullable(),
  tags: z.array(z.string()).nullable(),
});

/**
 * Template form schema with conditional validation for paid templates
 * Use this for both create and edit template forms
 */
export const templateFormSchema = baseTemplateSchema
  .refine(
    (data) => {
      if (data.isPaid) {
        return (
          data.price !== null &&
          data.price > 0 &&
          data.paymentLink !== null &&
          data.paymentLink.length > 0
        );
      }
      return true;
    },
    {
      message: "Price and payment link are required for paid templates",
      path: ["isPaid"],
    },
  )
  .refine(
    (data) => {
      if (data.isPaid && data.paymentLink) {
        try {
          new URL(data.paymentLink);
          return true;
        } catch {
          return false;
        }
      }
      return true;
    },
    {
      message: "Payment link must be a valid URL",
      path: ["paymentLink"],
    },
  );

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
):
  | { success: true; data: TemplateFormData }
  | { success: false; error: string } => {
  const result = templateFormSchema.safeParse(data);

  if (result.success) {
    return { success: true, data: result.data };
  }

  return { success: false, error: result.error.message };
};
