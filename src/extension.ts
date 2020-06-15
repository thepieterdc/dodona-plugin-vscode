import * as vscode from 'vscode';

export function activate(context: vscode.ExtensionContext) {
    console.log("test");

    const disp = vscode.commands.registerCommand('extension.helloWorld', () => {
        vscode.window.showInformationMessage('Hello!');
    });

    context.subscriptions.push(disp);
}