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
     * Gets the notifications of the user.
     *
     * @return a list of notifications
     */
    public get list(): Promise<Notification[]> {
        return this.jsonApi.get("notifications.json").json();
    }
}
