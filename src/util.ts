import { Resource } from "./api/resources/resource";
import { Uri } from "vscode";

/**
 * Gets the canonical url of the resource, being the url without any extension.
 *
 * @param resource the resource to consider
 * @return the canonical url
 */
export function canonicalUrl(resource: Resource): Uri {
    return Uri.parse(resource.url.replace(".json", ""));
}

/**
 * Returns either the singular or the plural form of the word, depending on the
 * amount.
 *
 * @param amount the amount of items
 * @param singular the singular form
 * @param plural the plural form. If blank, this defaults to singular + s.
 */
export function pluralise(
    amount: number,
    singular: string,
    plural?: string,
): string {
    if (amount === 1) {
        return singular;
    }
    return plural || singular + "s";
}

/**
 * Halts execution for the given amount of milliseconds.
 *
 * @param amt amount of time to wait
 */
export function sleep(amt: number): Promise<void> {
    return new Promise(r => setTimeout(r, amt));
}
