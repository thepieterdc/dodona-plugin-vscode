import { z } from "zod";

import { ContentPage, contentPageSchema } from "./contentPage";
import { Exercise, exerciseSchema } from "./exercise";

/**
 * An activity on Dodona.
 */
export const activitySchema = z.discriminatedUnion("type", [
    contentPageSchema,
    exerciseSchema,
]);

export type Activity = ContentPage | Exercise;

export type { ContentPage, Exercise };