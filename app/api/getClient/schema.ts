import { z } from "zod";

// Schemat dla weryfikacji kodu
export const verificationSchema = z.object({
  contactId: z.string().nonempty("Contact ID is required."),
  code: z
    .string()
    .length(6, "Verification code must be exactly 6 digits.")
    .regex(/^\d+$/, "Verification code must contain only digits."),
});

export default verificationSchema;