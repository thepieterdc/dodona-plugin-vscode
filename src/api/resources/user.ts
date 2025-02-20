import Course from "./course";
import { Resource } from "./resource";

/**
 * A submission on Dodona.
 */
export interface User extends Resource {
    subscribed_courses: Course[];
}

export default User;
