import * as nodeAssert from "assert";
import * as vscode from "vscode";
import got from "got";
import { submitSolution } from "../../commands/submitSolution";
import { CONFIG_KEY } from "../../configuration";
import { Activity } from "../../api/resources/activities";
import Submission from "../../api/resources/submission";
import { canonicalUrl } from "../../util/base";
import { assert } from "chai";

suite("submitSolution", () => {
    test("Submit empty solution", async () => {
        // Set the zeus authentication token.
        const config = vscode.workspace.getConfiguration(CONFIG_KEY);
        await config.update("auth.local", "zeus", true);
        await config.update("environment", "http://localhost:3000", true);

        // Get an available exercise.
        const activities: Activity[] = await got("http://localhost:3000/activities", {
            headers: {
                Accept: "application/json",
                Authorization: "zeus",
            },
            resolveBodyOnly: true,
            responseType: "json",
        });
        const exercise = activities.filter(a => a.type === "Exercise")[0];

        // Build the solution code.
        const uniqueIdentifier = `submitSolutionTest_${new Date().valueOf()}`;
        const content = `# ${exercise.url}
        ${uniqueIdentifier}
        `;

        // Open an empty file.
        await vscode.workspace.openTextDocument({
            content,
            language: "python",
        }).then(d => vscode.window.showTextDocument(d, 1, false));

        // Submit the file. We make this throw an error since the local Dodona
        // instance cannot run a judge.
        await nodeAssert.rejects(async () => await submitSolution(null, 0), { message: "Your solution took too long to evaluate." });

        // Get the submissions to the exercise.
        const submissions: Submission[] = await got(`${canonicalUrl(exercise)}/submissions`, {
            headers: {
                Accept: "application/json",
                Authorization: "zeus",
            },
            resolveBodyOnly: true,
            responseType: "json",
        });

        // Validate the code of the last submission.
        const lastSubmission = submissions[0];
        const { code } = await got(lastSubmission.url, {
            headers: {
                Accept: "application/json",
                Authorization: "zeus",
            },
            resolveBodyOnly: true,
            responseType: "json",
        });
        assert.include(code, uniqueIdentifier);
    });
});