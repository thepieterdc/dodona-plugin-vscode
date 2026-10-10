import * as path from "path";

import { ProviderResult, TreeItemCollapsibleState } from "vscode";

import { Exercise } from "../../api/resources/activities";
import { Submission } from "../../api/resources/submission";
import { AbstractTreeItem } from "./abstractTreeItem";

/**
 * TreeView item for a submission to an exercise.
 */
export class SubmissionTreeItem extends AbstractTreeItem {
    public readonly submission: Submission;

    /**
     * SubmissionTreeItem constructor.
     *
     * @param exercise the exercise the submission belongs to
     * @param submission the submission
     */
    constructor(exercise: Exercise, submission: Submission) {
        const created = new Date(submission.created_at);
        super(created.toLocaleString(), TreeItemCollapsibleState.None);
        this.submission = submission;
        this.description = submission.status;
        this.tooltip = submission.summary ?? submission.status;
        this.contextValue = "submission";

        // Set the left-click action.
        this.command = {
            command: "dodona.submission.open",
            arguments: [exercise, submission],
            title: "Open submission",
        };

        this.iconPath = path.join(
            __filename,
            "..",
            "..",
            "..",
            "..",
            "assets",
            `exercise-${submission.status === "correct" ? "correct" : "wrong"}.svg`,
        );
    }

    getChildren(): ProviderResult<AbstractTreeItem[]> {
        return undefined;
    }
}