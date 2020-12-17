import { Resource } from "./resource";

/**
 * A course on Dodona.
 */
export interface Course extends Resource {
    name: string;
    series: string;
    year: string;
}

export default Course;
