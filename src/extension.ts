import { commands, ExtensionContext, window } from "vscode";
import RootDataProvider from "./treeView/dataProvider";
import { createNewExercise } from "./commands/createNewExercise";
import { submitSolution } from "./commands/submitSolution";
import { showExerciseDescription } from "./commands/showExerciseDescription";

export function activate(context: ExtensionContext) {
    // Create a data provider for the tree view.
    const treeDataProvider = new RootDataProvider();

    // Command: Create a new file for an exercise.
    const createNewExerciseCommand = commands.registerCommand(
        "dodona.exercise.create", createNewExercise,
    );

    // Command: Show the description of an exercise.
    const showExerciseDescriptionCommand = commands.registerCommand(
        "dodona.exercise.description", showExerciseDescription,
    );

    // Command: Submit a solution to Dodona.
    const submitSolutionCommand = commands.registerCommand(
        "dodona.submit", submitSolution,
    );

    // Register all commands.
    context.subscriptions.push(
        createNewExerciseCommand,
        showExerciseDescriptionCommand,
        submitSolutionCommand);

    // Register & create the exercise tree view for the plugin.
    window.registerTreeDataProvider("dodona-exercises", treeDataProvider);
    window.createTreeView("dodona-exercises", { treeDataProvider });
}
