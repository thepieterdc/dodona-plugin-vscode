import { commands, Uri, ViewColumn, window, workspace } from "vscode";
import * as path from "path";
import * as fs from "fs";
import { getAutoDescription } from "../configuration";
import { showActivityDescription } from "./showActivityDescription";
import Exercise from "../api/resources/activities/exercise";
import { canonicalUrl, readFirstLine, workspaceRoot } from "../util/base";
import { identify } from "../identification";
import { comment } from "../util/comments";
import { generateFilename } from "../util/naming";

/**
 * Action to create a new file for an exercise.
 *
 * @param exercise the exercise to create a file for
 */
export async function createNewExercise(exercise: Exercise) {
    // Find the active workspace.
    const root = await workspaceFolder();
    if (!root) {
        return;
    }

    // Build the filename.
    const fileName = generateFilename(exercise);
    let filePath = path.join(root, fileName);

    // Check if the file already exists.
    if (fs.existsSync(filePath)) {
        // Identify the file to check if it is the same exercise.
        const identification = identify(await readFirstLine(filePath));
        if (identification && identification.activity === exercise.id) {
            // Exercise already exists, open it.
            const document = await workspace.openTextDocument(filePath);
            await window.showTextDocument(document, ViewColumn.One);
            await showActivityDescription(exercise);
            return;
        }

        // File already exists, but it is a different exercise. Ask the user to
        // provide a different filename.
        window.showWarningMessage(
            "This filename is already in use for a different exercise. Choose a different name for this exercise.",
        );
        const defaultUri = Uri.file(filePath);
        const saved = await window.showSaveDialog({ defaultUri });
        if (!saved) {
            // User pressed cancel.
            return;
        }

        // Use the new file instead.
        filePath = saved.fsPath;
    }

    // Build the commented exercise url.
    const url = canonicalUrl(exercise).toString();
    const commentedUrl = comment(url, exercise.programming_language);

    // Build the exercise boilerplate.
    const boilerplate = exercise.boilerplate || "";

    // Write the file contents.
    const contents = `${commentedUrl}\n\n${boilerplate}\n`;
    fs.writeFileSync(filePath, contents);

    // Open the file in the editor.
    const document = await workspace.openTextDocument(Uri.file(filePath));
    const editor = await window.showTextDocument(document, {
        viewColumn: ViewColumn.One,
    });

    // Open the description of the exercise if configured. Make sure the editor
    // is loaded before we load the description.
    if (editor && getAutoDescription()) {
        await showActivityDescription(exercise);
    }
}

/**
 * Gets the current workspace folder, or asks the user to select it if none.
 *
 * @return the (selected) workspace folder if any
 */
async function workspaceFolder(): Promise<string | undefined> {
    // Get the current workspace folder if there is one.
    const current = workspaceRoot();
    if (current) {
        return current;
    }

    // No folder is opened, ask the user to select one.
    const selectFolder = "Open Folder";
    const cancel = "Cancel";

    const choice = await window.showInformationMessage(
        "In order to create new files, you should first open a folder.",
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
