import * as vscode from 'vscode';
import bent = require('bent');
import { DataClass, Course, Series, Exercise, State } from './data-classes';

const get = bent('json');
const config = vscode.workspace.getConfiguration('dodona');

// TODO query data once & store it inside the dataprovider in a dict,
// then find the data related to the treeitem in getChildren
export class DataProvider implements vscode.TreeDataProvider<DataClass> {
    constructor() {}

    getTreeItem(element: DataClass): vscode.TreeItem {
        return element;
    }

    getChildren(element?: DataClass): Thenable<DataClass[]> {
        if (element) {
            console.log("element");
            return Promise.resolve([]);
        } else {
            // Has to be a course
            return Promise.resolve(getAvailableCourses());
        }
    }
}

function getAvailableCourses(): Course[] {
    const courses = new Array<Course>();
    return courses;
}

// TODO tree of courses, contains every course the user can see
// TODO courses contain every series that the user can make exercises for
// TODO series contain exercises

// TODO opening an exercise both creates a new file & opens the description
// TODO refresh button