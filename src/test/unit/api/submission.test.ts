import * as assert from "assert";

import { ExerciseStatus } from "../../../api/resources/activities/exercise";
import {
    findExerciseStatus,
    Submission,
    submissionStatusSchema,
} from "../../../api/resources/submission";

describe("findExerciseStatus", () => {
    it("is correct for correct submissions", () => {
        const s = { status: "correct" } as Submission;
        assert.strictEqual(findExerciseStatus(s), ExerciseStatus.CORRECT);
    });

    it("is wrong for every other status", () => {
        for (const status of submissionStatusSchema.options) {
            if (status === "correct") continue;
            assert.strictEqual(
                findExerciseStatus({ status } as Submission),
                ExerciseStatus.WRONG,
                status,
            );
        }
    });
});