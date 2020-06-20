import * as vscode from 'vscode';
import * as bent from 'bent';
import {identify} from "./exercise/identification";

const post = bent('https://dodona.ugent.be', 'POST', 'json')

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
            const response = await post('/submissions.json', body, headers);

            // Send a notification message.
            vscode.window.showInformationMessage('Solution submitted!');

            // Poll the submission url until it is evaluated.
        }
    });

    context.subscriptions.push(disp);
}