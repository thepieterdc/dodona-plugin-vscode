import { z } from "zod";

import { resourceSchema } from "./resource";

/**
 * A course on Dodona.
 */
export const courseSchema = resourceSchema.extend({
    name: z.string(),
    series: z.string(),
    year: z.string(),
});

export type Course = z.infer<typeof courseSchema>;