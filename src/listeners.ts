import { ContentPage } from "./api/resources/activities";
import Submission from "./api/resources/submission";

/**
 * A content page has been marked as read.
 */
export type ContentPageReadListener = (contentPage: ContentPage) => void;

/**
 * A submission has finished evaluating.
 */
export type SubmissionEvaluatedListener = (submission: Submission) => void;
