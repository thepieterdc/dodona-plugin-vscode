import { z } from "zod";

import { resourceSchema } from "../resource";

/**
 * Types of activities.
 */
export const activityTypeSchema = z.enum(["ContentPage", "Exercise"]);

export type ActivityType = z.infer<typeof activityTypeSchema>;

/**
 * Fields shared by all activities on Dodona.
 */
export const baseActivitySchema = resourceSchema.extend({
    description_url: z.string(),
    name: z.string(),
});