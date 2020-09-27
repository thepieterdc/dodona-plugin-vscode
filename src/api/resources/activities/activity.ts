import { Resource } from "../resource";

/**
 * Types of activities.
 */
export type ActivityType = "ContentPage" | "Exercise";

/**
 * An activity on Dodona.
 */
export interface Activity extends Resource {
    description_url: string;
    name: string;
    type: ActivityType;
}

export default Activity;