import * as path from "path";
import { AbstractTreeItem } from "./abstractTreeItem";
import Activity from "../../api/resources/activities/activity";
import { ContentPage } from "../../api/resources/activities/contentPage";
import Exercise, {
    ExerciseStatus,
    findExerciseStatus,
} from "../../api/resources/activities/exercise";
import { ProviderResult, TreeItemCollapsibleState, ViewColumn } from "vscode";

// Icon to display next to completed content pages.
const CONTENT_PAGE_COMPLETED_ICON = path.join(__filename, "..", "..", "..", "..", "assets", "content-page-completed.svg");

/**
 * Creates an activity tree item.
 *
 * @param activity the activity to create an item for
 */
export default function createActivityTreeItem(activity: Activity): AbstractTreeItem {
    if (activity.type === "Exercise") {
        return new ExerciseTreeItem(<Exercise>activity);
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
    protected constructor(activity: Activity) {
        super(activity.name, TreeItemCollapsibleState.None);
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
            this.iconPath = path.join(__filename,
                "..",
                "..",
                "..",
                "..",
                "assets",
                "language-read.svg");
        }

    }
}

/**
 * TreeView item for an exercise.
 */
class ExerciseTreeItem extends AbstractActivityTreeItem {
    /**
     * ExerciseTreeItem constructor.
     *
     * @param exercise the exercise
     */
    constructor(exercise: Exercise) {
        super(exercise);

        // Set the left-click action.
        this.command = {
            command: "dodona.exercise.create",
            arguments: [exercise],
            title: "Create Exercise",
        };

        // Set the icon based on the status and programming language (language-text.svg as default).
        const status = findExerciseStatus(exercise);
        if (status !== ExerciseStatus.NOT_STARTED) {
            this.iconPath = path.join(
                __filename,
                "..",
                "..",
                "..",
                "..",
                "assets",
                `exercise-${status}.svg`);
        } else {
            this.iconPath = path.join(
                __filename,
                "..",
                "..",
                "..",
                "..",
                "assets",
                `language-${exercise.programming_language?.name || "text"}.svg`);
        }
    }
}