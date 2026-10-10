import * as fs from "fs";
import * as path from "path";

import { Uri, ViewColumn, window, workspace } from "vscode";

import execute from "../api/client";
import { Exercise } from "../api/resources/activities";
import { Submission } from "../api/resources/submission";
import { identify } from "../identification";
import { canonicalUrl, workspaceFolder } from "../util/base";
import { comment } from "../util/comments";
import { generateFilename } from "../util/naming";

/**
 * Action to open a previous submission in a new file.
 *
 * @param exercise the exercise the submission belongs to
 * @param submission the submission to open
 */
export async function openSubmission(
    exercise: Exercise,
    submission: Submission,
) {
    const root = await workspaceFolder(
        "In order to open a submission, you should first open a folder.",
    );
    if (!root) {
        return;
    }

    const fileName = generateFilename(
        exercise,
        `_submission_${submission.number ?? submission.id}`,
    );
    const filePath = path.join(root, fileName);

    if (!fs.existsSync(filePath)) {
        const full = await execute(dodona =>
            dodona.submissions.withCode(submission),
        );
        if (!full) {
            return;
        }

        // Make sure the file can be linked to the exercise.
        let code = full.code;
        try {
            identify(code);
        } catch {
            const url = canonicalUrl(exercise).toString();
            const commented = comment(url, exercise.programming_language);
            code = `${commented}\n\n${code}`;
        }

        fs.writeFileSync(filePath, code.endsWith("\n") ? code : `${code}\n`, {
            flag: "wx",
        });
    }

    const document = await workspace.openTextDocument(Uri.file(filePath));
    await window.showTextDocument(document, { viewColumn: ViewColumn.One });
}