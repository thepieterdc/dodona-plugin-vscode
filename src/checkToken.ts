import * as vscode from "vscode";

export function getToken(platform: string): string | null {
    // Get the API token from the settings.
    const config = vscode.workspace.getConfiguration("dodona");
    const token = config.get<string>(`api.token.${platform}`);

    // Display a warning notification if no Api token has been set
    if (!token) {
        const instructionsButton = "Instructions";
        const settingsButton = "Open Settings";
        vscode.window.showErrorMessage(`You have not yet configured your ${platform} Api token. To correctly set up your Visual Studio Code, click the Instructions button below.`, instructionsButton, settingsButton)
            .then(selection => {
                // Open the page when the user clicks the button
                if (selection === instructionsButton) {
                    vscode.env.openExternal(vscode.Uri.parse("https://dodona-edu.github.io/en/guides/vs-code-extension/#_3-insert-api-token"));
                    vscode.env.openExternal(vscode.Uri.parse("https://dodona-edu.github.io/en/guides/vs-code-extension/#_3-insert-api-token"));
                } else if (selection === settingsButton) {
                    vscode.commands.executeCommand("workbench.action.openSettings2");
                }
            });
        return null;
    }

    return token;
}