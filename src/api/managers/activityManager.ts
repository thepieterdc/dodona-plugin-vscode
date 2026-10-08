import { z } from "zod";

import { DodonaEnvironments } from "../../dodonaEnvironment";
import IdentificationData, { identify } from "../../identification";
import HttpClient from "../http";
import { Activity, activitySchema, ContentPage } from "../resources/activities";
import { contentPageSchema } from "../resources/activities/contentPage";
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

    /**
     * Marks the given content page as read.
     *
     * @param contentPage the content page
     * @return the content page with updated read status
     */
    public async markAsRead(contentPage: ContentPage): Promise<ContentPage> {
        // Parse the url of the content page.
        const { environment, course, activity } = identify(contentPage.url);

        // Build the "Mark as read" url.
        const coursePart = course ? `/courses/${course}` : "";
        const readUrl = `${DodonaEnvironments[environment]}${coursePart}/activities/${activity}/read`;
        await this.jsonApi.post(readUrl, z.unknown());

        // Return the updated content page.
        return this.jsonApi.json(contentPage.url, contentPageSchema);
    }
}