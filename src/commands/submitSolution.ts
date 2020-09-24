import { commands, Uri, window } from "vscode";
import IdentificationData, { identify } from "../identification";
import { AssertionError } from "assert";
import { getApiEnvironment } from "../configuration";
import execute from "../api/client";
import { sleep } from "../util";
import { SubmissionEvaluatedListener } from "../listeners";

// TODO only show command in palette if an exercise is opened
//      (can be done using "when" in package.json)

/**
 * Action to submit a solution to Dodona.
 *
 * @param listener function that is called when a submission is evaluated
 */
export async function submitSolution(listener: SubmissionEvaluatedListener): Promise<void> {
    const editor = window.activeTextEditor;
    if (editor) {
        // Get the code.
        const code = editor.document.getText();

        // Identify the exercise.
        let identification: IdentificationData;
        try {
            identification = identify(code);
        } catch (error) {
            // Display a proper error message instead of raising an error
            if (error instanceof AssertionError) {
                const tryAgain = "Try Again";
                window.showErrorMessage("No exercise link found. Make sure the first line of the file contains a comment with the link to the exercise.", tryAgain)
                    .then(selection => {
                        // Retry when the user clicks Try Again
                        if (selection === tryAgain) {
                            commands.executeCommand("dodona.submit");
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
            window.showErrorMessage(`You are trying to submit an exercise to ${identification.environment.titlecase()}, but your environment is configured as ${apiEnvironment.titlecase()}.`);
            return;
        }

        // Submit the code to Dodona.
        const submitResp = await execute(dodona =>
            dodona.submissions.create(identification, code),
        );

        // Send a notification message.
        window.showInformationMessage("Solution submitted!");

        // Set the status bar.
        window.setStatusBarMessage("Evaluating submission...");

        // Get the result.
        let submission = await execute(dodona =>
            dodona.submissions.byUrl(submitResp!.url),
        );

        // Poll the submission url every 5 seconds until it is evaluated.
        let totalDelay = 0;
        while (["queued", "running"].includes(submission!.status)) {
            // Validate the timeout.
            if (totalDelay >= 120000) {
                throw new Error("Timeout reached for submission.");
            }

            // Wait the delay.
            await sleep(5000);

            // Refresh the response.
            submission = await execute(dodona =>
                dodona.submissions.byUrl(submitResp!.url),
            );

            totalDelay += 5000;
        }

        // Set the status bar.
        window.setStatusBarMessage("");

        // Define an action to open the submission details in a browser.
        const viewResultsAction = "View results";

        // Analyse the result.
        const url = Uri.parse(submission!.url.replace(".json", ""));
        if (submission!.status === "correct") {
            window.showInformationMessage("Solution was correct!", ...[viewResultsAction]).then((selection) => {
                if (selection === viewResultsAction) {
                    commands.executeCommand("vscode.open", url);
                }
            });
        } else if (submission!.status === "wrong") {
            window.showWarningMessage("Solution was incorrect.", ...[viewResultsAction]).then((selection) => {
                if (selection === viewResultsAction) {
                    commands.executeCommand("vscode.open", url);
                }
            });
        } else {
            window.showErrorMessage(submission!.summary || "Unknown error.", ...[viewResultsAction]).then((selection) => {
                if (selection === viewResultsAction) {
                    commands.executeCommand("vscode.open", url);
                }
            });
        }

        // Notify listeners.
        listener(submission!);
    }
}