import got, { Got } from "got";
import { IdentificationData } from "../exercise/identification";
import { Submission, SubmissionResponse } from "./resources/submission";
import { Exercise } from "./resources/exercise";
import { URL } from "url";

export class DodonaClient {
    private readonly htmlApi: Got;
    private readonly jsonApi: Got;

    private token = "";

    /**
     * DodonaClient constructor.
     *
     * @param host the Dodona host to connect to
     */
    constructor(host: string) {
        this.htmlApi = got.extend({
            headers: {
                Accept: "text/html",
            },
            prefixUrl: host,
            resolveBodyOnly: true,
            responseType: "text",
        });
        this.jsonApi = got.extend({
            headers: {
                Accept: "application/json",
            },
            prefixUrl: host,
            resolveBodyOnly: true,
            responseType: "json",
        });
    }

    /**
     * Sets the authentication token.
     *
     * @param token the token
     */
    public authenticate(token: string): void {
        this.token = token;
    }

    /**
     * Creates a new submission.
     *
     * @param identification the exercise to submit to
     * @param solution the code to submit
     */
    public async createSubmission(identification: IdentificationData, solution: string): Promise<SubmissionResponse> {
        // Build the POST data.
        const body = {
            "submission": {
                "code": solution,
                "course_id": identification.course,
                "series_id": identification.series,
                "exercise_id": identification.activity,
            },
        };

        // Submit the code.
        return this.jsonApi.post("submissions.json", {
            headers: {
                Authorization: this.token,
            },
            json: body,
        });
    }

    /**
     * Gets an exercise on Dodona.
     *
     * @param url the url to the exercise
     */
    public async getExercise(url: string): Promise<Exercise> {
        return this.jsonApi
            .extend({ prefixUrl: "" })
            .get(url, {
                headers: {
                    Authorization: this.token,
                },
            }).json();
    }

    /**
     * Gets the description of the exercise as HTML.
     *
     * @param exercise the exercise to fetch the description for
     */
    public async getExerciseDescription(exercise: Exercise): Promise<string> {
        return this.htmlApi
            .extend({ prefixUrl: "" })
            .get(exercise.description_url, {
                headers: {
                    Authorization: this.token,
                },
            }).text();
    }

    /**
     * Gets a submission on Dodona.
     *
     * @param url the url to the submission
     */
    public async getSubmission(url: string): Promise<Submission> {
        return this.jsonApi
            .extend({ prefixUrl: "" })
            .get(url, {
                headers: {
                    Authorization: this.token,
                },
            }).json();
    }
}