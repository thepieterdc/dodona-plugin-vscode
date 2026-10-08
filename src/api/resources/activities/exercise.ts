import { z } from "zod";

import { programmingLanguageSchema } from "../programmingLanguage";
import { baseActivitySchema } from "./activity";

/**
 * The status an exercise can be.
 */
export enum ExerciseStatus {
    CORRECT = "correct",
    CORRECT_LATE = "correct-late",
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
 * @param exercise the exercise
 */
export function findExerciseStatus(exercise: Exercise): ExerciseStatus {
    if (!exercise.has_solution) {
        return ExerciseStatus.NOT_STARTED;
    }

    if (exercise.accepted_before_deadline !== undefined) {
        if (exercise.accepted_before_deadline) {
            return ExerciseStatus.CORRECT;
        }
        return exercise.accepted
            ? ExerciseStatus.CORRECT_LATE
            : ExerciseStatus.WRONG;
    }

    if (exercise.has_correct_solution && exercise.last_solution_is_best) {
        return ExerciseStatus.CORRECT;
    }

    return ExerciseStatus.WRONG;
}