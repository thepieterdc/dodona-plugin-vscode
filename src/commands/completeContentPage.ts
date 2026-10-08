import { Uri, env } from "vscode";

import { ContentPage } from "../api/resources/activities";
import { AbstractActivityTreeItem } from "../treeView/items/activityTreeItem";

/**
 * Action to complete a content page on Dodona. Reading activities can only be
 * marked as read on Dodona itself, so the page is opened in the browser.
 *
 * @param contentPage the content page to open
 */
export async function completeContentPage(
    contentPage?: ContentPage | AbstractActivityTreeItem,
): Promise<void> {
    // Coerce to correct type.
    if (contentPage instanceof AbstractActivityTreeItem) {
        contentPage = <ContentPage>contentPage.activity;
    }

    // Not supported from the command palette.
    if (!contentPage) {
        return;
    }

    // Nothing to do if the activity was already completed.
    if (contentPage.has_read) {
        return;
    }

    await env.openExternal(Uri.parse(contentPage.url.replace(/\.json$/, "")));
}