/**
 * All the supported Dodona environments.
 */
export enum DodonaEnvironments {
    DODONA = "https://dodona.ugent.be",
    LOCAL = "https://b6fa-2a02-1811-9c8a-c900-c846-9a4-aebf-5b72.ngrok.io",
    NAOS = "https://naos.ugent.be"
}

/**
 * Type of the Dodona environments.
 */
export type DodonaEnvironment = keyof typeof DodonaEnvironments;

/**
 * Gets a DodonaEnvironment by its value.
 *
 * @param value the value to match
 * @return the DodonaEnvironment instance
 */
export function getDodonaEnvironment(value: string): DodonaEnvironment {
    if (value.includes("naos")) {
        return "NAOS";
    } else if (value.includes("2a02")) {
        return "LOCAL";
    }

    return "DODONA";
}