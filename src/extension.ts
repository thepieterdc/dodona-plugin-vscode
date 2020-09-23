import * as vscode from "vscode";
import { identify } from "./exercise/identification";
import { AssertionError } from "assert";
import { DataProvider } from "./exercise-treeview/treeDataProvider";
import { State } from "./exercise-treeview/data-classes";
import { sleep } from "./util";
import { DodonaClient } from "./api/client";
import { Exercise } from "./api/resources/exercise";

// Initialise a Dodona client.
let dodona = new DodonaClient("https://dodona.ugent.be");

// Get the API token from the settings.
let config = vscode.workspace.getConfiguration("dodona");
const dataProvider = new DataProvider();

export function activate(context: vscode.ExtensionContext) {
    const disp = vscode.commands.registerCommand("extension.submit", async () => {
        // Get the current editor.
        const editor = vscode.window.activeTextEditor;
        if (editor) {
            // Get the configuration from the settings.
            // Re-declare in case the user changed it.
            config = vscode.workspace.getConfiguration("dodona");

            // Declare this here so that the platform can be changed without restarting.
            const platform = config.get("platform") as string;
            dodona = new DodonaClient(config.get("api.host") as string);

            // Get the code.
            const code = editor.document.getText();

            // Try and get the Api token
            const token = getToken(platform);

            // If no token was set, getToken() displays a message, so this function only has to return
            if (token === null) {
                return;
            }

            // Set the authentication token.
            dodona.authenticate(token);

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

            // Check if the platforms match.
            if (!(platform.toLowerCase() === identification.platform)) {
                vscode.window.showErrorMessage(`You are trying to submit a ${oppositePlatform(platform)} exercise to ${platform}. Make sure you have properly configured your submission platform in the settings, and try again.`);
                return;
            }

            // Submit the code to Dodona.
            const submitResp = await dodona.createSubmission(identification, code);

            // Send a notification message.
            vscode.window.showInformationMessage("Solution submitted!");

            // Set the status bar.
            vscode.window.setStatusBarMessage("Evaluating submission...");

            // Get the result.
            let submission = await dodona.getSubmission(submitResp.url);

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
                submission = await dodona.getSubmission(submission.url);

                totalDelayed += 5000;
            }

            // Set the status bar.
            vscode.window.setStatusBarMessage("");

            // Define an action to open the submission details in a browser.
            const viewResultsAction = "View results";

            // Analyse the result.
            if (submission.status === "correct") {
                vscode.window.showInformationMessage("Solution was correct!", ...[viewResultsAction]).then((selection) => {
                    if (selection === viewResultsAction) {
                        vscode.commands.executeCommand("vscode.open", vscode.Uri.parse(submission.url.replace(".json", "")));
                    }
                });
                dataProvider.fireListeners(submission.exercise, State.Correct);
            } else if (submission.status === "wrong") {
                vscode.window.showWarningMessage("Solution was incorrect.", ...[viewResultsAction]).then((selection) => {
                    if (selection === viewResultsAction) {
                        vscode.commands.executeCommand("vscode.open", vscode.Uri.parse(submission.url.replace(".json", "")));
                    }
                });
                dataProvider.fireListeners(submission.exercise, State.Wrong);
            } else {
                vscode.window.showErrorMessage(submission.summary || "Unknown error.", ...[viewResultsAction]).then((selection) => {
                    if (selection === viewResultsAction) {
                        vscode.commands.executeCommand("vscode.open", vscode.Uri.parse(submission.url.replace(".json", "")));
                    }
                });
            }
        }
    });

    // Store all active panels
    const panels = new Array<vscode.WebviewPanel>();

    const descr = vscode.commands.registerCommand("extension.description", async (exercise) => {
        //TODO remove duplicate code
        const editor = vscode.window.activeTextEditor;

        if (editor) {
            // The column to show the webview in
            const columnToShowIn = editor ? editor.viewColumn : undefined;

            config = vscode.workspace.getConfiguration("dodona");
            const platform = config.get("platform") as string;

            // Get the code.
            const code = editor.document.getText();

            // Try and get the Api token
            const token = getToken(platform);

            // If no token was set, getToken() displays a message, so this function only has to return
            if (token === null) {
                return;
            }

            // Set the authentication token.
            dodona.authenticate(token);

            // Get the first line of the code.
            const firstLine = code.split("\n")[0];
            // TODO check if valid Dodona url, for now assume it is
            const dodonaUrl = firstLine.slice(1);

            // Check if the user is trying to submit to Dodona & has a Dodona URL in the code,
            // submitting a Dodona exercise to Naos does not work.
            if (!(dodonaUrl.toLowerCase().includes(platform.toLowerCase()))) {
                vscode.window.showErrorMessage(`You are trying to open a ${oppositePlatform(platform)} exercise on ${platform}. Make sure you have properly configured your submission platform in the settings, and try again.`);
                return;
            }

            const exercise = await dodona.getExercise(dodonaUrl);
            await showExerciseDescription(columnToShowIn!, exercise);
            return;
        }

        await showExerciseDescription(vscode.ViewColumn.Beside, exercise);
    })

    context.subscriptions.push(disp);
    context.subscriptions.push(descr);

    // Register & create the tree view for the plugin
    vscode.window.registerTreeDataProvider("dodona-exercises", dataProvider);
    vscode.window.createTreeView("dodona-exercises", { treeDataProvider: dataProvider });

    function getToken(platform: string): string | null {
        // Get the API token from the settings.
        const config = vscode.workspace.getConfiguration("dodona");
        const token = config.get<string>(`api.token.${platform}`);

        // Display a warning notification if no Api token has been set
        if (!token) {
            const instructionsButton = "Instructions";
            vscode.window.showErrorMessage(`You have not yet configured your ${platform} Api token. To correctly set up your Visual Studio Code, click the Instructions button below.`, instructionsButton)
                .then(selection => {
                    // Open the page when the user clicks the button
                    if (selection === instructionsButton) {
                        vscode.env.openExternal(vscode.Uri.parse("https://dodona-edu.github.io/en/guides/vs-code-extension/#_3-insert-api-token"));
                    }
                });
            return null;
        }

        return token;
    }

    // Return the opposite of the input platform (used in error message)
    function oppositePlatform(inputPlatform: string) {
        return inputPlatform === "Naos" ? "Dodona" : "Naos";
    }

    async function showExerciseDescription(columnToShowIn: vscode.ViewColumn, exercise: Exercise) {
        // Remove all closed panels in the array
        for (let i = panels.length - 1; i >= 0; i--) {
            //@ts-ignore
            if (panels[i]._store._isDisposed) {
                panels.splice(i, 1);
            } else if (panels[i].title === exercise.name) {
                // Check if a panel with this name already exists, if yes don't create a new one
                panels[i].reveal(columnToShowIn);
                return;
            }
        }

        // Create a new panel & add it to the array
        const panel = vscode.window.createWebviewPanel("exerciseDescription", exercise.name, vscode.ViewColumn.One, { enableScripts: true });
        panels.push(panel);

        panel.webview.html = await dodona.getExerciseDescription(exercise);
    }
}
