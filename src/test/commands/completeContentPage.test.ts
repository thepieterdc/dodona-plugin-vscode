import * as vscode from "vscode";
import { assert } from "chai";
import got from "got";
import { CONFIG_KEY } from "../../configuration";
import { Activity, ContentPage } from "../../api/resources/activities";
import { completeContentPage } from "../../commands/completeContentPage";

suite("completeContentPage", () => {
    test("Complete a content page", async () => {
        // Set the zeus authentication token.
        const config = vscode.workspace.getConfiguration(CONFIG_KEY);
        await config.update("auth.local", "zeus", true);
        await config.update("environment", "http://localhost:3000", true);

        // Get an available content page.
        const activities: Activity[] = await got("http://localhost:3000/activities", {
            headers: {
                Accept: "application/json",
                Authorization: "zeus",
            },
            resolveBodyOnly: true,
            responseType: "json",
        });
        let contentPage = activities.filter(a => a.type === "ContentPage" && !(a as ContentPage).has_read)[0] as ContentPage;

        // Validate that the content page is not read.
        assert.isFalse(contentPage.has_read);

        // Mark the content page as read.
        await completeContentPage(() => null, contentPage);

        // Validate that the content page has been marked as read.
        contentPage = await got(contentPage.url, {
            headers: {
                Accept: "application/json",
                Authorization: "zeus",
            },
            resolveBodyOnly: true,
            responseType: "json",
        });
        assert.isTrue(contentPage.has_read);
    });
});