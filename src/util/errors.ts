/**
 * Humanizes an attribute name by replacing underscores with spaces and
 * capitalizing the first letter.
 *
 * @param attribute the attribute name to humanize
 * @return the humanized attribute name
 */
function humanizeAttribute(attribute: string): string {
    const spaced = attribute.replace(/_/g, " ");
    if (spaced.length === 0) {
        return spaced;
    }
    return spaced.charAt(0).toUpperCase() + spaced.substring(1);
}

/**
 * Extracts a human-readable error message from an API response body.
 *
 * Dodona denies actions with a body shaped like Rails validation errors,
 * e.g. `{"status": "failed", "errors": {"exercise": ["not permitted"]}}`,
 * a hash of attribute name to an array of message strings. This flattens
 * that shape into a single string, formatted similarly to Rails'
 * `full_messages`: "<Humanized attribute> <message>", joining multiple
 * resulting sentences with "; ". A top-level `error` string is also
 * supported, for compatibility with any API that sends a singular key.
 *
 * This function is defensive and never throws: anything that does not
 * match one of the expected shapes results in null, leaving the caller to
 * supply its own fallback text.
 *
 * @param body the response body to extract the error message from
 * @return the extracted error message, or null if none could be extracted
 */
export function extractErrorMessage(body: unknown): string | null {
    if (typeof body !== "object" || body === null || Array.isArray(body)) {
        return null;
    }

    const { error, errors } = body as { error?: unknown; errors?: unknown };

    // A top-level singular error message.
    if (typeof error === "string" && error.length > 0) {
        return error;
    }

    // A hash of attribute name to an array of message strings.
    if (typeof errors !== "object" || errors === null || Array.isArray(errors)) {
        return null;
    }

    const messages: string[] = [];
    for (const [attribute, attributeMessages] of Object.entries(
        errors as Record<string, unknown>,
    )) {
        if (!Array.isArray(attributeMessages)) {
            continue;
        }

        const humanizedAttribute = humanizeAttribute(attribute);
        for (const message of attributeMessages) {
            if (typeof message === "string" && message.length > 0) {
                messages.push(`${humanizedAttribute} ${message}`);
            }
        }
    }

    return messages.length > 0 ? messages.join("; ") : null;
}
