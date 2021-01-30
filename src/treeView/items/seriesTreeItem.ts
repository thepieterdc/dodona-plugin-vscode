import Series from "../../api/resources/series";
import { ProviderResult, TreeItemCollapsibleState } from "vscode";
import execute from "../../api/client";
import { AbstractTreeItem } from "./abstractTreeItem";
import createActivityTreeItem from "./activityTreeItem";

/**
 * TreeView item for a course.
 */
export class SeriesTreeItem extends AbstractTreeItem {
    public readonly series: Series;

    /**
     * SeriesTreeItem constructor.
     *
     * @param series the series this item represents
     */
    constructor(series: Series) {
        super(series.name, TreeItemCollapsibleState.Collapsed);
        this.series = series;
        this.contextValue = "item-series";
    }

    getChildren(): ProviderResult<AbstractTreeItem[]> {
        // Get the activities in the series.
        return (
            execute(dodona => dodona.activities.inSeries(this.series))
                // Convert them to tree items.
                .then(as => (as && as.map(createActivityTreeItem)) || [])
        );
    }
}
