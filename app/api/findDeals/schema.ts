import { z } from "zod";

const getDealsSchema = z.object({
  contactId: z.string().nonempty("ID kontaktu jest wymagane."),
});

export default getDealsSchema;