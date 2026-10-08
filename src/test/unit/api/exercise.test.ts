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

    describe("after the deadline", () => {
        const deadline = new Date("2020-01-01");
        const now = new Date("2020-06-01");
        const status = (e: Exercise) => findExerciseStatus(e, deadline, now);

        it("detects a met deadline", () => {
            const e = exercise({
                accepted: false,
                accepted_before_deadline: true,
            });
            assert.strictEqual(status(e), ExerciseStatus.DEADLINE_MET);
        });

        it("detects solutions accepted late", () => {
            const e = exercise({
                accepted: true,
                accepted_before_deadline: false,
            });
            assert.strictEqual(status(e), ExerciseStatus.CORRECT_LATE);
        });

        it("detects a missed deadline", () => {
            const e = exercise({
                accepted: false,
                accepted_before_deadline: false,
            });
            assert.strictEqual(status(e), ExerciseStatus.DEADLINE_MISSED);
        });

        it("detects a missed deadline without a solution", () => {
            const e = exercise({
                has_solution: false,
                accepted: false,
                accepted_before_deadline: false,
            });
            assert.strictEqual(status(e), ExerciseStatus.DEADLINE_MISSED);
        });

        it("ignores the deadline without deadline info", () => {
            const e = exercise({
                has_correct_solution: true,
                last_solution_is_best: true,
            });
            assert.strictEqual(status(e), ExerciseStatus.CORRECT);
        });
    });

    describe("before the deadline", () => {
        const deadline = new Date("2020-06-01");
        const now = new Date("2020-01-01");

        it("uses the normal status", () => {
            const e = exercise({
                accepted: true,
                accepted_before_deadline: true,
                has_correct_solution: true,
                last_solution_is_best: true,
            });
            assert.strictEqual(
                findExerciseStatus(e, deadline, now),
                ExerciseStatus.CORRECT,
            );
        });
    });

    it("detects wrong solutions", () => {
        assert.strictEqual(
            findExerciseStatus(exercise({})),
            ExerciseStatus.WRONG,
        );
    });
});