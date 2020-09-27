import Exercise from "../api/resources/activities/exercise";
import { commands, ViewColumn, WebviewPanel, window } from "vscode";
import { ExerciseDataClass } from "../treeView/dataClasses";
import IdentificationData, { identify } from "../identification";
import { AssertionError } from "assert";
import { getApiEnvironment } from "../configuration";
import execute from "../api/client";

// TODO only show command in palette if an exercise is opened
//      (can be done using "when" in package.json)

// Store all open descriptions.
const descriptionPanels = new Array<WebviewPanel>();

/**
 * Opens a new or existing panel with an exercise description.
 *
 * @param exercise the exercise to open the description for
 */
async function openExerciseDescription(exercise: Exercise) {
    // Find an existing panel and reveal that.
    for (let i = descriptionPanels.length - 1; i >= 0; i--) {
        try {
            if (descriptionPanels[i].title === exercise.name) {
                descriptionPanels[i].reveal(ViewColumn.Beside);
                return;
            }
        } catch (e) {
            // The Webview has been disposed.
            descriptionPanels.splice(i, 1);
        }
    }

    // Create a new panel.
    const panel = window.createWebviewPanel(
        "exerciseDescription",
        exercise.name,
        ViewColumn.Beside,
        { enableScripts: true },
    );
    descriptionPanels.push(panel);

    // Load the exercise HTML.
    panel.webview.html = await execute(dodona =>
        dodona.exercises.description(exercise),
    );
}

/**
 * Action to show the description of an exercise.
 *
 * @param exerciseDataClass the exercise to load the description for
 */
export async function showExerciseDescription(
    exerciseDataClass?: ExerciseDataClass,
) {
    // User can click in the sidebar to open the description.
    if (exerciseDataClass) {
        return openExerciseDescription(exerciseDataClass.exercise);
    }

    // Open the description of the currently opened file.
    const editor = window.activeTextEditor;

    // Identify the exercise.
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
                        commands.executeCommand("dodona.exercise.description");
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
        dodona.exercises.get(identification),
    );

    // Open the description.
    return openExerciseDescription(exercise);
}
