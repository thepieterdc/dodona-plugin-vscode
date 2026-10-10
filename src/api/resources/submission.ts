import { z } from "zod";

import { ExerciseStatus } from "./activities/exercise";
import { resourceSchema } from "./resource";

export const submissionCreatedResponseSchema = z.object({
    url: z.string(),
});

export type SubmissionCreatedResponse = z.infer<
    typeof submissionCreatedResponseSchema
>;

export const submissionStatusSchema = z.enum([
    "compilation error",
    "correct",
    "internal error",
    "memory limit exceeded",
    "output limit exceeded",
    "queued",
    "running",
    "runtime error",
    "time limit exceeded",
    "unknown",
    "wrong",
]);

export type SubmissionStatus = z.infer<typeof submissionStatusSchema>;

/**
 * A submission on Dodona.
 */
export const submissionSchema = resourceSchema.extend({
    created_at: z.string(),
    exercise: z.string(),
    number: z.number().optional(),
    status: submissionStatusSchema,
    summary: z.string().nullable(),
});

export type Submission = z.infer<typeof submissionSchema>;

/**
 * A submission on Dodona, including the submitted code.
 */
export const submissionWithCodeSchema = submissionSchema.extend({
    code: z.string(),
});

export type SubmissionWithCode = z.infer<typeof submissionWithCodeSchema>;

/**
 * Finds the status of an exercise.
 *
 * @param submission the submission
 */
export function findExerciseStatus(submission: Submission): ExerciseStatus {
    if (submission.status === "correct") {
        return ExerciseStatus.CORRECT;
    }

    return ExerciseStatus.WRONG;
}