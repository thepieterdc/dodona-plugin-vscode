import * as Mocha from "mocha";
import * as path from "path";


export async function run(): Promise<void> {
    // Register coverage tracking.
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const NYC = require("nyc");
    const nyc = new NYC({
        all: true,
        cwd: path.join(__dirname, "..", ".."),
        exclude: ["**/test/**", ".vscode-test/**", "**/**.test.*s"],
        instrument: true,
        hookRequire: true,
        hookRunInContext: true,
        hookRunInThisContext: true,
        reporter: ["lcov"],
    });
    nyc.reset();
    nyc.wrap();

    // Build a new test suite.
    const mocha = new Mocha({
        color: true,
        timeout: 10000,
        ui: "tdd",
    });

    // Get the test root.
    const testRoot = path.resolve(__dirname, ".");

    // Add the files to the suite.
    mocha.addFile(path.resolve(testRoot, "commands/completeContentPage.test.js"));
    mocha.addFile(path.resolve(testRoot, "commands/createNewExercise.test.js"));
    mocha.addFile(path.resolve(testRoot, "commands/submitSolution.test.js"));

    // Run the suite.
    try {
        await new Promise<void>((resolve, reject) => {
            mocha.run(f => {
                if (f > 0) {
                    reject(new Error(`${f} tests failed.`));
                } else {
                    resolve();
                }
            });
        });
    } catch (err) {
        console.error(err);
    } finally {
        nyc.writeCoverageFile();
        await nyc.report();
    }
}