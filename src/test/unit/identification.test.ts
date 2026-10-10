import * as assert from "assert";

import { identify } from "../../identification";

describe("identify", () => {
    it("parses an activity url", () => {
        assert.deepStrictEqual(
            identify("# https://dodona.be/en/activities/42/\ncode"),
            {
                environment: "DODONA",
                activity: 42,
                course: null,
                series: null,
            },
        );
    });

    it("parses course, series and activity", () => {
        assert.deepStrictEqual(
            identify(
                "// https://dodona.be/nl/courses/1/series/2/activities/3/",
            ),
            { environment: "DODONA", activity: 3, course: 1, series: 2 },
        );
    });

    it("supports legacy exercise urls", () => {
        assert.strictEqual(
            identify("# https://dodona.be/exercises/7").activity,
            7,
        );
    });

    it("detects the environment", () => {
        assert.strictEqual(
            identify("# https://naos.dodona.be/activities/1").environment,
            "NAOS",
        );
        assert.strictEqual(
            identify("# http://localhost:3000/activities/1").environment,
            "LOCAL",
        );
    });

    it("only considers the first line", () => {
        assert.throws(() =>
            identify("# no link\n# https://dodona.be/activities/1"),
        );
    });

    it("throws when no activity is found", () => {
        assert.throws(() => identify(""));
        assert.throws(() => identify("# https://dodona.be/courses/1"));
    });
});