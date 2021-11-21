import { commands, ExtensionContext, window, workspace } from "vscode";
import RootDataProvider from "./treeView/dataProvider";
import { createNewExercise } from "./commands/createNewExercise";
import { CONFIG_KEY, getApiEnvironment } from "./configuration";
import { openCourse } from "./commands/openCourse";
import { openSeries } from "./commands/openSeries";
import { submitSolution } from "./commands/submitSolution";
import { showActivityDescription } from "./commands/showActivityDescription";
import { completeContentPage } from "./commands/completeContentPage";
import ContentPage from "./api/resources/activities/contentPage";
import {
    notificationsInterval,
    openNotifications,
} from "./commands/checkNotifications";

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

    // Command: Starts a loop that checks for new unread notifications
    const notificationsCommand = commands.registerCommand(
        "dodona.notifications",
        openNotifications,
    );

    const openCourseCommand = commands.registerCommand(
        "dodona.course.open",
        openCourse,
    );

    const openSeriesCommand = commands.registerCommand(
        "dodona.series.open",
        openSeries,
    );

    // Command: Reload the list of activities in the tree view.
    const refreshTreeViewCommand = commands.registerCommand(
        "dodona.treeview.refresh",
        () => {
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

    // Command: Open the settings page to configure the relevant API token.
    const settingsTokenCommand = commands.registerCommand(
        "dodona.settings.token",
        () => {
            commands.executeCommand(
                "workbench.action.openSettings",
                `dodona.auth.${getApiEnvironment()}`,
            );
        },
    );

    // Register all commands.
    context.subscriptions.push(
        completeContentPageCommand,
        createNewExerciseCommand,
        notificationsCommand,
        refreshTreeViewCommand,
        openCourseCommand,
        openSeriesCommand,
        settingsTokenCommand,
        showActivityDescriptionCommand,
        submitSolutionCommand,
    );

    // Register and create the activity tree view for the plugin.
    window.registerTreeDataProvider("dodona-activities", treeDataProvider);

    // Refresh the treeview when the API domain is changed.
    workspace.onDidChangeConfiguration(e => {
        if (e.affectsConfiguration(CONFIG_KEY)) {
            treeDataProvider.refresh();
        }
    });

    notificationsInterval();
}
