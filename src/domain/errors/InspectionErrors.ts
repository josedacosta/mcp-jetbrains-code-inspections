import { BaseError } from './BaseError.js';

/**
 * Inspection-specific error classes
 */
export class InspectionError extends BaseError {
    constructor(message: string, code: string, details?: unknown) {
        super(message, `INSPECTION_${code}`, details);
    }
}

export class InspectionTimeoutError extends InspectionError {
    constructor(timeout: number, details?: unknown) {
        const errorDetails = details && typeof details === 'object' ? { timeout, ...details } : { timeout, details };
        super(`Inspection timed out after ${timeout}ms`, 'TIMEOUT', errorDetails);
    }
}
