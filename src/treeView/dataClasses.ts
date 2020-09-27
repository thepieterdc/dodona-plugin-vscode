import { ProviderResult, TreeItem, TreeItemCollapsibleState } from "vscode";
import Course from "../api/resources/course";
import RootDataProvider from "./dataProvider";
import execute from "../api/client";
import Series from "../api/resources/series";
import Exercise, {
    ExerciseStatus,
    findExerciseStatus,
} from "../api/resources/activities/exercise";
import {
    findExerciseStatus as findSubmissionStatus,
} from "../api/resources/submission";
import * as path from "path";

// TODO add an icon for course & series to make them easier to separate in the view
// TODO refresh when user submits an exercise (to update the icons)

/**
 * Main parent class for items that can be added to the Exercise TreeView.
 */
export abstract class DataClass extends TreeItem {
    /**
     * DataClass constructor.
     *
     * @param label the label to display
     * @param collapsibleState whether this level is collapsed or not
     */
    protected constructor(label: string,
                          collapsibleState: TreeItemCollapsibleState) {
        super(label, collapsibleState);
    }

    /**
     * Gets the children of this item in the tree.
     */
    abstract getChildren(): ProviderResult<DataClass[]>;
}

export class CourseDataClass extends DataClass {
    private readonly dataProvider: RootDataProvider;
    private readonly course: Course;

    /**
     * CourseDataClass constructor.
     *
     * @param course the course this item represents
     * @param dataProvider root provider of the tree to attach listeners
     */
    constructor(course: Course, dataProvider: RootDataProvider) {
        super(course.name, TreeItemCollapsibleState.Collapsed);
        this.course = course;
        this.dataProvider = dataProvider;
    }

    getChildren(): ProviderResult<DataClass[]> {
        // Get the series in the course.
        return execute(dodona => dodona.series.inCourse(this.course))
            // Sort them by their order.
            .then(ss => ss.sort((a, b) => a.order - b.order))
            // Convert them to dataclasses.
            .then(ss => ss.map(s => new SeriesDataClass(s, this.dataProvider)));
    }
}

class SeriesDataClass extends DataClass {
    private readonly dataProvider: RootDataProvider;
    private readonly series: Series;

    /**
     * SeriesDataClass constructor.
     *
     * @param series the series this item represents
     * @param dataProvider root provider of the tree to attach listeners
     */
    constructor(series: Series, dataProvider: RootDataProvider) {
        super(series.name, TreeItemCollapsibleState.Collapsed);
        this.dataProvider = dataProvider;
        this.series = series;
    }

    getChildren(): ProviderResult<DataClass[]> {
        // Get the exercises in the series.
        return execute(dodona => dodona.exercises.inSeries(this.series))
            // Convert them to dataclasses.
            .then(es => es.map(e => new ExerciseDataClass(e, this.dataProvider)));
    }
}

/**
 * Gets the icon path that corresponds to the given exercise status.
 *
 * @param status the status of the exercise
 */
function getExerciseIconPath(status: ExerciseStatus) {
    return path.join(__filename, "..", "..", "..", "assets", `exercise-${status}.svg`);
}

export class ExerciseDataClass extends DataClass {
    public readonly exercise: Exercise;

    /**
     * ExerciseDataClass constructor.
     *
     * @param exercise the exercise this item represents
     * @param dataProvider root provider of the tree to attach listeners
     */
    constructor(exercise: Exercise, dataProvider: RootDataProvider) {
        super(exercise.name, TreeItemCollapsibleState.None);
        this.contextValue = "exercise";
        this.exercise = exercise;
        this.iconPath = getExerciseIconPath(findExerciseStatus(exercise));

        // Add a listener for this exercise to the data provider.
        dataProvider.listeners.push(submission => {
            this.update(findSubmissionStatus(submission));
        });
    }

    getChildren(): ProviderResult<DataClass[]> {
        return undefined;
    }

    /**
     * Updates the icon after the status has been changed.
     *
     * @param status the (new) status
     */
    update(status: ExerciseStatus) {
        this.iconPath = getExerciseIconPath(status);
    }
}