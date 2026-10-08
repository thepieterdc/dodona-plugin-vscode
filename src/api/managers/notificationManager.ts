import { z } from "zod";

import HttpClient from "../http";
import { Notification, notificationSchema } from "../resources/notification";

export default class NotificationManager {
    private readonly jsonApi: HttpClient;

    /**
     * NotificationManager constructor.
     *
     * @param jsonApi json request factory
     */
    constructor(jsonApi: HttpClient) {
        this.jsonApi = jsonApi;
    }

    /**
     * Gets the notifications of the user.
     *
     * @return a list of notifications
     */
    public get list(): Promise<Notification[]> {
        return this.jsonApi.json(
            "notifications.json",
            z.array(notificationSchema),
        );
    }
}