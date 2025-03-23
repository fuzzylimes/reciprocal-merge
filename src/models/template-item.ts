import { z } from "zod";

const TemplateItemSchema = z.object({
  columnName: z.string(),
  fileSource: z.string(),
  sourceSheet: z.string().optional(),
  cell: z.string().optional(),
});

// Schema for the entire configuration file
export const TemplateConfigSchema = z.record(z.string(), z.array(TemplateItemSchema));

export type TemplateItem = z.infer<typeof TemplateItemSchema>;
export type TemplateConfig = z.infer<typeof TemplateConfigSchema>;
