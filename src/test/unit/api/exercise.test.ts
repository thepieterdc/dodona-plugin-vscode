import * as assert from "assert";

import {
    Exercise,
    ExerciseStatus,
    findExerciseStatus,
} from "../../../api/resources/activities/exercise";

function exercise(fields: Partial<Exercise>): Exercise {
    return {
        has_solution: true,
        has_correct_solution: false,
        last_solution_is_best: false,
        ...fields,
    } as Exercise;
}

describe("findExerciseStatus", () => {
    it("falls back to the last solution without deadline info", () => {
        const e = exercise({
            has_correct_solution: true,
            last_solution_is_best: true,
        });
        assert.strictEqual(findExerciseStatus(e), ExerciseStatus.CORRECT);
    });

    it("detects solutions accepted after the deadline", () => {
        const e = exercise({ accepted: true, accepted_before_deadline: false });
        assert.strictEqual(findExerciseStatus(e), ExerciseStatus.CORRECT_LATE);
    });

    it("detects solutions accepted before the deadline", () => {
        const e = exercise({ accepted: true, accepted_before_deadline: true });
        assert.strictEqual(findExerciseStatus(e), ExerciseStatus.CORRECT);
    });

    it("detects wrong solutions", () => {
        const e = exercise({
            accepted: false,
            accepted_before_deadline: false,
        });
        assert.strictEqual(findExerciseStatus(e), ExerciseStatus.WRONG);
    });
});