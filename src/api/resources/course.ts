import { Resource } from "./resource";

/**
 * A course on Dodona.
 */
export interface Course extends Resource {
    name: string;
    series: string;
}

export default Course;