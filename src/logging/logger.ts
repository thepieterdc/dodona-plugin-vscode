import { LogOutputChannel, window } from "vscode";

const CHANNEL_NAME = "Dodona";

let channel: LogOutputChannel | undefined;

function getChannel(): LogOutputChannel {
    if (!channel) {
        channel = window.createOutputChannel(CHANNEL_NAME, { log: true });
    }
    return channel;
}

function safeToString(value: unknown): string {
    if (typeof value === "string") return value;
    if (value instanceof Error) return value.stack || value.message;
    try {
        return JSON.stringify(value);
    } catch {
        return String(value);
    }
}

export const logger = {
    debug(message: string, ...args: unknown[]) {
        getChannel().debug(
            args.length ? `${message} ${args.map(safeToString).join(" ")}` : message,
        );
    },
    info(message: string, ...args: unknown[]) {
        getChannel().info(
            args.length ? `${message} ${args.map(safeToString).join(" ")}` : message,
        );
    },
    warn(message: string, ...args: unknown[]) {
        getChannel().warn(
            args.length ? `${message} ${args.map(safeToString).join(" ")}` : message,
        );
    },
    error(message: string, ...args: unknown[]) {
        getChannel().error(
            args.length ? `${message} ${args.map(safeToString).join(" ")}` : message,
        );
    },
    dispose() {
        channel?.dispose();
        channel = undefined;
    },
};

