import { z } from "zod";

const findClientSchema = z.object({
  email: z.string().email(),
});

export default findClientSchema;