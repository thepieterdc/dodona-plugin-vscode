import { Exercise } from "../api/resources/activities";

// Non-alphanumeric characters.
const NON_ALPHA = /[^a-zA-Z0-9-_. ]/gi;
// Whitespace.
const WHITESPACE = /\s+/g;

/**
 * Generates a filename for the given exercise.
 *
 * @param exercise the exercise
 */
export function generateFilename(exercise: Exercise): string {
    // TODO Support generation of Java class names.

    // Get the basename.
    let basename = exercise.name
        // Strip out all non-alphanumeric characters.
        .replace(NON_ALPHA, "")
        // Replace all whitespace by underscores.
        .replace(WHITESPACE, "_");

    if(exercise.programming_language?.extension === "py"){
        basename = basename.toLowerCase();
    }

    // Append the extension of the programming language.
    return `${basename}.${exercise.programming_language?.extension || "txt"}`;
}
