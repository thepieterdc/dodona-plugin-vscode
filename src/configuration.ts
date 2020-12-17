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
    return getDodonaEnvironment(getEnvironmentUrl());
}

/**
 * Gets the complete API environment from the configuration.
 *
 * @return the configured environment's complete url.
 */
export function getEnvironmentUrl(): string {
    return config().get("environment") as string;
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
    return config().get("exercise.description.auto") || false;
}

/**
 * Gets the SortOption dropdown from the configuration.
 *
 * @return the current value of the dropdown field
 */
export function getSortOption(): string {
    return config().get("treeview.sort") || "Academic year (descending)";
}

/**
 * Gets the academic year filter from the configuration.
 *
 * @return the current value of the input field
 */
export function getYearFilter(): string {
    return config().get("treeview.years") || "";
}

/**
 * Gets the course id filter from the configuration.
 *
 * @return the current value of the input field
 */
export function getCourseFilter(): string {
    return config().get("treeview.courses") || "";
}
