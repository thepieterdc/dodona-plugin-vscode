"use strict";

// Reads the changelog to get the latest changes.
const fs = require("fs");
const changelog = fs.readFileSync(`${__dirname}/../CHANGELOG.md`, "utf-8");
const lines = changelog.split("\n");

// Don't include the first version name.
for (let i = 1; i < lines.length; ++i) {
    // Account for the whitespace separating versions.
    if (lines[i + 1].startsWith("##")) {
        return;
    }
    console.log(lines[i]);
}
