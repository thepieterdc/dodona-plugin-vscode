import { readFileSync, writeFileSync } from "node:fs";

// Determines the next snapshot version.
const packageJsonUrl = new URL("../package.json", import.meta.url);
const packageJson = JSON.parse(readFileSync(packageJsonUrl, "utf8"));

const currentVersion = packageJson.version.split(".").map(Number);
currentVersion[2] += 1;

packageJson.version = `${currentVersion.join(".")}-SNAPSHOT`;

writeFileSync(packageJsonUrl, JSON.stringify(packageJson, null, 2));