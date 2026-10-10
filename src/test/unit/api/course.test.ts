import * as assert from "assert";

import { courseSchema } from "../../../api/resources/course";

const base = { id: 1, url: "https://dodona.be/courses/1.json", name: "C" };

describe("courseSchema", () => {
    it("keeps the year", () => {
        const c = courseSchema.parse({ ...base, series: "s", year: "2025" });
        assert.strictEqual(c.year, "2025");
    });

    it("defaults a missing or null year to an empty string", () => {
        assert.strictEqual(
            courseSchema.parse({ ...base, series: "s" }).year,
            "",
        );
        assert.strictEqual(
            courseSchema.parse({ ...base, series: "s", year: null }).year,
            "",
        );
    });
});