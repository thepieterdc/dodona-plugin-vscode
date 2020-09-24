import { Resource } from "../resource";

/**
 * An activity on Dodona.
 */
export interface Activity extends Resource {
    description_url: string;
    name: string;
}

export default Activity;