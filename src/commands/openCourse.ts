import { commands, Uri } from "vscode";
import { Course } from "../api/resources/course";
import { CourseTreeItem } from "../treeView/items/courseTreeItem";

export function openCourse(courseTreeItem: CourseTreeItem) {
    const course: Course = courseTreeItem.course;
    const url = Uri.parse(course.url.replace(".json", ""));
    commands.executeCommand("vscode.open", url);
}
