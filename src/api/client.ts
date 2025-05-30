import "../prototypes/string";

import got, { HTTPError, RequestError } from "got";
import {
    commands,
    ConfigurationTarget,
    env,
    extensions,
    window,
    workspace,
} from "vscode";

import { ApiToken, getApiEnvironment, getApiToken, getDisplayLanguage } from "../configuration";
import {
    OPEN_SETTINGS_ACTION,
    VIEW_INSTRUCTIONS_ACTION,
} from "../constants/actions";
import { INVALID_TOKEN_MSG, MISSING_TOKEN_MSG } from "../constants/messages";
import { TOKEN_INSTUCTIONS_URL } from "../constants/urls";
import { DodonaEnvironments } from "../dodonaEnvironment";
import { InvalidAccessToken } from "./errors/invalidAccessToken";
import {
    ActivityManager,
    CourseManager,
    SeriesManager,
    SubmissionManager,
} from "./managers";
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
 * Error handling modes.
 */
export enum ErrorHandler {
    // Display errors in a message.
    DISPLAY,
    // Ignore all errors silently.
    IGNORE,
    // Raise all errors to the caller.
    RAISE,
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

    constructor(host: string, language: string, token: ApiToken | null) {
        // Get the extension version.
        const version = extensions.getExtension(
            "thepieterdc.dodona-plugin-vscode",
        )?.packageJSON.version;
        const userAgent = `Plugin/VSCode-${version}`;

        const html = got.extend({
            headers: {
                Accept: "text/html",
                "accept-language": language,
                Authorization: token || "",
                "user-agent": userAgent,
            },
            prefixUrl: host,
            resolveBodyOnly: true,
            responseType: "text",
        });

        const json = got.extend({
            headers: {
                Accept: "application/json",
                "accept-language": language,
                Authorization: token || "",
                "user-agent": userAgent,
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
    // Load the settings.
    const host = DodonaEnvironments[getApiEnvironment()];
    const language = getDisplayLanguage();
    const token = getApiToken();

    // Build a client.
    return new DodonaClientImpl(host, language, token);
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
 * @param errorHandler the error handler to use
 * @return the result of the call, or error handling
 */
export default async function execute<T>(
    call: DodonaCall<T>,
    errorHandler: ErrorHandler = ErrorHandler.DISPLAY,
): Promise<T | null> {
    try {
        // Execute the call.
        return await call(client);
    } catch (error) {
        // Silence errors.
        if (errorHandler === ErrorHandler.IGNORE) {
            return null;
        }

        // Handle invalid tokens.
        if (
            (error instanceof HTTPError && error.response.statusCode === 401) ||
            error instanceof InvalidAccessToken
        ) {
            // Raise errors to the caller.
            if (errorHandler === ErrorHandler.RAISE) {
                throw error;
            }

            // Display an error message to inform the user that an invalid or
            // empty API token was configured.
            const environment = getApiEnvironment();
            const msg = getApiToken()
                ? INVALID_TOKEN_MSG(environment)
                : MISSING_TOKEN_MSG(environment);

            // Get the user's action. We cannot use async/await here since this
            // will block processing.
            window
                .showErrorMessage(
                    `${msg} To correctly set up your token in Visual Studio Code, click the Instructions button below.`,
                    VIEW_INSTRUCTIONS_ACTION,
                    OPEN_SETTINGS_ACTION,
                )
                .then(action => {
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
                return execute(call, errorHandler);
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
