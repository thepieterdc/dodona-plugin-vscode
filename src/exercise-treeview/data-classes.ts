import bent = require('bent');
import * as vscode from 'vscode';
import * as path from 'path';
import { DataProvider } from './treeDataProvider';

const get = bent('json');
const config = vscode.workspace.getConfiguration('dodona');

// TODO add an icon for course & series to make them easier to separate in the view

// TODO when refreshing, update token & host in case it changed
// TODO check if a token was set (for the current host), for now assume it is
// TODO refresh when user submits an exercise (to update the icons)
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
    dataProvider: DataProvider;
    constructor(dataProvider: DataProvider, public label: string, courseid: number) {
        super(label, vscode.TreeItemCollapsibleState.Collapsed);
        this.courseid = courseid;
        this.dataProvider = dataProvider;
    }

    getChildren(element?: DataClass): Thenable<DataClass[]> {
        return Promise.resolve(getAvailableSeries(this, this.dataProvider));
    }
}

export class Series extends DataClass {
    seriesid: number;
    dataProvider: DataProvider;
    constructor(dataProvider: DataProvider, public label: string, seriesid: number) {
        super(label, vscode.TreeItemCollapsibleState.Collapsed);
        this.seriesid = seriesid;
        this.dataProvider = dataProvider;
    }

    getChildren(element?: DataClass): Thenable<DataClass[]> {
        return Promise.resolve(getAvailableExercises(this, this.dataProvider));
    }
}

export class Exercise extends DataClass {
    dataProvider: DataProvider;
    name: string;
    url: string;
    exerciseid: number
    state: State;
    boilerplate: string;
    description_url: string;
    language: Language;

    constructor(dataProvider: DataProvider, public label: string, url: string, exerciseid: number, boilerplate: string, state: State, description_url: string, language: Language){
        super(label, vscode.TreeItemCollapsibleState.Collapsed);
        this.dataProvider = dataProvider;
        this.name = label;
        this.state = state;
        this.url = url;
        this.exerciseid = exerciseid;
        this.iconPath = getIconPath(this.state);
        this.boilerplate = boilerplate;
        this.description_url = description_url;
        this.language = language;
        this.contextValue = "exercise";

        // Register this exercise with the DataProvider
        this.dataProvider.registerListener(this);
    }


    getChildren(element?: DataClass): Thenable<DataClass[]> {
        return Promise.resolve([]);
    }

    update(state: State) {
        this.state = state;
        this.iconPath = getIconPath(this.state);
    }
}

// Programming language
export class Language {
    name: string;
    extension: string;
    constructor(name: string, extension: string) {
        this.name = name;
        this.extension = extension;
    }
}

// An enum containing states for the exercise, to display them with an icon
export enum State {
    NotStarted = "not-started",
    Wrong = "wrong",
    Correct = "correct"
}

function getState(exercise: any): State {
    if (!(exercise.has_solution)) {
        return State.NotStarted;
    }

    if (!(exercise.has_correct_solution)) {
        return State.Wrong;
    }

    return State.Correct;
}

// TODO check if this path works, otherwise use path.join(...)
function getIconPath(state: State) {
    return path.join(__filename, '..', '..', '..', 'assets', `exercise-${state}.svg`);
}

// TODO make general getAvailable<T>-function for this as all of them are the same
async function getAvailableSeries(course: Course, dataProvider: DataProvider): Promise<Series[]> {
    const series = new Array<Series>();

    const headers = {
        'Authorization': token
    };

    //@ts-ignore
    const resp = await get(`${host}/courses/${course.courseid}/series.json`, {}, headers)
    
    //Sort series alphabetically to find them easily 
    //@ts-ignore
    resp.sort((a: number, b: number) => a.order < b.order? -1 : a.order > b.order ? 1 : 0);

    resp.forEach(function (entry: any) {
        //TODO write response class to avoid this ignore
        //@ts-ignore
        series.push(new Series(dataProvider, entry.name, entry.id));
    });

    return series;
}

async function getAvailableExercises(series: Series, dataProvider: DataProvider): Promise<Exercise[]> {
    const exercises = new Array<Exercise>();

    const headers = {
        'Authorization': token
    };

    //@ts-ignore
    const resp = await get(`${host}/series/${series.seriesid}/activities.json`, {}, headers)
    resp.forEach(function (exercise: any) {
        //TODO write response class to avoid these ignores
        //@ts-ignore
        const programming_language = new Language(exercise.programming_language.name, exercise.programming_language.extension)
        //@ts-ignore
        exercises.push(new Exercise(dataProvider, exercise.name, exercise.url, exercise.id, exercise.boilerplate, getState(exercise), exercise.description_url, programming_language));
    });

    return exercises;
}