import { commands, Uri, window } from "vscode";
import { getEnvironmentUrl, getApiEnvironment } from "../configuration";
import execute from "../api/client";

// Create a default date with timestamp 0
// so everything is always more recent on startup
let lastNotification = 0;

/*
 *   Opens the user's notification inbox.
 */
export function openNotifications() {
    const url = Uri.parse(`${getEnvironmentUrl()}/notifications`);
    commands.executeCommand("vscode.open", url);
}

/**
 * Sends an api request to check if there are any unread notifications.
 *
 * @returns a boolean indicating new notifications
 */
async function checkNotifications(): Promise<boolean> {
    return await execute(dodona => dodona.notifications.newNotifications).then(
        notifications => {
            const newestNotification = notifications
                .filter(notification => !notification.read)
                .map(
                    notification =>
                        new Date(notification.updated_at).getTime() * 1000,
                )
                .max();

            if (newestNotification > lastNotification) {
                lastNotification = newestNotification;
                return true;
            }
            return false;
        },
    );
}

/**
 * A loop that checks for new notifications every 30 seconds,
 * and shows a notification in case of a new one.
 */
export async function notificationsInterval(): Promise<void> {
    // Check once before the loop starts (immediately on startup)
    if (await checkNotifications()) {
        showNotification();
    }

    setInterval(async () => {
        if (await checkNotifications()) {
            showNotification();
        }
    }, 60000);
}

function showNotification(): void {
    const button = "Open Notifications";
    const message = `You have new unread notifications on ${getApiEnvironment().titlecase()}.`;

    window.showInformationMessage(message, button).then(selection => {
        if (selection == button) {
            openNotifications();
        }
    });
}
