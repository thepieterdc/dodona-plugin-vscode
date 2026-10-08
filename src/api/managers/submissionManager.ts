import IdentificationData from "../../identification";
import HttpClient from "../http";
import {
    Submission,
    SubmissionCreatedResponse,
    submissionCreatedResponseSchema,
    submissionSchema,
} from "../resources/submission";

export default class SubmissionManager {
    private readonly jsonApi: HttpClient;

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
}