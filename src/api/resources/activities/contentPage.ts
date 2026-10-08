import { z } from "zod";

import { baseActivitySchema } from "./activity";

/**
 * A content page on Dodona.
 */
export const contentPageSchema = baseActivitySchema.extend({
    type: z.literal("ContentPage"),
    has_read: z.boolean(),
});

export type ContentPage = z.infer<typeof contentPageSchema>;