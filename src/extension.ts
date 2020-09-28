import { commands, ExtensionContext, window, workspace } from "vscode";
import RootDataProvider from "./treeView/dataProvider";
import { createNewExercise } from "./commands/createNewExercise";
import { submitSolution } from "./commands/submitSolution";
import { showActivityDescription } from "./commands/showActivityDescription";
import { completeContentPage } from "./commands/completeContentPage";
import ContentPage from "./api/resources/activities/contentPage";

export function activate(context: ExtensionContext) {
    // Create a data provider for the tree view.
    const treeDataProvider = new RootDataProvider();

    // Command: Create a new file for an exercise.
    const createNewExerciseCommand = commands.registerCommand(
        "dodona.exercise.create",
        createNewExercise,
    );

    // Command: Show the description of an activity.
    const showActivityDescriptionCommand = commands.registerCommand(
        "dodona.activity.description",
        showActivityDescription,
    );

    // Command: Mark a content page as read.
    const completeContentPageCommand = commands.registerCommand(
        "dodona.contentPage.read",
        async (contentPage?: ContentPage) => {
            await completeContentPage(() => {
                treeDataProvider.refresh();
            }, contentPage);
        },
    );

    const refreshTreeView = commands.registerCommand(
        "dodona.treeview.refresh",
        async () => {
            treeDataProvider.refresh();
        },
    );

    // Command: Submit a solution to Dodona.
    const submitSolutionCommand = commands.registerCommand(
        "dodona.submit",
        async () => {
            await submitSolution(() => {
                treeDataProvider.refresh();
            });
        },
    );

    // Register all commands.
    context.subscriptions.push(
        completeContentPageCommand,
        createNewExerciseCommand,
        refreshTreeView,
        showActivityDescriptionCommand,
        submitSolutionCommand,
    );

    // Register and create the activity tree view for the plugin.
    window.registerTreeDataProvider("dodona-activities", treeDataProvider);
    window.createTreeView("dodona-activities", { treeDataProvider });

    // Refresh the treeview when the API domain is changed.
    workspace.onDidChangeConfiguration(() => {
        treeDataProvider.refresh();
    });
}
