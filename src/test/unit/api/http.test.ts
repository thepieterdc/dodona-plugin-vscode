import * as assert from "assert";

import * as sinon from "sinon";
import { z } from "zod";

import HttpClient, {
    HttpError,
    RequestError,
    ResponseValidationError,
} from "../../../api/http";

const schema = z.object({ a: z.number() });

describe("HttpClient", () => {
    let fetchStub: sinon.SinonStub;
    const client = new HttpClient("https://dodona.be/base/", { h: "v" });

    beforeEach(() => {
        fetchStub = sinon.stub(globalThis, "fetch");
    });

    afterEach(() => {
        sinon.restore();
    });

    const respond = (body: string, status = 200) =>
        fetchStub.resolves(new Response(body, { status }));

    describe("request", () => {
        it("resolves relative urls against the base url", async () => {
            respond("text");
            await client.text("x.json");
            assert.strictEqual(
                String(fetchStub.firstCall.args[0]),
                "https://dodona.be/base/x.json",
            );
        });

        it("keeps absolute urls", async () => {
            respond("text");
            await client.text("https://other.be/y");
            assert.strictEqual(
                String(fetchStub.firstCall.args[0]),
                "https://other.be/y",
            );
        });

        it("sends the configured headers", async () => {
            respond("text");
            await client.text("x");
            const init = fetchStub.firstCall.args[1];
            assert.strictEqual(init.method, "GET");
            assert.deepStrictEqual(init.headers, { h: "v" });
        });

        it("throws an HttpError with a parsed JSON body", async () => {
            respond('{"error":"nope"}', 403);
            await assert.rejects(client.text("x"), (e: unknown) => {
                assert.ok(e instanceof HttpError);
                assert.strictEqual(e.status, 403);
                assert.deepStrictEqual(e.body, { error: "nope" });
                return true;
            });
        });

        it("keeps a non-JSON error body as text", async () => {
            respond("<html>oops</html>", 500);
            await assert.rejects(client.text("x"), (e: unknown) => {
                assert.ok(e instanceof HttpError);
                assert.strictEqual(e.status, 500);
                assert.strictEqual(e.body, "<html>oops</html>");
                return true;
            });
        });

        it("wraps network failures in a RequestError", async () => {
            const cause = new Error("boom");
            fetchStub.rejects(cause);
            await assert.rejects(client.text("x"), (e: unknown) => {
                assert.ok(e instanceof RequestError);
                assert.strictEqual(e.message, "boom");
                assert.strictEqual(e.cause, cause);
                return true;
            });
        });
    });

    describe("json", () => {
        it("returns validated data", async () => {
            respond('{"a":1,"extra":true}');
            assert.deepStrictEqual(await client.json("x", schema), { a: 1 });
        });

        it("throws a ResponseValidationError on a schema mismatch", async () => {
            respond('{"a":"1"}');
            await assert.rejects(client.json("x", schema), (e: unknown) => {
                assert.ok(e instanceof ResponseValidationError);
                assert.strictEqual(e.url, "x");
                return true;
            });
        });
    });

    describe("post", () => {
        it("sends the body as JSON", async () => {
            respond('{"a":2}');
            const result = await client.post("x", schema, { k: 1 });
            assert.deepStrictEqual(result, { a: 2 });

            const init = fetchStub.firstCall.args[1];
            assert.strictEqual(init.method, "POST");
            assert.strictEqual(init.body, '{"k":1}');
            assert.deepStrictEqual(init.headers, {
                h: "v",
                "Content-Type": "application/json",
            });
        });

        it("omits body and content type without a body", async () => {
            respond('{"a":2}');
            await client.post("x", schema);
            const init = fetchStub.firstCall.args[1];
            assert.strictEqual(init.body, undefined);
            assert.deepStrictEqual(init.headers, { h: "v" });
        });

        it("validates an empty response as undefined", async () => {
            respond("");
            await assert.rejects(
                client.post("x", schema),
                ResponseValidationError,
            );
            respond("");
            assert.strictEqual(
                await client.post("x", z.undefined()),
                undefined,
            );
        });
    });
});