import { z } from "zod";

import IdentificationData from "../../identification";
import { InvalidAccessToken } from "../errors/invalidAccessToken";
import HttpClient from "../http";
import {
    Submission,
    SubmissionCreatedResponse,
    submissionCreatedResponseSchema,
    submissionSchema,
    SubmissionWithCode,
    submissionWithCodeSchema,
} from "../resources/submission";

export default class SubmissionManager {
    private readonly jsonApi: HttpClient;
    private userId: number | null = null;

    /**
     * SubmissionManager constructor.
     *
     * @param jsonApi json request factory
     */
    constructor(jsonApi: HttpClient) {
        this.jsonApi = jsonApi;
    }

    /**
     * Submits the given solution to the given exercise.
     *
     * @param identification the identification
     * @param solution the solution
     * @return the response of the POST request
     */
    public create(
        identification: IdentificationData,
        solution: string,
    ): Promise<SubmissionCreatedResponse> {
        // Build the POST data.
        const body = {
            submission: {
                code: solution,
                course_id: identification.course,
                series_id: identification.series,
                exercise_id: identification.activity,
            },
        };

        // Submit the solution.
        return this.jsonApi.post(
            "submissions.json",
            submissionCreatedResponseSchema,
            body,
        );
    }

    /**
     * Gets a submission on Dodona.
     *
     * @param url the url to the submission
     */
    public async byUrl(url: string): Promise<Submission> {
        return this.jsonApi.json(url, submissionSchema);
    }

    /**
     * Gets a submission on Dodona, including its code.
     *
     * @param submission the submission
     */
    public async withCode(submission: Submission): Promise<SubmissionWithCode> {
        return this.jsonApi.json(submission.url, submissionWithCodeSchema);
    }

    /**
     * Gets the submissions of the current user to an exercise, most recent
     * first.
     *
     * @param identification the exercise identification
     */
    public async forExercise(
        identification: IdentificationData,
    ): Promise<Submission[]> {
        const params = new URLSearchParams({
            exercise_id: `${identification.activity}`,
            user_id: `${await this.currentUserId()}`,
        });
        if (identification.course) {
            params.set("course_id", `${identification.course}`);
        }
        if (identification.series) {
            params.set("series_id", `${identification.series}`);
        }
        return this.jsonApi.json(
            `submissions.json?${params}`,
            z.array(submissionSchema),
        );
    }

    /**
     * Gets the id of the user the API token belongs to.
     */
    private async currentUserId(): Promise<number> {
        if (this.userId === null) {
            const root = await this.jsonApi.json(
                "",
                z.object({ user: z.object({ id: z.number() }).nullish() }),
            );
            if (!root.user) {
                throw new InvalidAccessToken();
            }
            this.userId = root.user.id;
        }
        return this.userId;
    }
}