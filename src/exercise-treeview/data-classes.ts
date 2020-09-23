import bent = require('bent');
import { pathToFileURL } from 'url';
import * as vscode from 'vscode';
import * as path from 'path';

const get = bent('json');
const config = vscode.workspace.getConfiguration('dodona');

// TODO add an icon for course & series to make them easier to separate in the view

// TODO when refreshing, update token & host in case it changed
// TODO check if a token was set (for the current host), for now assume it is
const token = config.get("api.token");
const host = config.get("api.host");

// Main parent class because for some reason TreeItems can only have children of the same type
// This way, the items can still be separate classes, while still implementing this same class
export class DataClass extends vscode.TreeItem {
    constructor(public label: string, public collapsibleState: vscode.TreeItemCollapsibleState) {
        super(label, collapsibleState);
    }

    getTreeItem(element?: DataClass): vscode.TreeItem | undefined {
        return element;
    }

    // Function only needed to extend TreeItem, all classes that extend this
    // implement it themselves
    getChildren(element?: DataClass): Thenable<DataClass[]> {
        return Promise.resolve([]);
    }
}

export class Course extends DataClass {
    courseid: number;
    constructor(public label: string, courseid: number) {
        super(label, vscode.TreeItemCollapsibleState.Collapsed);
        this.courseid = courseid;
    }

    getChildren(element?: DataClass): Thenable<DataClass[]> {
        return Promise.resolve(getAvailableSeries(this));
    }
}

export class Series extends DataClass {
    seriesid: number;
    constructor(public label: string, seriesid: number) {
        super(label, vscode.TreeItemCollapsibleState.Collapsed);
        this.seriesid = seriesid;
    }

    getChildren(element?: DataClass): Thenable<DataClass[]> {
        return Promise.resolve(getAvailableExercises(this));
    }
}

export class Exercise extends DataClass {
    state: State;
    url: string;
    constructor(public label: string, url: string, state: State){
        super(label, vscode.TreeItemCollapsibleState.Collapsed);
        this.state = state;
        this.url = url;
    }

    getChildren(element?: DataClass): Thenable<DataClass[]> {
        super.getChildren(element);
        return Promise.resolve([]);
    }

    // TODO light/dark icons
    // TODO use this.state which doesn't work atm for whatever reason
    iconPath = getIconPath(State.Correct);
}

// An enum containing states for the exercise, to display them with an icon
export enum State {
    NotStarted = "not-started",
    Wrong = "wrong",
    Correct = "correct"
}

// TODO check if this path works, otherwise use path.join(...)
function getIconPath(state: State) {
    return path.join(__filename, '..', '..', '..', 'assets', `exercise-${state}.svg`);
}

// TODO make general getAvailable<T>-function for this as all of them are the same
async function getAvailableSeries(course: Course): Promise<Series[]> {
    const series = new Array<Series>();

    const headers = {
        'Authorization': token
    };

    //@ts-ignore
    const resp = await get(`${host}/courses/${course.courseid}/series.json`, {}, headers)
    
    //Sort series alphabetically to find them easily 
    //@ts-ignore
    resp.sort((a: string, b: string) => a.name < b.name? -1 : a.name > b.name ? 1 : 0);

    resp.forEach(function (entry: any) {
        //TODO write response class to avoid this ignore
        //@ts-ignore
        series.push(new Series(entry.name, entry.id));
    });

    return series;
}

async function getAvailableExercises(series: Series): Promise<Exercise[]> {
    const exercises = new Array<Exercise>();

    const headers = {
        'Authorization': token
    };

    //@ts-ignore
    const resp = await get(`${host}/series/${series.seriesid}/activities.json`, {}, headers)

    //Sort exercises alphabetically to find them easily 
    //@ts-ignore
    resp.sort((a: string, b: string) => a.name < b.name? -1 : a.name > b.name ? 1 : 0);
    
    resp.forEach(function (exercise: any) {
        //TODO write response class to avoid this ignore
        //@ts-ignore
        exercises.push(new Exercise(exercise.name, exercise.url, State.Correct));
    });

    return exercises;
}