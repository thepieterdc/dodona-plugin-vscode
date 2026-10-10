import {
    commands,
    Event,
    EventEmitter,
    ProviderResult,
    TreeDataProvider,
    TreeItem,
    TreeItemCollapsibleState,
} from "vscode";

import execute from "../api/client";
import { Course } from "../api/resources/course";
import {
    getCourseFilter,
    getSortOption,
    getYearFilter,
} from "../configuration";
import { AbstractTreeItem } from "./items/abstractTreeItem";
import { YearTreeItem } from "./items/yearTreeItem";

// TODO add an icon for course & series to make them easier to separate in the view

/**
 * Data provider for the exercise tree view.
 */

export default class RootDataProvider implements TreeDataProvider<AbstractTreeItem> {
    private _onDidChangeTreeData: EventEmitter<AbstractTreeItem | undefined> =
        new EventEmitter<AbstractTreeItem | undefined>();
    readonly onDidChangeTreeData: Event<AbstractTreeItem | undefined> =
        this._onDidChangeTreeData.event;

    // In-flight request for the root items. VS Code may request the root
    // children multiple times on initialisation.
    private pendingRoot: Promise<AbstractTreeItem[]> | null = null;

    getChildren(
        element?: AbstractTreeItem,
    ): ProviderResult<AbstractTreeItem[]> {
        if (element) {
            // Element in the tree.
            return Promise.resolve(element.getChildren()).then(children => {
                // Once we know an element has no children, drop its caret.
                if (
                    children?.length === 0 &&
                    element.collapsibleState !== TreeItemCollapsibleState.None
                ) {
                    element.collapsibleState = TreeItemCollapsibleState.None;
                    this._onDidChangeTreeData.fire(element);
                }
                return children;
            });
        }

        if (!this.pendingRoot) {
            this.pendingRoot = this.getRootItems().finally(() => {
                this.pendingRoot = null;
            });
        }
        return this.pendingRoot;
    }

    private getRootItems(): Promise<AbstractTreeItem[]> {
        // Get the courses the user is subscribed to.
        return (
            execute(dodona => dodona.courses.subscribed)
                // Sort courses & apply filters
                .then(cs => {
                    const subscribed = cs || [];
                    const filtered = RootDataProvider.sortCourses(
                        this.filterCourses(subscribed),
                    );
                    RootDataProvider.setEmptyState(
                        filtered.length > 0
                            ? ""
                            : subscribed.length === 0
                              ? "noCourses"
                              : "filtered",
                    );
                    return filtered;
                })
                // Convert them to tree items.
                .then(cs =>
                    this.getYears(cs).map(
                        y => new YearTreeItem(y, this.getCoursesForYear(y, cs)),
                    ),
                )
                // Error handling.
                .catch(() => {
                    RootDataProvider.setEmptyState("error");
                    return [];
                })
        );
    }

    /**
     * Sets the reason why the tree is empty, used to pick the welcome message.
     */
    private static setEmptyState(
        state: "" | "noCourses" | "filtered" | "error",
    ): void {
        void commands.executeCommand("setContext", "dodona.emptyState", state);
    }

    /**
     * Get all academic years in a list of courses
     */
    getYears(courses: Course[]): string[] {
        return courses
            .map(course => course.year)
            .filter((y, i, self) => self.indexOf(y) === i);
    }

    /**
     * Get all courses with a given academic year
     */
    getCoursesForYear(year: string, courses: Course[]): Course[] {
        return courses.filter(c => c.year == year);
    }

    getTreeItem(element: AbstractTreeItem): TreeItem {
        return element;
    }

    refresh(): void {
        // TODO optimise this to not redraw the entire tree.
        this._onDidChangeTreeData.fire(undefined);
    }

    static sortCourses(courses: Course[]): Course[] {
        const sortOption = getSortOption();

        // Asc/Desc is just switching the 1's and -1's,
        // so this can be made a bit abstract to avoid duplication
        const priority = sortOption.includes("ascending") ? -1 : 1;

        // Sort by year (descending) first, name second
        return courses.sort((a, b) =>
            a.year < b.year
                ? 1
                : a.year > b.year
                  ? -1
                  : a.name < b.name
                    ? priority
                    : a.name > b.name
                      ? -priority
                      : 0,
        );
    }

    filterCourses(courses: Course[]): Course[] {
        // Remove spaces that were added accidentally by students ("a, b" -> "a,b")
        const yearFilter = getYearFilter().replace(/\s/g, "");
        const courseFilter = getCourseFilter().replace(/\s/g, "");

        // Apply filters if they were supplied
        if (yearFilter) {
            // Filter out double/trailing comma's & empty entries/invalid entries
            const year_filters = yearFilter.split(",").filter(
                // Check for valid years
                y => !isNaN(+y) && y.length === 4 && parseInt(y) >= 2016,
            );

            // Remove courses from other academic years
            courses = courses.filter(c =>
                year_filters.includes(c.year.substring(0, 4)),
            );
        }

        if (courseFilter) {
            // Filter out double/trailing comma's & empty entries/invalid entries
            const course_filters = courseFilter
                .split(",")
                // Check for valid course id's
                .filter(c => !isNaN(+c) && c.length > 0 && parseInt(c) >= 0);

            // Remove courses with id's that aren't in the list
            courses = courses.filter(c =>
                course_filters.includes(c.id.toString()),
            );
        }

        return courses;
    }
}