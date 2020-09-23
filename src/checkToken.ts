import * as vscode from 'vscode';

// Get the API token from the settings.
let config = vscode.workspace.getConfiguration('dodona');

export function getToken() {
    // Display a warning notification if no Api token has been set
    if (!(config.get("api.token"))) {
        const instructionsButton = "Instructions";
        const settingsButton = "Open Settings"
        vscode.window.showErrorMessage("You have not yet configured your Dodona Api token. To correctly set up your Visual Studio Code, click the Instructions button below.", instructionsButton, settingsButton)
            .then(selection => {
                // Open the page when the user clicks the button
                if (selection === instructionsButton) {
                    vscode.env.openExternal(vscode.Uri.parse("https://dodona-edu.github.io/en/guides/vs-code-extension/#_3-insert-api-token"))
                } else if (selection === settingsButton) {
                    vscode.commands.executeCommand("workbench.action.openSettings2");
                }
            });
        return null;
    }

    return config.get("api.token");
}