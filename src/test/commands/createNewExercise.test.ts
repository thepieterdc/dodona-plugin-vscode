import {assert} from "chai";
import * as vscode from "vscode";
import got from "got";
import { CONFIG_KEY } from "../../configuration";
import { Activity, Exercise } from "../../api/resources/activities";
import { createNewExercise } from "../../commands/createNewExercise";
import { canonicalUrl } from "../../util/base";

suite("createNewExercise", () => {
    let exercise: Exercise;

    setup(async () => {
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
        exercise = activities.filter(a => a.type === "Exercise")[0] as Exercise;
    });

    test("Create a new exercise file", async () => {
        // Create the file and open it.
        await createNewExercise(exercise);

        // Validate that the file is opened.
        const openFile = vscode.window.visibleTextEditors[0].document.getText();
        assert.isNotNull(openFile);

        // Validate that the file contains the exercise url.
        assert.include(openFile, canonicalUrl(exercise).toString());
    });
});