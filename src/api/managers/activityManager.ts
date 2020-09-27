import { Got } from "got";
import Series from "../resources/series";
import IdentificationData, { identify } from "../../identification";
import Activity from "../resources/activities/activity";
import ContentPage from "../resources/activities/contentPage";
import { DodonaEnvironments } from "../../dodonaEnvironment";

export default class ActivityManager {
    private readonly htmlApi: Got;
    private readonly jsonApi: Got;

    /**
     * ActivityManager constructor.
     *
     * @param htmlApi html request factory
     * @param jsonApi json request factory
     */
    constructor(htmlApi: Got, jsonApi: Got) {
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
        return this.htmlApi.get(activity.description_url, { prefixUrl: "" }).text();
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
        return this.jsonApi.get(url).json();
    }

    /**
     * Gets the activities in the given series.
     *
     * @param series the series
     * @return the activities
     */
    public inSeries(series: Series): Promise<Activity[]> {
        return this.jsonApi.get(series.exercises, { prefixUrl: "" }).json();
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
        await this.jsonApi.post(readUrl, { prefixUrl: "" });

        // Return the updated content page.
        return this.jsonApi.get(contentPage.url, { prefixUrl: "" }).json();
    }
}