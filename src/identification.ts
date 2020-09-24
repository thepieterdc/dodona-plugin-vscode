import { AssertionError } from "assert";
import { DodonaEnvironment, getDodonaEnvironment } from "./dodonaEnvironment";

/**
 * Identification data.
 */
export interface IdentificationData {
    environment: DodonaEnvironment;
    activity: number;
    course: number | null;
    series: number | null;
}

// Initialise regexes.
const activityRegex = /https?:\/\/.*\/(?:activities|exercises)\/(\d+)/i;
const courseRegex = /https?:\/\/.*\/courses\/(\d+)/i;
const seriesRegex = /https?:\/\/.*\/series\/(\d+)/i;

function identifyActivity(url: string): number {
    const match = url.match(activityRegex);
    if (match?.length === 2) {
        return parseInt(match[1]);
    }

    throw new AssertionError({ message: "Activity not found in url." });
}

function identifyCourse(url: string): number | null {
    const match = url.match(courseRegex);
    if (match?.length === 2) {
        return parseInt(match[1]);
    }
    return null;
}

function identifySeries(url: string): number | null {
    const match = url.match(seriesRegex);
    if (match?.length === 2) {
        return parseInt(match[1]);
    }
    return null;
}

/**
 * Identifies the activity from the code.
 *
 * @param code the code
 */
export function identify(code: string): IdentificationData {
    // Get the first line of the code.
    const firstLine = code.split("\n")[0];

    // Parse the course, series and activity.
    const activity = identifyActivity(firstLine);
    const course = identifyCourse(firstLine);
    const series = identifySeries(firstLine);

    // Parse the environment.
    const environment = getDodonaEnvironment(firstLine);

    // Format the result.
    return {
        environment: environment,
        activity: activity,
        course: course,
        series: series,
    };
}

export default IdentificationData;