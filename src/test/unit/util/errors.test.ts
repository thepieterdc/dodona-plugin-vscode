import * as assert from "assert";

import { extractErrorMessage } from "../../../util/errors";

describe("test extractErrorMessage", () => {
    const cases: [string, unknown, string | null][] = [
        [
            "return the top-level error string",
            { error: "not permitted" },
            "not permitted",
        ],
        [
            "humanize and flatten a single attribute",
            { status: "failed", errors: { exercise: ["not permitted"] } },
            "Exercise not permitted",
        ],
        [
            "join multiple attributes and messages with '; '",
            {
                errors: {
                    exercise: ["not permitted", "is archived"],
                    submission: ["is invalid"],
                },
            },
            "Exercise not permitted; Exercise is archived; Submission is invalid",
        ],
        [
            "humanize an underscored attribute",
            { errors: { activity_read_state: ["invalid"] } },
            "Activity read state invalid",
        ],
        [
            "ignore non-string messages",
            { errors: { exercise: [1, null, "not permitted"] } },
            "Exercise not permitted",
        ],
        ["return null for an empty errors object", { errors: {} }, null],
        ["return null for null", null, null],
        ["return null for undefined", undefined, null],
        ["return null for a plain string", "not allowed", null],
        ["return null for an array", ["not allowed"], null],
        [
            "return null when errors is not an object",
            { errors: "not allowed" },
            null,
        ],
        [
            "return null when error is an empty string",
            { error: "", errors: {} },
            null,
        ],
    ];

    for (const [name, body, expected] of cases) {
        it(`should ${name}`, () => {
            assert.equal(extractErrorMessage(body), expected);
        });
    }
});