import { window } from "vscode";
import execute from "../api/client";
import { ContentPageReadListener } from "../listeners";
import ContentPage from "../api/resources/activities/contentPage";
import { AbstractActivityTreeItem } from "../treeView/items/activityTreeItem";
import { READING_ACTIVITY_COMPLETED_MSG } from "../constants/messages";

// TODO only show command in palette if an exercise is opened
//      (can be done using "when" in package.json)

/**
 * Action to complete a content page on Dodona.
 *
 * @param listener function that is called when the page is marked as read
 * @param contentPage the content page to mark as read
 */
export async function completeContentPage(
    listener: ContentPageReadListener,
    contentPage?: ContentPage | AbstractActivityTreeItem,
): Promise<void> {
    // Coerce to correct type.
    if (contentPage instanceof AbstractActivityTreeItem) {
        contentPage = <ContentPage>contentPage.activity;
    }

    // Validate whether this was called from the tree view or using the command
    // palette.
    if (!contentPage) {
        // Not supported.
        return;
    }

    // Check if the activity was already completed.
    if (contentPage.has_read) {
        return;
    }

    // Set the status bar.
    window.setStatusBarMessage("Completing the reading activity...");

    // Mark the content page as read.
    const ret = await execute(dodona =>
        dodona.activities.markAsRead(<ContentPage>contentPage),
    );

    // Send a notification message.
    window.showInformationMessage(READING_ACTIVITY_COMPLETED_MSG);

    // Clear the status bar.
    window.setStatusBarMessage("");

    // Notify listeners.
    ret && listener(ret);
}
