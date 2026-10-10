import * as path from "path";

import { ProviderResult, TreeItemCollapsibleState, ViewColumn } from "vscode";

import execute from "../../api/client";
import { Activity } from "../../api/resources/activities";
import { ContentPage } from "../../api/resources/activities";
import {
    Exercise,
    ExerciseStatus,
    findExerciseStatus,
} from "../../api/resources/activities/exercise";
import { Series } from "../../api/resources/series";
import { identify } from "../../identification";
import { AbstractTreeItem } from "./abstractTreeItem";
import { SubmissionTreeItem } from "./submissionTreeItem";

// Icon to display next to completed content pages.
const CONTENT_PAGE_COMPLETED_ICON = path.join(
    __filename,
    "..",
    "..",
    "..",
    "..",
    "assets",
    "content-page-completed.svg",
);

/**
 * Creates an activity tree item.
 *
 * @param activity the activity to create an item for
 * @param series the series the activity is shown in, if any
 */
export default function createActivityTreeItem(
    activity: Activity,
    series?: Series,
): AbstractTreeItem {
    if (activity.type === "Exercise") {
        return new ExerciseTreeItem(<Exercise>activity, series);
    }
    return new ContentPageTreeItem(<ContentPage>activity);
}

/**
 * Abstract TreeView item for an activity.
 */
export abstract class AbstractActivityTreeItem extends AbstractTreeItem {
    public readonly activity: Activity;

    /**
     * AbstractActivityTreeItem constructor.
     *
     * @param activity the activity
     */
    protected constructor(
        activity: Activity,
        collapsibleState = TreeItemCollapsibleState.None,
    ) {
        super(activity.name, collapsibleState);
        this.activity = activity;
        this.contextValue = `activity-${activity.type.toLowerCase()}`;
    }

    getChildren(): ProviderResult<AbstractTreeItem[]> {
        return undefined;
    }
}

/**
 * TreeView item for a content page.
 */
class ContentPageTreeItem extends AbstractActivityTreeItem {
    /**
     * ContentPageTreeItem constructor.
     *
     * @param contentPage the content page
     */
    constructor(contentPage: ContentPage) {
        super(contentPage);

        // Set the left-click action.
        this.command = {
            command: "dodona.activity.description",
            arguments: [contentPage, ViewColumn.One],
            title: "Open reading activity",
        };

        // Change the contentValue if the content page has been read.
        if (contentPage.has_read) {
            this.contextValue = `${this.contextValue}-read`;
        }

        // Set the icon based on the status.
        if (contentPage.has_read) {
            this.iconPath = CONTENT_PAGE_COMPLETED_ICON;
        } else {
            this.iconPath = path.join(
                __filename,
                "..",
                "..",
                "..",
                "..",
                "assets",
                "language-read.svg",
            );
        }
    }
}

/**
 * TreeView item for an exercise.
 */
class ExerciseTreeItem extends AbstractActivityTreeItem {
    private readonly exercise: Exercise;

    /**
     * ExerciseTreeItem constructor.
     *
     * @param exercise the exercise
     * @param series the series the exercise is shown in, if any
     */
    constructor(exercise: Exercise, series?: Series) {
        super(exercise, TreeItemCollapsibleState.Collapsed);
        this.exercise = exercise;

        // Set the left-click action.
        this.command = {
            command: "dodona.exercise.create",
            arguments: [exercise],
            title: "Create Exercise",
        };

        // Set the icon based on the status and programming language (language-text.svg as default).
        const status = findExerciseStatus(
            exercise,
            series?.deadline ? new Date(series.deadline) : null,
        );
        if (status !== ExerciseStatus.NOT_STARTED) {
            this.iconPath = path.join(
                __filename,
                "..",
                "..",
                "..",
                "..",
                "assets",
                `exercise-${status}.svg`,
            );
        } else {
            this.iconPath = path.join(
                __filename,
                "..",
                "..",
                "..",
                "..",
                "assets",
                `language-${exercise.programming_language?.name || "text"}.svg`,
            );
        }
    }

    getChildren(): ProviderResult<AbstractTreeItem[]> {
        // Get the submissions of the user to this exercise.
        const identification = identify(this.exercise.url);
        return execute(dodona =>
            dodona.submissions.forExercise(identification),
        ).then(submissions =>
            submissions?.map(s => new SubmissionTreeItem(this.exercise, s)),
        );
    }
}