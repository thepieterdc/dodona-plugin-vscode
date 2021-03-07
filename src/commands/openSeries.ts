import { commands } from "vscode";
import { Series } from "../api/resources/series";
import { SeriesTreeItem } from "../treeView/items/seriesTreeItem";
import { canonicalUrl } from "../util/base";

export function openSeries(seriesTreeItem: SeriesTreeItem) {
    const series: Series = seriesTreeItem.series;
    commands.executeCommand("vscode.open", canonicalUrl(series));
}
