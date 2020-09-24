import Submission from "./api/resources/submission";

/**
 * A submission has finished evaluating has changed.
 */
export type SubmissionEvaluatedListener = (submission: Submission) => void;