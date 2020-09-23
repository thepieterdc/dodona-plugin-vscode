import * as vscode from 'vscode';
import bent = require('bent');
import { DataClass, Course, Series, Exercise, State } from './data-classes';

const get = bent('json');
const config = vscode.workspace.getConfiguration('dodona');

// TODO when refreshing, update token & host in case it changed
const token = config.get("api.token");
const host = config.get("api.host");
const exerciseRegex = /[0-9]+.json/g;

export class DataProvider implements vscode.TreeDataProvider<DataClass> {
    // List of listeners to update
    listeners: Exercise[] = new Array<Exercise>();
    constructor() {}

    getTreeItem(element: DataClass): vscode.TreeItem {
        return element;
    }

    getChildren(element?: DataClass): Thenable<DataClass[]> {
        if (element) {
            return element.getChildren();
        } else {
            // Has to be a course
            return Promise.resolve(getAvailableCourses(this));
        }
    }

    // Add a listener to the list
    registerListener(listener: Exercise) {
        this.listeners.push(listener);
    }

    fireListeners(url: string, state: State) {
        let regex_match = url.match(exerciseRegex);

        if (!(regex_match)) {
            return;
        }

        const excercise_id = Number(regex_match[0].slice(0, -5));

        // Check all exercises to find the one that matches this url
        this.listeners.forEach(function(exercise: Exercise) {
            if (exercise.exerciseid === excercise_id) {
                exercise.update(state);
                return;
            }
        });
    }
}

// TODO when other branches are merged, check for dodona/naos api key
async function getAvailableCourses(dataProvider: DataProvider): Promise<Course[]> {
    const courses = new Array<Course>();

    const headers = {
        'Authorization': token
    };

    //@ts-ignore
    const resp = await get(`${host}`, {}, headers)
    
    // @ts-ignore
    const subscribed_courses = resp.user.subscribed_courses;

    //Sort courses alphabetically to find them easily 
    //@ts-ignore
    subscribed_courses.sort((a: string, b: string) => a.name < b.name? -1 : a.name > b.name ? 1 : 0);
    // Add all courses to the list
    subscribed_courses.forEach(function (course: any) {
        //TODO write response class to avoid this ignore
        //@ts-ignore
        courses.push(new Course(dataProvider, course.name, course.id));
    });

    return courses;
}