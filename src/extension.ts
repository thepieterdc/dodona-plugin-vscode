import * as vscode from 'vscode';
import * as bent from 'bent';
import { identify } from "./exercise/identification";
import { Submission, SubmissionResponse } from "./submission";
import { AssertionError } from 'assert';

const get = bent('json');
const getHTML = bent();
const post = bent('https://dodona.ugent.be', 'POST', 'json');
const sleep = (amt: number) => new Promise(r => setTimeout(r, amt));

export function activate(context: vscode.ExtensionContext) {
    const disp = vscode.commands.registerCommand('extension.submit', async () => {
        // Get the current editor.
        const editor = vscode.window.activeTextEditor;
        if (editor) {
            // Get the code.
            const code = editor.document.getText();

            // Try and get the Api token
            const token = getToken();

            // If no token was set, getToken() displays a message, so this function only has to return
            if (token === null) {
                return;
            }

            // Set the HTTP header.
            const headers = {
                'Authorization': token
            };

            // Identify the exercise.
            let identification;
            try {
                identification = identify(code);
            } catch (error) {
                // Display a proper error message instead of raising an error
                if (error instanceof AssertionError) {
                    const tryAgain = "Try Again";
                    vscode.window.showErrorMessage("No exercise link found. Make sure the first line of the file contains the link to the exercise, and is commented out.", tryAgain)
                    .then(selection => {
                        // Retry when the user clicks Try Again
                        if (selection === tryAgain) {
                            vscode.commands.executeCommand("extension.submit");
                        }
                    });
                    return;
                }
                
                // Something else went wrong, rethrow
                throw error;
            }

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

    // Store all active panels
    const panels = new Array<vscode.WebviewPanel>();

    const descr = vscode.commands.registerCommand('extension.description', async () => {
        //TODO remove duplicate code
        const editor = vscode.window.activeTextEditor;

        if (editor) {
            // The column to show the webview in
            const columnToShowIn = editor ? editor.viewColumn : undefined;

            // Get the code.
            const code = editor.document.getText();

            // Try and get the Api token
            const token = getToken();

            // If no token was set, getToken() displays a message, so this function only has to return
            if (token === null) {
                return;
            }

            // Set the HTTP header.
            const headers = {
                'Authorization': token
            };

            // Get the first line of the code.
            const firstLine = code.split("\n")[0];
            // TODO check if valid Dodona url, for now assume it is
            const dodonaUrl = firstLine.slice(1);
            const page = await get(dodonaUrl, {}, headers);
            
            // Can't return the main command from inside of an inline function, so keep track of a bool
            let shouldReturn = false;

            // Remove all closed panels in the array
            for(let i = panels.length - 1; i >= 0; i--) {
                //@ts-ignore
                if (panels[i]._store._isDisposed) {
                    panels.splice(i, 1);
                }
                //@ts-ignore
                else if (panels[i].title === page.name) {
                    // Check if a panel with this name already exists, if yes don't create a new one
                    panels[i].reveal(columnToShowIn);
                    shouldReturn = true;
                }
            }

            // In case a panel already existed, return
            if (shouldReturn) {
                return;
            }

            //@ts-ignore
            const panel = vscode.window.createWebviewPanel("exerciseDescription", page.name, vscode.ViewColumn.One, {enableScripts: true});
            panels.push(panel);
            
            //@ts-ignore
            const stream = await getHTML(page.description_url, {}, {});
            //@ts-ignore
            panel.webview.html = await stream.text();
        }
    });
    context.subscriptions.push(disp);
    context.subscriptions.push(descr);

    function getToken() {
        // Get the API token from the settings.
        const config = vscode.workspace.getConfiguration('dodona');
    
        // Display a warning notification if no Api token has been set
        if (!(config.get("api.token"))) {
            const instructionsButton = "Instructions";
            vscode.window.showErrorMessage("You have not yet configured your Dodona Api token. To correctly set up your Visual Studio Code, click the Instructions button below.", instructionsButton)
                .then(selection => {
                    // Open the page when the user clicks the button
                    if (selection === instructionsButton) {
                        vscode.env.openExternal(vscode.Uri.parse("https://dodona-edu.github.io/en/guides/vs-code-extension/#_3-insert-api-token"));
                    }
                });
            return null;
        }

        return config.get("api.token");
    }
}
