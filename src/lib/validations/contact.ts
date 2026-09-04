import { z } from "zod";

export const CONTACT_FIELD_LIMITS = {
  name: 100,
  phone: 32,
  email: 254,
  message: 5_000,
} as const;

const headerSafe = (value: string) => !/[\r\n\u0000]/.test(value);

export const ContactFormSchema = z
  .object({
    name: z
      .string()
      .trim()
      .min(2, "Please enter your name.")
      .max(CONTACT_FIELD_LIMITS.name, "Name is too long.")
      .refine(headerSafe, "Name contains unsupported characters."),
    phone: z
      .string()
      .trim()
      .max(CONTACT_FIELD_LIMITS.phone, "Phone number is too long.")
      .regex(/^[0-9+()./\-\s]*$/, "Phone number contains unsupported characters.")
      .optional()
      .or(z.literal("")),
    email: z
      .string()
      .trim()
      .max(CONTACT_FIELD_LIMITS.email, "Email address is too long.")
      .email("Please enter a valid email address.")
      .refine(headerSafe, "Email address contains unsupported characters.")
      .optional()
      .or(z.literal("")),
    message: z
      .string()
      .trim()
      .min(10, "Please enter a message of at least 10 characters.")
      .max(CONTACT_FIELD_LIMITS.message, "Message is too long."),
    website: z.string().max(0).optional().default(""),
  })
  .strict();

export type ContactFormData = z.infer<typeof ContactFormSchema>;
