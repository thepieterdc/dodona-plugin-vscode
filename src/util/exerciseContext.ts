import { commands, Disposable, TextEditor, window, workspace } from "vscode";

import { identify } from "../identification";

/**
 * Whether the given editor contains a file linked to a Dodona exercise.
 */
function isExerciseOpen(editor: TextEditor | undefined): boolean {
    try {
        identify(editor?.document.getText() ?? "");
        return true;
    } catch {
        return false;
    }
}

/**
 * Keeps the `dodona.exerciseOpen` context key up to date, so commands can be
 * restricted to when an exercise is opened using `when` clauses.
 */
export function trackOpenExercise(): Disposable {
    const update = () =>
        void commands.executeCommand(
            "setContext",
            "dodona.exerciseOpen",
            isExerciseOpen(window.activeTextEditor),
        );

    update();
    return Disposable.from(
        window.onDidChangeActiveTextEditor(update),
        workspace.onDidChangeTextDocument(e => {
            if (e.document === window.activeTextEditor?.document) {
                update();
            }
        }),
    );
}