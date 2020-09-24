import { Resource } from "./resource";
import { ExerciseStatus } from "./activities/exercise";

export interface SubmissionCreatedResponse {
    url: string;
}

export type SubmissionStatus =
    "compilation error"
    | "correct"
    | "internal error"
    | "memory limit exceeded"
    | "output limit exceeded"
    | "queued"
    | "running"
    | "runtime error"
    | "time limit exceeded"
    | "unknown"
    | "wrong";

/**
 * A submission on Dodona.
 */
export interface Submission extends Resource {
    exercise: string;
    status: SubmissionStatus;
    summary: string | null;
}

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

export default Submission;