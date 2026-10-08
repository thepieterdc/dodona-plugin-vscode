import { z } from "zod";

import { programmingLanguageSchema } from "../programmingLanguage";
import { baseActivitySchema } from "./activity";

/**
 * The status an exercise can be.
 */
export enum ExerciseStatus {
    CORRECT = "correct",
    CORRECT_LATE = "correct-late",
    DEADLINE_MET = "deadline-met",
    DEADLINE_MISSED = "deadline-missed",
    NOT_STARTED = "not-started",
    WRONG = "wrong",
}

/**
 * An exercise on Dodona.
 */
export const exerciseSchema = baseActivitySchema.extend({
    type: z.literal("Exercise"),
    boilerplate: z.string().nullable(),
    has_correct_solution: z.boolean(),
    has_solution: z.boolean(),
    accepted: z.boolean().optional(),
    accepted_before_deadline: z.boolean().optional(),
    last_solution_is_best: z.boolean(),
    programming_language: programmingLanguageSchema.nullable(),
});

export type Exercise = z.infer<typeof exerciseSchema>;

/**
 * Finds the status of an exercise.
 *
 * Once the deadline of the series has passed, the status reflects whether the
 * deadline was met, like on Dodona.
 *
 * @param exercise the exercise
 * @param deadline the deadline of the series the exercise is viewed in, if any
 * @param now the current time
 */
export function findExerciseStatus(
    exercise: Exercise,
    deadline?: Date | null,
    now = new Date(),
): ExerciseStatus {
    if (
        deadline &&
        deadline < now &&
        exercise.accepted_before_deadline !== undefined
    ) {
        if (exercise.accepted_before_deadline) {
            return ExerciseStatus.DEADLINE_MET;
        }
        return exercise.accepted
            ? ExerciseStatus.CORRECT_LATE
            : ExerciseStatus.DEADLINE_MISSED;
    }

    if (!exercise.has_solution) {
        return ExerciseStatus.NOT_STARTED;
    }

    if (exercise.has_correct_solution && exercise.last_solution_is_best) {
        return ExerciseStatus.CORRECT;
    }

    return ExerciseStatus.WRONG;
}