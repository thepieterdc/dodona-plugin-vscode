import * as vscode from 'vscode';
import * as bent from 'bent';

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

            // Submit the code to Dodona.
            const headers = {
                'Authorization': config.get('api.token')
            }

            const body = {
                "submission": {
                    "code": code,
                    "course_id": null,
                    "series_id": null,
                    "exercise_id": 1545120484
                }
            }

            const response = await post('/submissions.json', body, headers);

            // Send a notification message.
            vscode.window.showInformationMessage('Solution submitted!');
        }
    });

    context.subscriptions.push(disp);
}