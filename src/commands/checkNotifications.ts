import { commands, Uri, window } from "vscode";
import { getEnvironmentUrl } from "../configuration";
import execute from "../api/client";
import "../prototypes/array";
import { UNREAD_NOTIFICATION_MSG } from "../constants/messages";
import { OPEN_NOTIFICATIONS_ACTION } from "../constants/actions";
import { Notification } from "../api/resources/notification";

// Create a timestamp to keep track of the latest unread notification.
let lastNotification = 0;

/**
 * A loop that checks for new notifications every minute and triggers a message
 * to alert the user of unread ones.
 */
export async function notificationsInterval(): Promise<void> {
    // Startup.
    unreadNotifications().then(notifications => {
        if (notifications.length > 0) {
            showNotificationMessage(notifications.length);
            lastNotification = notifications
                .map(notif => new Date(notif.updated_at).getTime())
                .max();
        }
    });

    // Check every minute.
    setInterval(async () => {
        const unread = await unreadNotifications();
        lastNotification = unread
            .map(notif => new Date(notif.updated_at).getTime())
            .max();
        if (unread.length > 0) {
            showNotificationMessage(unread.length);
        }
    }, 60000);
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

/**
 * Sends an api request to check if there are any unread notifications.
 *
 * @returns the amount of unread notifications
 */
async function unreadNotifications(): Promise<Notification[]> {
    // Get all the notifications.
    const notifications = await execute(
        dodona => dodona.notifications.list,
        false,
    );
    if (!notifications || notifications.length === 0) {
        // No notifications were found (or an error has occurred).
        return [];
    }

    // Get the unread notifications.
    return notifications.filter(
        notification =>
            !notification.read &&
            new Date(notification.updated_at).getTime() > lastNotification,
    );
}
