import { Resource } from "./resource";

export interface Notification extends Resource {
    read: boolean;
    updated_at: string;
}
