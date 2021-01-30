import { DodonaEnvironment } from "../dodonaEnvironment";
import { pluralise } from "../util";

export const INVALID_TOKEN_MSG = (env: DodonaEnvironment) =>
    `You have configured an invalid API token for the ${env.titlecase()} environment.`;
export const MISSING_TOKEN_MSG = (env: DodonaEnvironment) =>
    `You have not yet configured an API token for the ${env.titlecase()} environment.`;
export const UNREAD_NOTIFICATION_MSG = (amount: number) =>
    `You have ${amount} new unread ${pluralise(amount, "notification")}.`;
