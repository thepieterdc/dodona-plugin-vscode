import { z } from "zod";

import IdentificationData from "../../identification";
import HttpClient from "../http";
import { Activity, activitySchema } from "../resources/activities";
import { Series } from "../resources/series";

export default class ActivityManager {
    private readonly htmlApi: HttpClient;
    private readonly jsonApi: HttpClient;

    /**
     * ActivityManager constructor.
     *
     * @param htmlApi html request factory
     * @param jsonApi json request factory
     */
    constructor(htmlApi: HttpClient, jsonApi: HttpClient) {
        this.htmlApi = htmlApi;
        this.jsonApi = jsonApi;
    }

    /**
     * Gets the activity description.
     *
     * @param activity the activity to get
     * @return HTML content of the description
     */
    public description(activity: Activity): Promise<string> {
        return this.htmlApi.text(activity.description_url);
    }

    /**
     * Gets the activity from the identification data.
     *
     * @param identification the identification data
     * @return the activity
     */
    public get(identification: IdentificationData): Promise<Activity> {
        // Build the url.
        const { activity, course, series } = identification;
        let url = `activities/${activity}`;
        if (course && series) {
            url = `courses/${course}/series/${series}/activities/${activity}`;
        }

        // Send the request.
        return this.jsonApi.json(url, activitySchema);
    }

    /**
     * Gets the activities in the given series.
     *
     * @param series the series
     * @return the activities
     */
    public inSeries(series: Series): Promise<Activity[]> {
        return this.jsonApi.json(series.exercises, z.array(activitySchema));
    }
}