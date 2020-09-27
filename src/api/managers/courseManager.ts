import Course from "../resources/course";
import { Got } from "got";
import User from "../resources/user";
import { InvalidAccessToken } from "../errors/invalidAccessToken";

/**
 * Response of querying the root of Dodona.
 */
interface RootResponse {
    user: User;
}

export default class CourseManager {
    private readonly jsonApi: Got;

    /**
     * CourseManager constructor.
     *
     * @param jsonApi json request fac>tory
     */
    constructor(jsonApi: Got) {
        this.jsonApi = jsonApi;
    }

    /**
     * Gets the courses the user has subscribed to.
     *
     * @return the courses
     */
    public get subscribed(): Promise<Course[]> {
        return this.jsonApi.get("").json().then(resp => {
            if ((<RootResponse>resp).user) {
                return (<RootResponse>resp).user.subscribed_courses;
            }
            throw new InvalidAccessToken();
        });
    }
}