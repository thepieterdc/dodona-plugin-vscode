import * as fs from "fs";
import * as readline from "readline";

import { commands, Uri, window, workspace } from "vscode";

import { Resource } from "../api/resources/resource";

/**
 * Gets the canonical url of the resource, being the url without any extension.
 *
 * @param resource the resource to consider
 * @return the canonical url
 */
export function canonicalUrl(resource: Resource): Uri {
    return Uri.parse(resource.url.replace(".json", ""));
}

/**
 * Returns either the singular or the plural form of the word, depending on the
 * amount.
 *
 * @param amount the amount of items
 * @param singular the singular form
 * @param plural the plural form. If blank, this defaults to singular + s.
 */
export function pluralise(
    amount: number,
    singular: string,
    plural?: string,
): string {
    if (amount === 1) {
        return singular;
    }
    return plural || singular + "s";
}

/**
 * Reads the first line of the file at the given uri.
 *
 * @param uri the file path
 */
export async function readFirstLine(uri: string): Promise<string> {
    // Open a new stream.
    const stream = fs.createReadStream(uri, { encoding: "utf8" });
    const reader = readline.createInterface({ input: stream });

    // Consume the stream until the first newline is found.
    return await new Promise(resolve => {
        reader.on("line", line => {
            reader.close();
            stream.close();
            resolve(line);
        });
    });
}

/**
 * Halts execution for the given amount of milliseconds.
 *
 * @param amt amount of time to wait
 */
export function sleep(amt: number): Promise<void> {
    return new Promise(r => setTimeout(r, amt));
}

/**
 * Gets the workspace folder that contains the given file uri.
 *
 * @param file the base file
 */
export function workspaceRoot(file?: Uri): string | undefined {
    // If a file is provided, get the folder of that file.
    const folder = file && workspace.getWorkspaceFolder(file);
    if (folder) {
        return folder.uri.fsPath;
    }

    // Otherwise, fall back to the first workspace.
    const folders = workspace.workspaceFolders;
    return folders && folders.length ? folders[0].uri.fsPath : undefined;
}

/**
 * Gets the current workspace folder, or asks the user to select it if none.
 *
 * @param message the message to show when no folder is opened
 * @return the (selected) workspace folder if any
 */
export async function workspaceFolder(
    message = "In order to create new files, you should first open a folder.",
): Promise<string | undefined> {
    // Get the current workspace folder if there is one.
    const current = workspaceRoot();
    if (current) {
        return current;
    }

    // No folder is opened, ask the user to select one.
    const selectFolder = "Open Folder";
    const cancel = "Cancel";

    const choice = await window.showInformationMessage(
        message,
        selectFolder,
        cancel,
    );

    // If the user decided to cancel for whatever reason, do nothing
    if (!choice || choice === cancel) {
        return undefined;
    }

    const selected = await window.showOpenDialog({
        canSelectFiles: false,
        canSelectFolders: true,
        canSelectMany: false,
        title: "Choose a folder to work in",
    });

    if (!selected) return undefined;

    const uri = selected[0];
    await commands.executeCommand("vscode.openFolder", uri);
    return uri.fsPath;
}