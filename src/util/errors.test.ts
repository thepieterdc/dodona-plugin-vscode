import * as assert from "assert";

import { extractErrorMessage } from "./errors";

describe("test extractErrorMessage top-level error", () => {
    it("should return the top-level error string", () => {
        assert.equal(
            extractErrorMessage({ error: "not permitted" }),
            "not permitted",
        );
    });
});

describe("test extractErrorMessage errors hash", () => {
    it("should humanize and flatten a single attribute", () => {
        assert.equal(
            extractErrorMessage({
                status: "failed",
                errors: { exercise: ["not permitted"] },
            }),
            "Exercise not permitted",
        );
    });

    it("should join multiple attributes and messages with '; '", () => {
        assert.equal(
            extractErrorMessage({
                errors: {
                    exercise: ["not permitted", "is archived"],
                    submission: ["is invalid"],
                },
            }),
            "Exercise not permitted; Exercise is archived; Submission is invalid",
        );
    });

    it("should humanize an underscored attribute", () => {
        assert.equal(
            extractErrorMessage({
                errors: { activity_read_state: ["invalid"] },
            }),
            "Activity read state invalid",
        );
    });

    it("should return null for an empty errors object", () => {
        assert.equal(extractErrorMessage({ errors: {} }), null);
    });
});

describe("test extractErrorMessage invalid bodies", () => {
    it("should return null for null", () => {
        assert.equal(extractErrorMessage(null), null);
    });

    it("should return null for undefined", () => {
        assert.equal(extractErrorMessage(undefined), null);
    });

    it("should return null for a plain string", () => {
        assert.equal(extractErrorMessage("not allowed"), null);
    });

    it("should return null for an array", () => {
        assert.equal(extractErrorMessage(["not allowed"]), null);
    });

    it("should return null when errors is not an object", () => {
        assert.equal(extractErrorMessage({ errors: "not allowed" }), null);
    });

    it("should return null when error is an empty string", () => {
        assert.equal(
            extractErrorMessage({ error: "", errors: {} }),
            null,
        );
    });

    it("should ignore non-string messages", () => {
        assert.equal(
            extractErrorMessage({ errors: { exercise: [1, null, "not permitted"] } }),
            "Exercise not permitted",
        );
    });
});
