"use strict";

// Determines the next snapshot version.
const fs = require("fs");
const packageJson = require("../package.json");
const currentVersion = packageJson.version.split(".").map(i => parseInt(i));
currentVersion[2] += 1;

const nextVersion = `${currentVersion.join(".")}-SNAPSHOT`;
packageJson.version = nextVersion;

fs.writeFileSync(
    `${__dirname}/../package.json`,
    JSON.stringify(packageJson, null, 2),
);
