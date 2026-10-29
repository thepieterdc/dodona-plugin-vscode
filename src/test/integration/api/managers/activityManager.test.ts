import * as assert from "assert/strict";

import HttpClient from "../../../../api/http";
import ActivityManager from "../../../../api/managers/activityManager";
import { Activity } from "../../../../api/resources/activities";
import { Series } from "../../../../api/resources/series";
import { getJson } from "../../util";

const BASE = "http://localhost:3000";

suite("ActivityManager", () => {
    test("inSeries returns every activity of a series", async () => {
        const headers = { Accept: "application/json", Authorization: "zeus" };
        const manager = new ActivityManager(
            new HttpClient(BASE, headers),
            new HttpClient(BASE, headers),
        );

        // Find the series with the most activities.
        const courses: { series: string }[] = await getJson(`${BASE}/courses`);
        const candidates: Series[] = [];
        for (const course of courses) {
            candidates.push(...(await getJson<Series[]>(course.series)));
        }
        assert.ok(candidates.length > 0, "no series available");

        for (const series of candidates) {
            // Unpaginated reference list.
            const expected = await getJson<Activity[]>(
                `${series.exercises}?per_page=1000`,
            );
            const actual = await manager.inSeries(series);
            assert.deepEqual(
                actual.map(a => a.id),
                expected.map(a => a.id),
            );
        }
    });
});