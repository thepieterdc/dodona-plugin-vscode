import { commands, window } from "vscode";
import IdentificationData, { identify } from "../identification";
import { AssertionError } from "assert";
import { getApiEnvironment } from "../configuration";
import execute from "../api/client";
import { canonicalUrl, sleep } from "../util/base";
import { SubmissionEvaluatedListener } from "../listeners";
import Submission from "../api/resources/submission";
import { Activity } from "../api/resources/activities";

// TODO only show command in palette if an exercise is opened
//      (can be done using "when" in package.json)

// Define a feedback action to open the exercise in a web browser.
const FEEDBACK_VIEW_RESULTS = "View results";

/**
 * Submits the solution to Dodona and waits for the result.
 *
 * @param identification the exercise identification
 * @param exercise the exercise information
 * @param code the student solution
 * @param maxAttempts the maximum amount of polling attempts
 * @return the submission result after evaluation
 */
async function evaluateSubmission(
    identification: IdentificationData,
    exercise: Activity,
    code: string,
    maxAttempts: number
): Promise<Submission> {
    // Submit the code to Dodona.
    const submitResp = await execute(dodona =>
        dodona.submissions.create(identification, code),
    );

    // Send a notification message.
    window.showInformationMessage(
        `Your solution to "${exercise.name}" has been submitted!`,
    );

    // Set the status bar.
    window.setStatusBarMessage("Evaluating submission...");

    // Poll the submission url every 5 seconds until it is evaluated.
    for (let attempt = 0; attempt < maxAttempts; ++attempt) {
        // Wait for 5 seconds before fetching the result. The sleep comes first,
        // because the solution cannot be evaluated right after it has been
        // submitted to Dodona.
        await sleep(5000);

        // Get the result.
        const submission = await execute(dodona =>
            dodona.submissions.byUrl(submitResp!.url),
        );
        if (!submission) break;

        // Validate the result.
        if (submission.status !== "queued" && submission.status !== "running") {
            // Submission evaluated. Clear the status bar and return it.
            window.setStatusBarMessage("");
            return submission!;
        }
    }

    // Timeout reached. Clear the status bar and raise an error.
    window.setStatusBarMessage("");
    throw new Error("Your solution took too long to evaluate.");
}

/**
 * Attempts to find the identification of an exercise, based on the url in the
 * solution. Will show an error message if this has failed.
 *
 * @param code the student solution to parse
 * @return the identification if found
 */
async function handleIdentify(
    code: string,
): Promise<IdentificationData | null> {
    try {
        // Identify the exercise.
        return identify(code);
    } catch (error) {
        if (error instanceof AssertionError) {
            // Show an error dialog.
            const tryAgain = "Try Again";
            const selection = await window.showErrorMessage(
                "No exercise link found. Make sure the first line of the file contains a comment with the link to the exercise.",
                tryAgain,
            );

            // Retry the action if the user chooses to.
            if (selection === tryAgain) {
                commands.executeCommand("dodona.submit");
            }

            return null;
        }

        // Something else went wrong, rethrow error.
        throw error;
    }
}

/**
 * Displays a feedback message depending on the submission result.
 *
 * @param exercise the exercise to show feedback for
 * @param submission the submission result
 * @return the feedback message to display
 */
async function showFeedback(
    exercise: Activity,
    submission: Submission,
): Promise<string | undefined> {
    // Correct solution.
    if (submission.status === "correct") {
        return window.showInformationMessage(
            `Solution to "${exercise.name}" has been accepted!`,
            ...[FEEDBACK_VIEW_RESULTS],
        );
    }

    // Incorrect solution.
    if (submission!.status === "wrong") {
        return window.showWarningMessage(
            `Solution to "${exercise.name}" was not correct: ${submission.summary}`,
            ...[FEEDBACK_VIEW_RESULTS],
        );
    }

    // Unknown error.
    return window.showErrorMessage(
        submission.summary ||
        "An unknown error occurred while evaluating your submission.",
        ...[FEEDBACK_VIEW_RESULTS],
    );
}

/**
 * Validates that the identified environment matches the active one. If not,
 * this will show an error message.
 *
 * @param identification the identification to validate
 */
function validateEnvironment(identification: IdentificationData): boolean {
    const apiEnvironment = getApiEnvironment();
    if (identification.environment === apiEnvironment) {
        // All good.
        return true;
    }

    // Show an error message.
    window.showErrorMessage(
        `You are trying to submit an exercise to the ${identification.environment.titlecase()} environment, but ${apiEnvironment.titlecase()} is configured as your active environment in the settings.`,
    );
    return false;
}

/**
 * Action to submit a solution to Dodona.
 *
 * @param listener function that is called when a submission is evaluated
 * @param maxAttempts maximum amount of polling attempts
 */
export async function submitSolution(
    listener: SubmissionEvaluatedListener | null = null,
    maxAttempts = 25,
): Promise<void> {
    const editor = window.activeTextEditor;
    if (!editor) {
        return;
    }

    // Get the code.
    const code = editor.document.getText();

    // Infer the exercise from the solution comment.
    const identification = await handleIdentify(code);
    if (!identification) {
        return;
    }

    // Validate that the environment is correct.
    if (!validateEnvironment(identification)) {
        return;
    }

    // Get the exercise information.
    const exercise = await execute(dodona =>
        dodona.activities.get(identification),
    );
    if (!exercise) {
        return;
    }


    // Evaluate the submission.
    const submission = await evaluateSubmission(identification, exercise, code, maxAttempts);

    // Display a feedback message.
    if ((await showFeedback(exercise, submission)) === FEEDBACK_VIEW_RESULTS) {
        // Open the results in a browser.
        commands.executeCommand("vscode.open", canonicalUrl(submission));
    }

    // Notify listeners.
    listener && listener(submission!);
}
