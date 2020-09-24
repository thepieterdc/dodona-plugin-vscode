import Exercise from "../api/resources/activities/exercise";
import { Uri, window, workspace } from "vscode";
import * as path from "path";
import * as vscode from "vscode";
import { getSyntax } from "../commentSyntax";
import { ExerciseDataClass } from "../treeView/dataClasses";

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
    const newFile = Uri.parse("untitled:" + path.join(workspace.rootPath, `${exercise.name}.${exercise.programming_language?.extension || "txt"}`));

    // Open the created file.
    workspace.openTextDocument(newFile).then(document => {
        // Build the file contents: the comment line and exercise boilerplate.
        const edit = new vscode.WorkspaceEdit();
        const commentedUrl = getSyntax(exercise.programming_language, exercise.url);
        const boilerplate = exercise.boilerplate != null ? exercise.boilerplate : "";
        edit.insert(newFile, new vscode.Position(0, 0), `${commentedUrl}\n${boilerplate}`);

        // Insert the contents into the file.
        return workspace.applyEdit(edit).then(success => {
            if (success) {
                window.showTextDocument(document);
            } else {
                window.showErrorMessage("There was an error trying to add the boilerplate for this exercise.");
            }
        });
    });
}