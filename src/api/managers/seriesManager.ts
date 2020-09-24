import Course from "../resources/course";
import { Got } from "got";
import Series from "../resources/series";

export default class SeriesManager {
    private readonly jsonApi: Got;

    /**
     * SeriesManager constructor.
     *
     * @param jsonApi json request factory
     */
    constructor(jsonApi: Got) {
        this.jsonApi = jsonApi;
    }

    /**
     * Gets the series in the given course.
     *
     * @return the series
     */
    public inCourse(course: Course): Promise<Series[]> {
        return this.jsonApi.get(course.series, { prefixUrl: "" }).json();
    }
}