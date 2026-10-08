import { z } from "zod";

/**
 * A resource on Dodona.
 */
export const resourceSchema = z.object({
    /**
     * The id of the resource.
     */
    id: z.number(),

    /**
     * The url to this resource.
     */
    url: z.string(),
});

export type Resource = z.infer<typeof resourceSchema>;