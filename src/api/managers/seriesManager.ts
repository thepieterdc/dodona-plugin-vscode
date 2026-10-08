import { z } from "zod";

import HttpClient from "../http";
import { Course } from "../resources/course";
import { Series, seriesSchema } from "../resources/series";

export default class SeriesManager {
    private readonly jsonApi: HttpClient;

    /**
     * SeriesManager constructor.
     *
     * @param jsonApi json request factory
     */
    constructor(jsonApi: HttpClient) {
        this.jsonApi = jsonApi;
    }

    /**
     * Gets the series in the given course.
     *
     * @return the series
     */
    public inCourse(course: Course): Promise<Series[]> {
        return this.jsonApi.json(course.series, z.array(seriesSchema));
    }
}