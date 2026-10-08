import { z } from "zod";

import { courseSchema } from "./course";
import { resourceSchema } from "./resource";

/**
 * A user on Dodona.
 */
export const userSchema = resourceSchema.extend({
    subscribed_courses: z.array(courseSchema),
});

export type User = z.infer<typeof userSchema>;