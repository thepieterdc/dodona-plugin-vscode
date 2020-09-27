import {
    Event,
    EventEmitter,
    ProviderResult,
    TreeDataProvider,
    TreeItem,
} from "vscode";
import { AbstractTreeItem } from "./items/abstractTreeItem";
import execute from "../api/client";
import { CourseTreeItem } from "./items/courseTreeItem";

// TODO add an icon for course & series to make them easier to separate in the view

/**
 * Data provider for the exercise tree view.
 */

export default class RootDataProvider implements TreeDataProvider<AbstractTreeItem> {
    private _onDidChangeTreeData: EventEmitter<AbstractTreeItem | undefined> = new EventEmitter<AbstractTreeItem | undefined>();
    readonly onDidChangeTreeData: Event<AbstractTreeItem | undefined> = this._onDidChangeTreeData.event;

    getChildren(element?: AbstractTreeItem): ProviderResult<AbstractTreeItem[]> {
        if (element) {
            // Element in the tree.
            return element.getChildren();
        }

        // Get the courses the user is subscribed to.
        return execute(dodona => dodona.courses.subscribed)
            // Sort them alphabetically.
            .then(cs =>
                cs.sort((a, b) =>
                    a.name < b.name ? -1 : a.name > b.name ? 1 : 0,
                ),
            )
            // Convert them to tree items.
            .then(cs => cs.map(c => new CourseTreeItem(c)));
    }

    getTreeItem(element: AbstractTreeItem): TreeItem {
        return element;
    }

    refresh(): void {
        // TODO optimise this to not redraw the entire tree.
        this._onDidChangeTreeData.fire(undefined);
    }
}
