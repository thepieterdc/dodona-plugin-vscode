import { z } from "zod";

export const programmingLanguageSchema = z.object({
    extension: z.string(),
    name: z.string(),
});

export type ProgrammingLanguage = z.infer<typeof programmingLanguageSchema>;