/**
 * Fetches JSON from the local Dodona instance, authenticated as zeus.
 *
 * @param url the url to fetch
 */
export async function getJson<T>(url: string | URL): Promise<T> {
    const response = await fetch(url, {
        headers: { Accept: "application/json", Authorization: "zeus" },
    });
    if (!response.ok) {
        throw new Error(`GET ${url} failed with status ${response.status}`);
    }
    return (await response.json()) as T;
}