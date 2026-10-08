import * as nodeAssert from "assert";
import * as assert from "assert/strict";

import * as sinon from "sinon";
import * as vscode from "vscode";

import { Activity } from "../../../api/resources/activities";
import { Submission } from "../../../api/resources/submission";
import { submitSolution } from "../../../commands/submitSolution";
import { CONFIG_KEY } from "../../../configuration";
import { canonicalUrl } from "../../../util/base";
import { getJson } from "../util";

suite("submitSolution", () => {
    test("Warn when no file is open", async () => {
        await vscode.commands.executeCommand(
            "workbench.action.closeAllEditors",
        );
        assert.equal(vscode.window.activeTextEditor, undefined);

        const warning = sinon
            .stub(vscode.window, "showWarningMessage")
            .resolves(undefined);

        try {
            await submitSolution(null, 0);
            sinon.assert.calledOnceWithMatch(
                warning,
                sinon.match(/Open the file with your solution/),
            );
        } finally {
            warning.restore();
        }
    });

    test("Submit empty solution", async () => {
        // Set the zeus authentication token.
        const config = vscode.workspace.getConfiguration(CONFIG_KEY);
        await config.update("auth.local", "zeus", true);
        await config.update("environment", "http://localhost:3000", true);

        // Get an available exercise.
        const activities: Activity[] = await getJson(
            "http://localhost:3000/activities",
        );
        const exercise = activities.filter(a => a.type === "Exercise")[0];

        // Build the solution code.
        const uniqueIdentifier = `submitSolutionTest_${new Date().valueOf()}`;
        const content = `# ${exercise.url}
        ${uniqueIdentifier}
        `;

        // Open an empty file.
        await vscode.workspace
            .openTextDocument({
                content,
                language: "python",
            })
            .then(d => vscode.window.showTextDocument(d, 1, false));

        // Submit the file. We make this throw an error since the local Dodona
        // instance cannot run a judge.
        await nodeAssert.rejects(async () => await submitSolution(null, 0), {
            message: "Your solution took too long to evaluate.",
        });

        // Get the submissions to the exercise.
        const submissions: Submission[] = await getJson(
            `${canonicalUrl(exercise)}/submissions`,
        );

        // Validate the code of the last submission.
        const lastSubmission = submissions[0];
        const { code }: { code: string } = await getJson(lastSubmission.url);
        assert.ok(code?.includes(uniqueIdentifier));
    });
});