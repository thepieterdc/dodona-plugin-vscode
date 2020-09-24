import { Resource } from "./resource";
import Course from "./course";

/**
 * A submission on Dodona.
 */
export interface User extends Resource {
    subscribed_courses: Course[];
}

export default User;