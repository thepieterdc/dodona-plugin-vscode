import Activity from "./activity";
import ProgrammingLanguage from "../programmingLanguage";

/**
 * The status an exercise can be.
 */
export enum ExerciseStatus {
    CORRECT = "correct",
    NOT_STARTED = "not-started",
    WRONG = "wrong"
}

/**
 * An exercise on Dodona.
 */
export interface Exercise extends Activity {
    boilerplate: string | null;
    has_correct_solution: boolean;
    has_solution: boolean;
    last_solution_is_best: boolean;
    programming_language: ProgrammingLanguage | null;
}

/**
 * Finds the status of an exercise.
 *
 * @param exercise the exercise
 */
export function findExerciseStatus(exercise: Exercise): ExerciseStatus {
    if (!exercise.has_solution) {
        return ExerciseStatus.NOT_STARTED;
    }

    if (exercise.has_correct_solution && exercise.last_solution_is_best) {
        return ExerciseStatus.CORRECT;
    }

    return ExerciseStatus.WRONG;
}

export default Exercise;