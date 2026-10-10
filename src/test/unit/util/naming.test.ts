import * as assert from "assert";

import { Exercise } from "../../../api/resources/activities";
import { generateFilename } from "../../../util/naming";

const exercise = {
    name: "Hello World",
    programming_language: { extension: "py" },
} as Exercise;

describe("generateFilename", () => {
    it("generates a filename for an exercise", () => {
        assert.strictEqual(generateFilename(exercise), "hello_world.py");
    });

    it("appends the suffix before the extension", () => {
        assert.strictEqual(
            generateFilename(exercise, "_submission_3"),
            "hello_world_submission_3.py",
        );
    });
});