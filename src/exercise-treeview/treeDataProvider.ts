import * as vscode from 'vscode';
import bent = require('bent');
import { DataClass, Course, Series, Exercise, State } from './data-classes';

const get = bent('json');
const config = vscode.workspace.getConfiguration('dodona');

// TODO when refreshing, update token & host in case it changed
const token = config.get("api.token");
const host = config.get("api.host");

// TODO query data once & store it inside the dataclass itself
export class DataProvider implements vscode.TreeDataProvider<DataClass> {
    constructor() {}

    getTreeItem(element: DataClass): vscode.TreeItem {
        return element;
    }

    getChildren(element?: DataClass): Thenable<DataClass[]> {
        if (element) {
            return element.getChildren();
        } else {
            // Has to be a course
            return Promise.resolve(getAvailableCourses());
        }
    }
}

// TODO when other branches are merged, check for dodona/naos api key
async function getAvailableCourses(): Promise<Course[]> {
    const courses = new Array<Course>();

    const headers = {
        'Authorization': token
    };

    //@ts-ignore
    const resp = await get(`${host}/courses.json`, {}, headers)
    
    //Sort courses alphabetically to find them easily 
    //@ts-ignore
    resp.sort((a: string, b: string) => a.name < b.name? -1 : a.name > b.name ? 1 : 0);
    // Add all courses to the list
    resp.forEach(function (course: any) {
        //TODO write response class to avoid this ignore
        //@ts-ignore
        courses.push(new Course(course.name, course.id));
    });

    return courses;
}

// TODO tree of courses, contains every course the user can see
// TODO courses contain every series that the user can make exercises for
// TODO series contain exercises

// TODO opening an exercise both creates a new file & opens the description
// (Open with an indicator on View Actions -> view/item/context group: inline)
// TODO refresh button