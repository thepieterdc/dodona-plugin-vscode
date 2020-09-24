import { ProviderResult, TreeDataProvider, TreeItem } from "vscode";
import { CourseDataClass, DataClass, ExerciseDataClass } from "./dataClasses";
import execute from "../api/client";
import { SubmissionEvaluatedListener } from "../listeners";

const exerciseRegex = /[0-9]+.json/g;

/**
 * Data provider for the exercise tree view.
 */
export default class RootDataProvider implements TreeDataProvider<DataClass> {
    public readonly listeners: SubmissionEvaluatedListener[] = [];

    getChildren(element?: DataClass): ProviderResult<DataClass[]> {
        if (element) {
            // Element in the tree.
            return element.getChildren();
        }

        // Get the courses the user is subscribed to.
        return execute(dodona => dodona.courses.subscribed)
            // Sort them alphabetically.
            .then(cs => cs.sort((a, b) => a.name < b.name ? -1 : a.name > b.name ? 1 : 0))
            // Convert them to dataclasses.
            .then(cs => cs.map(c => new CourseDataClass(c, this)));
    }

    getTreeItem(element: DataClass): TreeItem {
        return element;
    }
}

//
//     fireListeners(url: string, state: State) {
//         let regex_match = url.match(exerciseRegex);
//
//         if (!(regex_match)) {
//             return;
//         }
//
//         const excercise_id = Number(regex_match[0].slice(0, -5));
//
//         // Check all exercises to find the one that matches this url
//         this.listeners.forEach(function(exercise: Exercise) {
//             if (exercise.exerciseid === excercise_id) {
//                 exercise.update(state);
//                 return;
//             }
//         });
//     }
// }
//