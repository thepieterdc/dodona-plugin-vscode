import * as assert from "assert";

import { ProgrammingLanguage } from "../../../api/resources/programmingLanguage";
import { comment } from "../../../util/comments";

const lang = (name: string) => ({ name }) as ProgrammingLanguage;

describe("test comment default", () => {
    it("should be /* */", () => {
        assert.equal(comment("test"), "/* test */");
    });

    it("falls back for unknown languages", () => {
        assert.equal(comment("test", lang("Brainfuck")), "/* test */");
    });
});

describe("comment per language", () => {
    const cases: [string, string][] = [
        ["Python", "# test"],
        ["Ruby", "# test"],
        ["Java", "// test"],
        ["JavaScript", "// test"],
        ["C++", "// test"],
        ["Haskell", "-- test"],
        ["SQL", "-- test"],
        ["Prolog", "% test"],
        ["HTML", "<!-- test -->"],
    ];
    for (const [name, expected] of cases) {
        it(`comments ${name}`, () => {
            assert.equal(comment("test", lang(name)), expected);
        });
    }
});