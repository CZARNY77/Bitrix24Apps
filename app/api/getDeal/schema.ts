import { z } from "zod";

// Schemat dla weryfikacji kodu
export const verificationSchema = z.object({
  dealId: z.string().nonempty("Deal ID is required."),
});

export default verificationSchema;