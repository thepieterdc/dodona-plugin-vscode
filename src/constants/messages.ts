import { DodonaEnvironment } from "../dodonaEnvironment";
import { pluralise } from "../util/base";

export const INVALID_TOKEN_MSG = (env: DodonaEnvironment) =>
    `You have configured an invalid API token for the ${env.titlecase()} environment.`;
export const MISSING_TOKEN_MSG = (env: DodonaEnvironment) =>
    `You have not yet configured an API token for the ${env.titlecase()} environment.`;
export const READING_ACTIVITY_COMPLETED_MSG =
    "Successfully completed the reading activity.";
export const UNREAD_NOTIFICATION_MSG = (amount: number) =>
    `You have ${amount} new unread ${pluralise(amount, "notification")}.`;
