import * as assert from "assert";

import * as sinon from "sinon";

import HttpClient from "../../../../api/http";
import ActivityManager from "../../../../api/managers/activityManager";
import { Series } from "../../../../api/resources/series";

const series = {
    exercises: "https://dodona.be/en/series/1/activities.json",
} as Series;

const activity = (id: number) => ({
    id,
    name: `Activity ${id}`,
    type: "ContentPage",
    url: `https://dodona.be/activities/${id}.json`,
    description_url: `https://dodona.be/activities/${id}/description/`,
    has_read: false,
});

const page = (from: number, count: number) =>
    Array.from({ length: count }, (_, i) => activity(from + i));

describe("ActivityManager.inSeries", () => {
    let json: sinon.SinonStub;
    let manager: ActivityManager;

    beforeEach(() => {
        json = sinon.stub();
        manager = new ActivityManager(
            {} as HttpClient,
            { json } as unknown as HttpClient,
        );
    });

    const requested = () =>
        json.getCalls().map(c => new URL(c.args[0]).searchParams.get("page"));

    it("makes a single request for an empty series", async () => {
        json.resolves([]);
        assert.deepStrictEqual(await manager.inSeries(series), []);
        assert.deepStrictEqual(requested(), ["1"]);
    });

    it("makes a single request for a partial page", async () => {
        json.resolves(page(1, 99));
        assert.strictEqual((await manager.inSeries(series)).length, 99);
        assert.deepStrictEqual(requested(), ["1"]);
    });

    it("keeps fetching while pages are full", async () => {
        json.onCall(0).resolves(page(1, 100));
        json.onCall(1).resolves(page(101, 100));
        json.onCall(2).resolves(page(201, 45));
        const result = await manager.inSeries(series);
        assert.strictEqual(result.length, 245);
        assert.deepStrictEqual(
            result.map(a => a.id),
            Array.from({ length: 245 }, (_, i) => i + 1),
        );
        assert.deepStrictEqual(requested(), ["1", "2", "3"]);
    });

    it("stops after an empty page following a full one", async () => {
        json.onCall(0).resolves(page(1, 100));
        json.onCall(1).resolves([]);
        assert.strictEqual((await manager.inSeries(series)).length, 100);
        assert.deepStrictEqual(requested(), ["1", "2"]);
    });

    it("stops when the server ignores the page parameter", async () => {
        json.resolves(page(1, 100));
        await manager.inSeries(series);
        assert.strictEqual(json.callCount, 10);
    });

    it("keeps existing query parameters", async () => {
        json.resolves([]);
        await manager.inSeries({
            exercises: "https://dodona.be/series/1/activities.json?x=y",
        } as Series);
        const url = new URL(json.firstCall.args[0]);
        assert.strictEqual(url.searchParams.get("x"), "y");
        assert.strictEqual(url.searchParams.get("per_page"), "100");
    });
});