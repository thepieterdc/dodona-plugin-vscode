import { commands, Uri } from "vscode";
import { Series } from "../api/resources/series";
import { SeriesTreeItem } from "../treeView/items/seriesTreeItem";

export function openSeries(seriesTreeItem: SeriesTreeItem) {
    const series: Series = seriesTreeItem.series;
    const url = Uri.parse(series.url.replace(".json", ""));
    commands.executeCommand("vscode.open", url);
}
