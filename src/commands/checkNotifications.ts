import { commands, Uri, window } from "vscode";
import { getEnvironmentUrl } from "../configuration";
import execute, { ErrorHandler } from "../api/client";
import "../prototypes/array";
import { UNREAD_NOTIFICATION_MSG } from "../constants/messages";
import { OPEN_NOTIFICATIONS_ACTION } from "../constants/actions";
import { Notification } from "../api/resources/notification";

/**
 * Watcher for notifications.
 */
export default class NotificationWatcher {
    // Whether the service should watch for notifications. This can be disabled
    // in the case of invalid tokens.
    private enabled = true;

    // Timestamp of the last unread notification.
    private lastNotification = 0;

    /**
     * Enable the service.
     */
    enable(): void {
        this.enabled = true;
    }

    /**
     * Sends an api request to check if there are any unread notifications.
     *
     * @returns the amount of unread notifications
     */
    private async unreadNotifications(): Promise<Notification[]> {
        // Only run if the service is enabled.
        if (!this.enabled) {
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
            if (unread.length > 0) {
                showNotificationMessage(unread.length);
            }
        } catch (e) {
            this.enabled = false;
        }

        // Run every minute.
        setInterval(async () => {
            try {
                const unread = await this.unreadNotifications();
                if (unread.length > 0) {
                    showNotificationMessage(unread.length);
                }
            } catch (e) {
                this.enabled = false;
            }
        }, 60000);
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
