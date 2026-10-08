import { Submission } from "./api/resources/submission";

/**
 * A submission has finished evaluating.
 */
export type SubmissionEvaluatedListener = (submission: Submission) => void;