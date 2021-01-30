import Course from "../../api/resources/course";
import { ProviderResult, TreeItemCollapsibleState } from "vscode";
import execute from "../../api/client";
import { AbstractTreeItem } from "./abstractTreeItem";
import { SeriesTreeItem } from "./seriesTreeItem";

/**
 * TreeView item for a course.
 */
export class CourseTreeItem extends AbstractTreeItem {
    public readonly course: Course;

    /**
     * CourseItem constructor.
     *
     * @param course the course this item represents
     */
    constructor(course: Course) {
        super(course.name, TreeItemCollapsibleState.Collapsed);
        this.course = course;
        this.contextValue = "item-course";
    }

    getChildren(): ProviderResult<AbstractTreeItem[]> {
        // Get the series in the course.
        return (
            execute(dodona => dodona.series.inCourse(this.course))
                // Sort them by their order.
                .then(ss => (ss && ss.sort((a, b) => a.order - b.order)) || [])
                // Convert them to tree items.
                .then(ss => ss.map(s => new SeriesTreeItem(s)))
        );
    }
}
