import "../prototypes/array";
import { commands, Uri, window } from "vscode";

import execute, { ErrorHandler } from "../api/client";
import { Notification } from "../api/resources/notification";
import { getApiToken, getEnvironmentUrl } from "../configuration";
import { OPEN_NOTIFICATIONS_ACTION } from "../constants/actions";
import { UNREAD_NOTIFICATION_MSG } from "../constants/messages";

/**
 * Watcher for notifications.
 */
export default class NotificationWatcher {
    // Whether the service should watch for notifications. This can be disabled
    // in the case of invalid tokens.
    private enabled = true;

    private disposed = false;

    private interval: ReturnType<typeof setInterval> | undefined;

    // Timestamp of the last unread notification.
    private lastNotification = 0;

    /**
     * Enable the service.
     */
    enable(): void {
        this.enabled = true;
    }

    dispose(): void {
        this.disposed = true;
        if (this.interval !== undefined) {
            clearInterval(this.interval);
            this.interval = undefined;
        }
    }

    /**
     * Sends an api request to check if there are any unread notifications.
     *
     * @returns the amount of unread notifications
     */
    private async unreadNotifications(): Promise<Notification[]> {
        // Only run if the service is enabled and an API token is configured.
        if (this.disposed || !this.enabled || !getApiToken()) {
            return [];
        }

        // Get all the notifications.
        const notifications = await execute(
            dodona => dodona.notifications.list,
            ErrorHandler.RAISE,
        );

        // Filter the notifications to the unread ones.
        const filtered = (notifications || []).filter(
            n =>
                !n.read &&
                new Date(n.updated_at).getTime() > this.lastNotification,
        );

        // Update the last notification timestamp.
        if (filtered.length > 0) {
            this.lastNotification = filtered
                .map(n => new Date(n.updated_at).getTime())
                .max();
        }

        return filtered;
    }

    async watch(): Promise<void> {
        // Run once on start.
        try {
            const unread = await this.unreadNotifications();
            if (!this.disposed && unread.length) {
                showNotificationMessage(unread.length);
            }
        } catch {
            this.enabled = false;
        }

        // The watcher may have been disposed while the initial request ran.
        if (this.disposed) {
            return;
        }

        // Run every 10 minutes.
        this.interval = setInterval(
            async () => {
                try {
                    const unread = await this.unreadNotifications();
                    if (!this.disposed && unread.length) {
                        showNotificationMessage(unread.length);
                    }
                } catch {
                    this.enabled = false;
                }
            },
            10 * 60 * 1000,
        );
    }
}

/**
 * Opens the user's notification inbox.
 */
export function openNotifications() {
    const url = Uri.parse(`${getEnvironmentUrl()}/notifications`);
    commands.executeCommand("vscode.open", url);
}

/**
 * Shows an information message notifying the user that they have new
 * notifications.
 *
 * @param amount the amount of unread notifications
 */
async function showNotificationMessage(amount: number): Promise<void> {
    const message = UNREAD_NOTIFICATION_MSG(amount);
    const action = await window.showInformationMessage(
        message,
        OPEN_NOTIFICATIONS_ACTION,
    );
    if (action === OPEN_NOTIFICATIONS_ACTION) {
        openNotifications();
    }
}