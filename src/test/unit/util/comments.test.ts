import * as assert from "assert";

import { comment } from "../../../util/comments";

describe("test comment default", () => {
    it("should be /* */", () => {
        assert.equal(comment("test"), "/* test */");
    });
});