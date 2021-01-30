import { commands, env, Uri, window, workspace } from "vscode";
import { ApiToken, getApiEnvironment, getApiToken } from "../configuration";
import { DodonaEnvironments } from "../dodonaEnvironment";
import got, { HTTPError } from "got";
import {
    CourseManager,
    ActivityManager,
    SeriesManager,
    SubmissionManager,
} from "./managers";
import "../prototypes/string";
import { InvalidAccessToken } from "./errors/invalidAccessToken";
import NotificationManager from "./managers/notificationManager";

/**
 * A client for interfacing with Dodona.
 */
export interface DodonaClient {
    activities: ActivityManager;
    courses: CourseManager;
    notifications: NotificationManager;
    series: SeriesManager;
    submissions: SubmissionManager;
}

/**
 * Implementation of a client for interfacing with Dodona.
 */
class DodonaClientImpl implements DodonaClient {
    public readonly activities: ActivityManager;
    public readonly courses: CourseManager;
    public readonly notifications: NotificationManager;
    public readonly series: SeriesManager;
    public readonly submissions: SubmissionManager;

    constructor(host: string, token: ApiToken | null) {
        const html = got.extend({
            headers: {
                Accept: "text/html",
                Authorization: token || "",
            },
            prefixUrl: host,
            resolveBodyOnly: true,
            responseType: "text",
        });

        const json = got.extend({
            headers: {
                Accept: "application/json",
                Authorization: token || "",
            },
            prefixUrl: host,
            resolveBodyOnly: true,
            responseType: "json",
        });

        // Initialise managers.
        this.activities = new ActivityManager(html, json);
        this.courses = new CourseManager(json);
        this.notifications = new NotificationManager(json);
        this.series = new SeriesManager(json);
        this.submissions = new SubmissionManager(json);
    }
}

/**
 * A call to a Dodona resource.
 */
export type DodonaCall<T> = (client: DodonaClient) => Promise<T>;

/**
 * Builds a DodonaClient using the configured settings.
 */
function buildClient(): DodonaClient {
    // Fetch the host and token from the settings.
    const host = DodonaEnvironments[getApiEnvironment()];
    const token = getApiToken();

    // Build a client.
    return new DodonaClientImpl(host, token);
}

// Cache a client.
let client = buildClient();

// Rebuild the client on configuration changes.
workspace.onDidChangeConfiguration(e => {
    if (e.affectsConfiguration("dodona")) {
        client = buildClient();
    }
});

/**
 * Executes a call on Dodona.
 *
 * @param call the call to execute
 * @return the result of the call, or error handling
 */
export default async function execute<T>(
    call: DodonaCall<T>,
): Promise<T | null> {
    try {
        // Execute the call.
        return await call(client);
    } catch (error) {
        // Handle invalid tokens.
        if (
            (error instanceof HTTPError && error.response.statusCode === 401) ||
            error instanceof InvalidAccessToken
        ) {
            // Display an error message to inform the user that an invalid or
            // empty API token was configured.
            const instructionsButton = "Instructions";
            const settingsButton = "Open Settings";
            let msg = `You have not yet configured an API token for the ${getApiEnvironment().titlecase()} environment.`;
            if (getApiToken()) {
                msg = `You have configured an invalid API token for the ${getApiEnvironment().titlecase()} environment.`;
            }

            // Get the user's action.
            const selectedButton = await window.showErrorMessage(
                `${msg} To correctly set up your token in Visual Studio Code, click the Instructions button below.`,
                instructionsButton,
                settingsButton,
            );

            // Handle the action.
            if (selectedButton === instructionsButton) {
                // Open the instructions in the user's web browser.
                env.openExternal(
                    Uri.parse(
                        "https://dodona-edu.github.io/en/guides/vs-code-extension/#_3-insert-api-token",
                    ),
                );
            } else if (selectedButton === settingsButton) {
                // Open the token settings.
                commands.executeCommand("dodona.settings.token");
            }
        }

        // Empty response.
        return null;
    }
}
