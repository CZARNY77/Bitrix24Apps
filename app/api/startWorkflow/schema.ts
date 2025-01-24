import { z } from "zod";

const startWorkflowSchema = z.object({
  documentId: z.array(z.string().min(1)),
  templateId: z.number().min(1),        
});

export default startWorkflowSchema;
