/**
 * Logger implementation for the application
 */
export enum LogLevel {
    DEBUG = 0,
    INFO = 1,
    WARN = 2,
    ERROR = 3,
}

export class Logger {
    private readonly context: string;
    private readonly logLevel: LogLevel;

    constructor(context: string = 'App') {
        this.context = context;
        this.logLevel = this.getLogLevel();
    }

    debug(message: string, data?: unknown): void {
        if (this.logLevel <= LogLevel.DEBUG) {
            this.log('DEBUG', message, data);
        }
    }

    info(message: string, data?: unknown): void {
        if (this.logLevel <= LogLevel.INFO) {
            this.log('INFO', message, data);
        }
    }

    warn(message: string, data?: unknown): void {
        if (this.logLevel <= LogLevel.WARN) {
            this.log('WARN', message, data);
        }
    }

    error(message: string, error?: unknown): void {
        if (this.logLevel <= LogLevel.ERROR) {
            const errorData = this.formatError(error);
            this.log('ERROR', message, errorData);
        }
    }

    private log(level: string, message: string, data?: unknown): void {
        const timestamp = new Date().toISOString();
        const formattedMessage = `[${timestamp}] [${level}] [${this.context}] ${message}`;

        const output = data ? `${formattedMessage} ${JSON.stringify(data, null, 2)}` : formattedMessage;

        // Log to stderr for MCP compatibility
        console.error(output);
    }

    private formatError(error: unknown): Record<string, unknown> | undefined {
        if (!error) return undefined;

        if (error instanceof Error) {
            return {
                name: error.name,
                message: error.message,
                stack: error.stack,
            };
        }

        return { error };
    }

    private getLogLevel(): LogLevel {
        const envLevel = process.env.LOG_LEVEL || process.env.DEBUG;

        if (envLevel === 'true' || envLevel === 'DEBUG') {
            return LogLevel.DEBUG;
        }

        switch (envLevel?.toUpperCase()) {
            case 'DEBUG':
                return LogLevel.DEBUG;
            case 'INFO':
                return LogLevel.INFO;
            case 'WARN':
                return LogLevel.WARN;
            case 'ERROR':
                return LogLevel.ERROR;
            default:
                return LogLevel.INFO;
        }
    }
}
