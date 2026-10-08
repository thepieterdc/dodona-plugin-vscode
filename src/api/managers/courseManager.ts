import { z } from "zod";

import { InvalidAccessToken } from "../errors/invalidAccessToken";
import HttpClient from "../http";
import { Course } from "../resources/course";
import { userSchema } from "../resources/user";

/**
 * Response of querying the root of Dodona. The user is absent when the token
 * is invalid.
 */
const rootResponseSchema = z.object({ user: userSchema.nullish() });

export default class CourseManager {
    private readonly jsonApi: HttpClient;

    /**
     * CourseManager constructor.
     *
     * @param jsonApi json request fac>tory
     */
    constructor(jsonApi: HttpClient) {
        this.jsonApi = jsonApi;
    }

    /**
     * Gets the courses the user has subscribed to.
     *
     * @return the courses
     */
    public get subscribed(): Promise<Course[]> {
        return this.jsonApi.json("", rootResponseSchema).then(resp => {
            if (resp.user) {
                return resp.user.subscribed_courses;
            }
            throw new InvalidAccessToken();
        });
    }
}