import { workspace, WorkspaceConfiguration } from "vscode";
import { DodonaEnvironment, getDodonaEnvironment } from "./dodonaEnvironment";

/**
 * Key under which the configuration is stored.
 */
export const CONFIG_KEY = "dodona";

/**
 * Types of the configuration values.
 */
export type ApiToken = string;


/**
 * Gets the configuration for this plugin.
 */
export function config(): WorkspaceConfiguration {
    return workspace.getConfiguration(CONFIG_KEY);
}

/**
 * Gets the API environment from the configuration.
 *
 * @return the configured environment
 */
export function getApiEnvironment(): DodonaEnvironment {
    const environment = config().get("environment") as string;
    return getDodonaEnvironment(environment);
}

/**
 * Gets the API token for the active environment from the configuration.
 *
 * @return the configured api token
 */
export function getApiToken(): ApiToken | null {
    const environment = getApiEnvironment().toLowerCase();
    return config().get<string>(`auth.${environment}`) || null;
}

/**
 * Gets the Auto-Open-Description checkbox from the configuration.
 * 
 * @return the current value of the checkbox
 */
export function getAutoDescription(): boolean {
    return config().get("automaticallyOpenExerciseDescription") || true;
}
