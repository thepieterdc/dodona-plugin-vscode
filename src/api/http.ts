import { z } from "zod";

/**
 * Raised when the server responds with a non-successful status code.
 */
export class HttpError extends Error {
    constructor(
        public readonly status: number,
        public readonly body: unknown,
    ) {
        super(`Request failed with status code ${status}`);
        this.name = "HttpError";
    }
}

/**
 * Raised when a request could not be completed (network, TLS, ... errors).
 */
export class RequestError extends Error {
    constructor(cause: unknown) {
        super(cause instanceof Error ? cause.message : `${cause}`, { cause });
        this.name = "RequestError";
    }
}

/**
 * Raised when a response does not match the expected schema.
 */
export class ResponseValidationError extends Error {
    constructor(
        public readonly url: string,
        public readonly cause: z.ZodError,
    ) {
        super(`Unexpected response from ${url}: ${z.prettifyError(cause)}`, {
            cause,
        });
        this.name = "ResponseValidationError";
    }
}

/**
 * A minimal HTTP client on top of fetch.
 */
export default class HttpClient {
    /**
     * HttpClient constructor.
     *
     * @param baseUrl the url against which relative urls are resolved
     * @param headers headers to send with every request
     */
    constructor(
        private readonly baseUrl: string,
        private readonly headers: Record<string, string>,
    ) {}

    /**
     * Performs a GET request and returns the body as text.
     *
     * @param url absolute url, or path relative to the base url
     */
    public async text(url: string): Promise<string> {
        return (await this.request("GET", url)).text();
    }

    /**
     * Performs a GET request and returns the body parsed as JSON.
     *
     * @param url absolute url, or path relative to the base url
     * @param schema schema the response is validated against
     */
    public async json<S extends z.ZodType>(
        url: string,
        schema: S,
    ): Promise<z.output<S>> {
        const data = await (await this.request("GET", url)).json();
        return this.validate(url, schema, data);
    }

    /**
     * Performs a POST request and returns the body parsed as JSON.
     *
     * @param url absolute url, or path relative to the base url
     * @param schema schema the response is validated against
     * @param body optional JSON body
     */
    public async post<S extends z.ZodType>(
        url: string,
        schema: S,
        body?: unknown,
    ): Promise<z.output<S>> {
        const response = await this.request("POST", url, body);
        const text = await response.text();
        return this.validate(url, schema, text ? JSON.parse(text) : undefined);
    }

    private validate<S extends z.ZodType>(
        url: string,
        schema: S,
        data: unknown,
    ): z.output<S> {
        const result = schema.safeParse(data);
        if (!result.success) {
            throw new ResponseValidationError(url, result.error);
        }
        return result.data;
    }

    private async request(
        method: "GET" | "POST",
        url: string,
        body?: unknown,
    ): Promise<Response> {
        const init: RequestInit = { method, headers: { ...this.headers } };
        if (body !== undefined) {
            init.headers = {
                ...this.headers,
                "Content-Type": "application/json",
            };
            init.body = JSON.stringify(body);
        }

        let response: Response;
        try {
            response = await fetch(new URL(url, this.baseUrl), init);
        } catch (error) {
            throw new RequestError(error);
        }

        if (!response.ok) {
            const raw = await response.text().catch(() => "");
            let parsed: unknown = raw;
            try {
                parsed = JSON.parse(raw);
            } catch {
                // Not JSON, keep the raw text.
            }
            throw new HttpError(response.status, parsed);
        }
        return response;
    }
}