import * as path from "path";
import { runTests } from "@vscode/test-electron";

// Main test runner.
async function main(): Promise<void> {
    // Folder containing the extension manifest.
    const extensionDevelopmentPath = path.resolve(__dirname, "../../");

    // Path to the test runner.
    const extensionTestsPath = path.resolve(__dirname, "./index");

    try {
        // Run the tests.
        await runTests({
            extensionDevelopmentPath,
            extensionTestsPath,
            launchArgs: ["--install-extension", "thepieterdc.dodona-plugin-vscode"],
        });
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
}

main();