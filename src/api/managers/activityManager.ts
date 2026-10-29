import { z } from "zod";

import IdentificationData from "../../identification";
import HttpClient from "../http";
import { Activity, activitySchema } from "../resources/activities";
import { Series } from "../resources/series";

// Page size to request.
const ACTIVITIES_PER_PAGE = 100;

// Maximum amount of pages to fetch.
const MAX_PAGES = 10;

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
    public async inSeries(series: Series): Promise<Activity[]> {
        // Include pagination parameters.
        const activities: Activity[] = [];
        const url = new URL(series.exercises);
        url.searchParams.set("per_page", `${ACTIVITIES_PER_PAGE}`);
        for (let page = 1; page <= MAX_PAGES; page++) {
            url.searchParams.set("page", `${page}`);
            const data = await this.jsonApi.json(
                url.toString(),
                z.array(activitySchema),
            );
            activities.push(...data);
            if (data.length < ACTIVITIES_PER_PAGE) {
                break;
            }
        }
        return activities;
    }
}