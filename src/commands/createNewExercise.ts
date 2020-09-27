import { Uri, window, workspace } from "vscode";
import * as path from "path";
import * as vscode from "vscode";
import { getSyntax } from "../commentSyntax";
import { ExerciseDataClass } from "../treeView/dataClasses";
import { getAutoDescription } from "../configuration";
import { showExerciseDescription } from ".././commands/showExerciseDescription";

/**
 * Action to create a new file for an exercise.
 *
 * @param exerciseDataClass the exercise to create a file for
 */
export async function createNewExercise(exerciseDataClass: ExerciseDataClass) {
    // Get the exercise.
    const { exercise } = exerciseDataClass;

    // Find the active workspace.
    if (!workspace.rootPath) {
        window.showErrorMessage("No active workspace found. Make sure you have opened a folder in Visual Studio Code and try again.");
        return;
    }

    // Create a new file.
    const fileName = `${exercise.name}.${exercise.programming_language?.extension || "txt"}`;
    const newFile = Uri.parse("untitled:" + path.join(workspace.rootPath, `${fileName}`));

    // Open the created file.
    workspace.openTextDocument(newFile).then(document => {
        window.showTextDocument(document);
        // Build the file contents: the comment line and exercise boilerplate.
        const edit = new vscode.WorkspaceEdit();
        const commentedUrl = getSyntax(exercise.programming_language, exercise.url);
        const boilerplate = exercise.boilerplate != null ? exercise.boilerplate : "";

        // If the document is not empty, clear it
        if (document.getText()) {
            const message = `File ${fileName} already exists, and is not empty. Clicking "Confirm" will clear this document's contents, and replace it with the exercise's URL & boilerplate. Any changes made will be lost. Are you sure you want to continue?`;
            const confirm = "Confirm";
            const decline = "Decline";

            // Show a warning message asking for confirmation so the user doesn't
            // accidentally erase their file
            vscode.window.showWarningMessage(message, confirm, decline)
                .then(selection => {
                    if (selection == confirm) {
                        // Create the range here, so that the user can't add any new code
                        // inbetween calling this function & confirming, which could
                        // mess it up (not deleting everything, going out of range, ...)
                        const code = document.getText().split("\n");
                        const range = new vscode.Range(0, 0, code.length - 1, code[code.length - 1].length);

                        // Delete the file content
                        edit.delete(newFile, range);
                        vscode.window.showInformationMessage(`Cleared ${fileName}.`);

                        // Add the URL & boilerplate
                        edit.insert(newFile, new vscode.Position(0, 0), `${commentedUrl}\n${boilerplate}`);
                        return applyEdit(edit);
                    }
            });
        } else {
            // Add the URL & boilerplate
            edit.insert(newFile, new vscode.Position(0, 0), `${commentedUrl}\n${boilerplate}`);
            return applyEdit(edit);
        }
    });

    // Open the exercise if the user checked this option in the configuration
    if (getAutoDescription()) {
        showExerciseDescription(exerciseDataClass);
    }
}

export async function applyEdit(edit: vscode.WorkspaceEdit) {
    // Insert the contents into the file.
    return workspace.applyEdit(edit).then(success => {
        if (!(success)) {
            window.showErrorMessage("There was an error trying to add the boilerplate for this exercise.");
        }
    });
}