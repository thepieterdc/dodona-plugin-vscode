import {
    commands,
    ConfigurationTarget,
    env,
    extensions,
    window,
    workspace,
} from "vscode";
import { ApiToken, getApiEnvironment, getApiToken } from "../configuration";
import { DodonaEnvironments } from "../dodonaEnvironment";
import got, { HTTPError, RequestError } from "got";
import {
    ActivityManager,
    CourseManager,
    SeriesManager,
    SubmissionManager,
} from "./managers";
import "../prototypes/string";
import { InvalidAccessToken } from "./errors/invalidAccessToken";
import NotificationManager from "./managers/notificationManager";
import {
    OPEN_SETTINGS_ACTION,
    VIEW_INSTRUCTIONS_ACTION,
} from "../constants/actions";
import { TOKEN_INSTUCTIONS_URL } from "../constants/urls";
import { INVALID_TOKEN_MSG, MISSING_TOKEN_MSG } from "../constants/messages";

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
        // Get the extension version.
        const version = extensions.getExtension("thepieterdc.dodona-plugin-vscode")?.packageJSON.version;

        const html = got.extend({
            headers: {
                Accept: "text/html",
                Authorization: token || "",
                "user-agent": `Plugin/VSCode-${version}`,
            },
            prefixUrl: host,
            resolveBodyOnly: true,
            responseType: "text",
        });

        const json = got.extend({
            headers: {
                Accept: "application/json",
                Authorization: token || "",
                "user-agent": `Plugin/VSCode-${version}`,
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
 * @param handleErrors true if errors need to be handled in this function, false
 * @return the result of the call, or error handling
 */
export default async function execute<T>(
    call: DodonaCall<T>,
    handleErrors = true,
): Promise<T | null> {
    try {
        // Execute the call.
        return await call(client);
    } catch (error) {
        // Validate whether errors need to be handled.
        if (!handleErrors) {
            return null;
        }

        // Handle invalid tokens.
        if (
            (error instanceof HTTPError && error.response.statusCode === 401) ||
            error instanceof InvalidAccessToken
        ) {
            // Display an error message to inform the user that an invalid or
            // empty API token was configured.
            const environment = getApiEnvironment();
            const msg = getApiToken()
                ? INVALID_TOKEN_MSG(environment)
                : MISSING_TOKEN_MSG(environment);

            // Get the user's action. We cannot use async/await here since this
            // will block processing.
            window.showErrorMessage(
                `${msg} To correctly set up your token in Visual Studio Code, click the Instructions button below.`,
                VIEW_INSTRUCTIONS_ACTION,
                OPEN_SETTINGS_ACTION,
            ).then(action => {
                // Handle the action.
                if (action === VIEW_INSTRUCTIONS_ACTION) {
                    // Open the instructions in the user's web browser.
                    env.openExternal(TOKEN_INSTUCTIONS_URL);
                } else if (action === OPEN_SETTINGS_ACTION) {
                    // Open the token settings.
                    commands.executeCommand("dodona.settings.token");
                }
            });
        } else if (error instanceof RequestError) {
            // Attempt to fix the certificate error.
            const key = "http.systemCertificates";
            const config = workspace.getConfiguration();
            if (config.get(key)) {
                // The setting was true, flip it and retry the call.
                await config.update(key, false, ConfigurationTarget.Global);
                return execute(call, handleErrors);
            } else {
                // The setting was already turned off.
                window.showErrorMessage(`${error}`);
            }
        } else {
            // Display every other error as popup
            window.showErrorMessage(`${error}`);
        }

        // Empty response.
        return null;
    }
}
