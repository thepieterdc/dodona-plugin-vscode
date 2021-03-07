import { commands } from "vscode";
import { Course } from "../api/resources/course";
import { CourseTreeItem } from "../treeView/items/courseTreeItem";
import { canonicalUrl } from "../util/base";

export function openCourse(courseTreeItem: CourseTreeItem) {
    const course: Course = courseTreeItem.course;
    commands.executeCommand("vscode.open", canonicalUrl(course));
}
