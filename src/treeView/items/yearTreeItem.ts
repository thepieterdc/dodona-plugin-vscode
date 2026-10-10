import { ProviderResult, TreeItemCollapsibleState } from "vscode";

import { Course } from "../../api/resources/course";
import { AbstractTreeItem } from "./abstractTreeItem";
import { CourseTreeItem } from "./courseTreeItem";

// Label for courses that are not linked to an academic year.
const NO_YEAR_LABEL = "No academic year";

/**
 * TreeView item for an academic year.
 */
export class YearTreeItem extends AbstractTreeItem {
    public readonly year: string;
    private readonly courses: Course[];

    constructor(year: string, courses: Course[]) {
        super(year || NO_YEAR_LABEL, TreeItemCollapsibleState.Collapsed);
        this.year = year;
        this.courses = courses;
        this.contextValue = "item-year";
    }

    getChildren(): ProviderResult<AbstractTreeItem[]> {
        // Get all the courses
        return this.courses.map(c => new CourseTreeItem(c));
    }
}