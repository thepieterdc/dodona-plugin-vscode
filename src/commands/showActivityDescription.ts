import { commands, ViewColumn, WebviewPanel, window } from "vscode";
import IdentificationData, { identify } from "../identification";
import { AssertionError } from "assert";
import { getApiEnvironment } from "../configuration";
import execute from "../api/client";
import Activity from "../api/resources/activities/activity";
import { AbstractActivityTreeItem } from "../treeView/items/activityTreeItem";

// TODO only show command in palette if an exercise is opened
//      (can be done using "when" in package.json)

// Store all open descriptions.
const descriptionPanels = new Array<WebviewPanel>();

/**
 * Opens a new or existing panel with an activity description.
 *
 * @param activity the activity to open the description for
 * @param viewColumn the column in which the description must be shown
 */
async function openActivityDescription(
    activity: Activity,
    viewColumn = ViewColumn.Two,
) {
    // Find an existing panel and reveal that.
    for (let i = descriptionPanels.length - 1; i >= 0; i--) {
        try {
            if (descriptionPanels[i].title === activity.name) {
                descriptionPanels[i].reveal(viewColumn);
                return;
            }
        } catch (e) {
            // The Webview has been disposed.
            descriptionPanels.splice(i, 1);
        }
    }

    // Create a new panel.
    const panel = window.createWebviewPanel(
        "activityDescription",
        activity.name,
        viewColumn,
        { enableScripts: true },
    );

    descriptionPanels.push(panel);

    // Load the activity description HTML.
    const description = await execute(dodona =>
        dodona.activities.description(activity),
    );
    if (description) {
        panel.webview.html = description;
    } else {
        panel.dispose();
    }
}

/**
 * Action to show the description of an activity.
 *
 * @param activity the activity to load the description for
 * @param viewColumn the column in which to display the description
 */
export async function showActivityDescription(
    activity?: Activity | AbstractActivityTreeItem,
    viewColumn = ViewColumn.Two,
) {
    // Coerce to correct type.
    if (activity instanceof AbstractActivityTreeItem) {
        activity = activity.activity;
    }

    // User can click in the sidebar to open the description.
    if (activity) {
        return openActivityDescription(activity, viewColumn);
    }

    // Open the description of the currently opened file.
    const editor = window.activeTextEditor;

    // Identify the activity.
    let identification: IdentificationData;
    try {
        identification = identify(editor?.document.getText() || "");
    } catch (error) {
        // Display a proper error message instead of raising an error
        if (error instanceof AssertionError) {
            const tryAgain = "Try Again";
            window
                .showErrorMessage(
                    "No exercise link found. Make sure the first line of the file contains a comment with the link to the exercise.",
                    tryAgain,
                )
                .then(selection => {
                    // Retry when the user clicks Try Again.
                    if (selection === tryAgain) {
                        commands.executeCommand("dodona.activity.description");
                    }
                });
            return;
        }

        // Something else went wrong, rethrow error.
        throw error;
    }

    // Validate that the environment is correct.
    const apiEnvironment = getApiEnvironment();
    if (identification.environment !== apiEnvironment) {
        window.showErrorMessage(
            `You are trying to open an exercise from ${identification.environment.titlecase()}, but your environment is configured as ${apiEnvironment.titlecase()}.`,
        );
        return;
    }

    // Get the exercise.
    const exercise = await execute(dodona =>
        dodona.activities.get(identification),
    );

    // Open the description.
    return exercise && openActivityDescription(exercise, viewColumn);
}
