import { z } from "zod";

import { resourceSchema } from "./resource";

/**
 * A series on Dodona.
 */
export const seriesSchema = resourceSchema.extend({
    deadline: z.string().nullable().optional(),
    description: z.string(),
    exercises: z.string(),
    name: z.string(),
    order: z.number(),
});

export type Series = z.infer<typeof seriesSchema>;