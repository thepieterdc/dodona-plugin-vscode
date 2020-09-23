import * as vscode from 'vscode';

const config = vscode.workspace.getConfiguration('dodona');

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

    getChildren(element?: DataClass): Thenable<DataClass[]> {
        console.log("Something went wrong if this somehow fired");
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
        if (element) {
            console.log("elementCourse");
            return Promise.resolve(getAvailableSeries(this));
        } else {
            return Promise.resolve([]);
        }
    }
}

export class Series extends DataClass {
    constructor(public label: string) {
        super(label, vscode.TreeItemCollapsibleState.Collapsed);
    }

    getChildren(element?: DataClass): Thenable<DataClass[]> {
        if (element) {
            console.log("elementSeries");
            return Promise.resolve(getAvailableExercises(this));
        } else {
            return Promise.resolve([]);
        }
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

    iconPath = {
        // TODO light/dark icons
        // TODO use this.state which doesn't work atm for whatever reason
        light: getIconPath(State.Correct),
        dark: getIconPath(State.Correct)
    }
}

// An enum containing states for the exercise, to display them with an icon
export enum State {
    NotStarted = "not-started",
    Wrong = "wrong",
    Correct = "correct"
}

// TODO check if this path works, otherwise use path.join(...)
function getIconPath(state: State) {
    return `assets/exercise-${state}.svg`
}

function getAvailableSeries(course: Course): Series[] {
    const series = new Array<Series>();
    return series;
}

function getAvailableExercises(week: Series): Exercise[] {
    console.log("test");
    return new Array<Exercise>(new Exercise("Double Dutch", "https://naos.ugent.be/nl/courses/54/series/547/activities/1153066363/", State.NotStarted));
}