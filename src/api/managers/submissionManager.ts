import { Got } from "got";
import IdentificationData from "../../identification";
import Submission, { SubmissionCreatedResponse } from "../resources/submission";

export default class SubmissionManager {
    private readonly jsonApi: Got;

    /**
     * SubmissionManager constructor.
     *
     * @param jsonApi json request factory
     */
    constructor(jsonApi: Got) {
        this.jsonApi = jsonApi;
    }

    /**
     * Submits the given solution to the given exercise.
     *
     * @param identification the identification
     * @param solution the solution
     * @return the response of the POST request
     */
    public create(identification: IdentificationData,
                  solution: string): Promise<SubmissionCreatedResponse> {
        // Build the POST data.
        const body = {
            "submission": {
                "code": solution,
                "course_id": identification.course,
                "series_id": identification.series,
                "exercise_id": identification.activity,
            },
        };

        // Submit the solution.
        return this.jsonApi.post("submissions.json", { json: body }).json();
    }

    /**
     * Gets a submission on Dodona.
     *
     * @param url the url to the submission
     */
    public async byUrl(url: string): Promise<Submission> {
        return this.jsonApi.extend({ prefixUrl: "" }).get(url).json();
    }
}