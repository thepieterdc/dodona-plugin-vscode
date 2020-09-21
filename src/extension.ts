import * as vscode from 'vscode';
import * as bent from 'bent';
import {identify} from "./exercise/identification";
import {Submission, SubmissionResponse} from "./submission";

const get = bent('json');
const post = bent('https://dodona.ugent.be', 'POST', 'json');
const sleep = (amt: number) => new Promise(r => setTimeout(r, amt));

export function activate(context: vscode.ExtensionContext) {
    const disp = vscode.commands.registerCommand('extension.submit', async () => {
        // Get the current editor.
        const editor = vscode.window.activeTextEditor;
        if (editor) {
            // Get the code.
            const code = editor.document.getText();

            // Get the API token from the settings.
            const config = vscode.workspace.getConfiguration('dodona');

            // Set the HTTP header.
            const headers = {
                'Authorization': config.get('api.token')
            };

            // Display a warning notification if no Api token has been set
            if (!(config.get("api.token"))) {
                const instructionsButton = "Instructions";
                vscode.window.showWarningMessage("You have not yet configured your Dodona Api token. To correctly set up your Visual Studio Code, click the Instructions button below.", instructionsButton)
                .then(selection => {
                    // Open the page when the user clicks the button
                    if (selection === instructionsButton) {
                        vscode.env.openExternal(vscode.Uri.parse("https://dodona-edu.github.io/en/guides/vs-code-extension/#_3-insert-api-token"))
                    }
                });
                return;
            }

            // Identify the exercise.
            const identification = identify(code);

            // Set the body.
            const body = {
                "submission": {
                    "code": code,
                    "course_id": identification.course,
                    "series_id": identification.series,
                    "exercise_id": identification.activity
                }
            };

            // Submit the code to Dodona.
            const submitResp = await post('/submissions.json', body, headers) as SubmissionResponse;

            // Send a notification message.
            vscode.window.showInformationMessage('Solution submitted!');

            // Set the status bar.
            vscode.window.setStatusBarMessage('Evaluating submission...');

            // Get the result.
            let submission = await get(submitResp.url, {}, headers) as Submission;

            // Poll the submission url every 5 seconds until it is evaluated.
            let totalDelayed = 0;
            while (submission.status === "queued" || submission.status === "running") {
                // Validate the timeout.
                if (totalDelayed >= 120000) {
                    throw new Error("Timeout reached for submission.");
                }

                // Wait the delay.
                await sleep(5000);

                // Refresh the response.
                submission = await get(submitResp.url, {}, headers) as Submission;

                totalDelayed += 5000;
            }

            // Set the status bar.
            vscode.window.setStatusBarMessage('');

            // Define an action to open the submission details in a browser.
            const viewResultsAction = "View results";

            // Analyse the result.
            if (submission.status === "correct") {
                vscode.window.showInformationMessage('Solution was correct!', ...[viewResultsAction]).then((selection) => {
                    if (selection === viewResultsAction) {
                        vscode.commands.executeCommand('vscode.open', vscode.Uri.parse(submission.url.replace(".json", "")));
                    }
                });
            } else if (submission.status === "wrong") {
                vscode.window.showWarningMessage('Solution was incorrect.', ...[viewResultsAction]).then((selection) => {
                    if (selection === viewResultsAction) {
                        vscode.commands.executeCommand('vscode.open', vscode.Uri.parse(submission.url.replace(".json", "")));
                    }
                });
            } else {
                vscode.window.showErrorMessage(submission.summary || "Unknown error.", ...[viewResultsAction]).then((selection) => {
                    if (selection === viewResultsAction) {
                        vscode.commands.executeCommand('vscode.open', vscode.Uri.parse(submission.url.replace(".json", "")));
                    }
                });
            }
        }
    });

    context.subscriptions.push(disp);
}
