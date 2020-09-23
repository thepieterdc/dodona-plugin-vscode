export interface SubmissionResponse {
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

export interface Submission {
    exercise: string;
    status: SubmissionStatus;
    summary: string | null;
    url: string;
}