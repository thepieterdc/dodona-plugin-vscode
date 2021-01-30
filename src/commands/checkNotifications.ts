import { commands, Uri, window } from "vscode";
import { getEnvironmentUrl } from "../configuration";
import execute from "../api/client";
import "../prototypes/array";
import { UNREAD_NOTIFICATION_MSG } from "../constants/messages";
import { OPEN_NOTIFICATIONS_ACTION } from "../constants/actions";

/**
 * A loop that checks for new notifications every minute and triggers a message
 * to alert the user of unread ones.
 */
export async function notificationsInterval(): Promise<void> {
    // Startup.
    unreadNotifications().then(amount => {
        if (amount > 0) {
            showNotificationMessage(amount);
        }
    });

    // Check every minute.
    setInterval(async () => {
        const unread = await unreadNotifications();
        if (unread > 0) {
            showNotificationMessage(unread);
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
async function unreadNotifications(): Promise<number> {
    // Get all the notifications.
    const notifications = await execute(dodona => dodona.notifications.list);
    if (!notifications || notifications.length === 0) {
        // No notifications were found (or an error has occurred).
        return 0;
    }

    // Get the amount of unread notifications.
    return notifications.filter(notification => !notification.read).length;
}
