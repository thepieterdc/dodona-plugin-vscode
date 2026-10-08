import { readFileSync, writeFileSync } from "node:fs";

// Sets the next version.
const packageJsonUrl = new URL("../package.json", import.meta.url);
const packageJson = JSON.parse(readFileSync(packageJsonUrl, "utf8"));

packageJson.version = process.argv[2];

writeFileSync(packageJsonUrl, JSON.stringify(packageJson, null, 2));