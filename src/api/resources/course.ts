import { z } from "zod";

import { resourceSchema } from "./resource";

/**
 * A course on Dodona.
 */
export const courseSchema = resourceSchema.extend({
    name: z.string(),
    series: z.string(),
    // The year is nullable for sandbox courses.
    year: z
        .string()
        .nullish()
        .transform(y => y ?? ""),
});

export type Course = z.infer<typeof courseSchema>;