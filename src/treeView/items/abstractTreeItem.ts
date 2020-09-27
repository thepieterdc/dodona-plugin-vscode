import { ProviderResult, TreeItem, TreeItemCollapsibleState } from "vscode";

/**
 * Main parent class for items that can be added to the Activity TreeView.
 */
export abstract class AbstractTreeItem extends TreeItem {
    /**
     * AbstractTreeItem constructor.
     *
     * @param label the label to display
     * @param collapsibleState whether this level is collapsed or not
     */
    protected constructor(label: string, collapsibleState: TreeItemCollapsibleState) {
        super(label, collapsibleState);
    }

    /**
     * Gets the children of this item in the tree.
     */
    abstract getChildren(): ProviderResult<AbstractTreeItem[]>;
}