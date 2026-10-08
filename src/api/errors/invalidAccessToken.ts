export class InvalidAccessToken implements Error {
    message = "An invalid access token was provided.";
    name = "InvalidToken";
}