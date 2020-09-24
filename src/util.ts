/**
 * Halts execution for the given amount of milliseconds.
 *
 * @param amt amount of time to wait
 */
export function sleep(amt: number): Promise<void> {
    return new Promise(r => setTimeout(r, amt));
}