"use strict";

// Sets the next version.
const fs = require("fs");
const packageJson = require("../package.json");

packageJson.version = process.argv[2];

fs.writeFileSync(
    `${__dirname}/../package.json`,
    JSON.stringify(packageJson, null, 2),
);
