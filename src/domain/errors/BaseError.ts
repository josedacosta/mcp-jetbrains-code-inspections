/**
 * Base error class for all custom errors
 */
export abstract class BaseError extends Error {
    public readonly code: string;
    public readonly details?: unknown;
    public readonly timestamp: Date;

    protected constructor(message: string, code: string, details?: unknown) {
        super(message);
        this.name = this.constructor.name;
        this.code = code;
        this.details = details;
        this.timestamp = new Date();
        Object.setPrototypeOf(this, new.target.prototype);
    }
}
