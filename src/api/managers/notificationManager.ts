import { Got } from "got";
import { Notification } from "../resources/notification";

export default class NotificationManager {
    private readonly jsonApi: Got;

    /**
     * NotificationManager constructor.
     *
     * @param jsonApi json request factory
     */
    constructor(jsonApi: Got) {
        this.jsonApi = jsonApi;
    }

    /**
     * Gets the user's notifications
     *
     * @return a list of notifications
     */
    public get newNotifications(): Promise<Notification[]> {
        return this.jsonApi.get("notifications.json").json();
    }
}
