import * as assert from "assert";

import { applyTheme } from "../../../util/theme";

describe("theme", () => {
    it("replaces an existing theme", () => {
        const html = '<html lang="en"\n  data-bs-theme="light"\n>';
        assert.ok(applyTheme(html, true).includes('data-bs-theme="dark"'));
        assert.ok(
            applyTheme('<html data-bs-theme="dark">', false).includes(
                'data-bs-theme="light"',
            ),
        );
    });

    it("adds a missing theme", () => {
        assert.strictEqual(
            applyTheme("<html lang=en>", true),
            '<html data-bs-theme="dark" lang=en>',
        );
    });

    it("only touches the root element", () => {
        const html = '<html data-bs-theme="light"><div data-bs-theme="light">';
        assert.strictEqual(
            applyTheme(html, true),
            '<html data-bs-theme="dark"><div data-bs-theme="light">',
        );
    });

    it("overrides the theme of the Dodona account", () => {
        const html = '<html data-bs-theme="light">dodona.initTheme("system");';
        assert.strictEqual(
            applyTheme(html, true),
            '<html data-bs-theme="dark">dodona.initTheme("dark");',
        );
    });
});