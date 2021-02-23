import Course from "../../api/resources/course";
import { ProviderResult, TreeItemCollapsibleState } from "vscode";
import { AbstractTreeItem } from "./abstractTreeItem";
import { CourseTreeItem } from "./courseTreeItem";

/**
 * TreeView item for an academic year.
 */
export class YearTreeItem extends AbstractTreeItem {
    public readonly year: string;
    private readonly courses: Course[];

    constructor(year: string, courses: Course[]) {
        super(year, TreeItemCollapsibleState.Collapsed);
        this.year = year;
        this.courses = courses;
        this.contextValue = "item-year";
    }

    getChildren(): ProviderResult<AbstractTreeItem[]> {
        // Get all the courses
        return this.courses.map(c => new CourseTreeItem(c));
    }
}
