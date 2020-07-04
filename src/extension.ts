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
            }

            // Submit the code to Dodona.
            const submitResp = await post('/submissions.json', body, headers) as SubmissionResponse;

            // Send a notification message.
            vscode.window.showInformationMessage('Solution submitted!');

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

            // Analyse the result.
            if (submission.status === "correct") {
                vscode.window.showInformationMessage('Solution was correct!');
            } else if (submission.status === "wrong") {
                vscode.window.showWarningMessage('Solution was incorrect.');
            } else {
                vscode.window.showErrorMessage(submission.summary || "Unknown error.");
            }
        }
    });

    context.subscriptions.push(disp);
}