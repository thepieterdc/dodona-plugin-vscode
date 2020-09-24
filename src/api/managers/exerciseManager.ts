import { Got } from "got";
import Series from "../resources/series";
import Exercise from "../resources/activities/exercise";
import IdentificationData from "../../identification";

export default class ExerciseManager {
    private readonly htmlApi: Got;
    private readonly jsonApi: Got;

    /**
     * ExerciseManager constructor.
     *
     * @param jsonApi json request factory
     */
    constructor(htmlApi: Got, jsonApi: Got) {
        this.htmlApi = htmlApi;
        this.jsonApi = jsonApi;
    }

    /**
     * Gets the exercise description.
     *
     * @param exercise the exercise to get
     * @return HTML content of the description
     */
    public description(exercise: Exercise): Promise<string> {
        return this.htmlApi.get(exercise.description_url, { prefixUrl: "" }).text();
    }

    /**
     * Gets the exercise from the identification data.
     *
     * @param identification the identification data
     * @return exercise the exercise
     */
    public get(identification: IdentificationData): Promise<Exercise> {
        // Build the url.
        const { activity, course, series } = identification;
        let url = `activities/${activity}`;
        if (course && series) {
            url = `courses/${course}/series/${series}/activities/${activity}`;
        }

        // Send the request.
        return this.jsonApi.get(url).json();
    }

    /**
     * Gets the exercises in the given series.
     *
     * @param series the series
     * @return the exercises
     */
    public inSeries(series: Series): Promise<Exercise[]> {
        return this.jsonApi.get(series.exercises, { prefixUrl: "" }).json();
    }
}