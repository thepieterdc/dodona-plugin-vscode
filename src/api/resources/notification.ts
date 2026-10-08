import { z } from "zod";

import { resourceSchema } from "./resource";

export const notificationSchema = resourceSchema.extend({
    read: z.boolean(),
    updated_at: z.string(),
});

export type Notification = z.infer<typeof notificationSchema>;