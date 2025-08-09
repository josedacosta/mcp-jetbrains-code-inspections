import { BaseError } from './BaseError.js';

/**
 * IDE-specific error classes
 */
export class IDEError extends BaseError {
    constructor(message: string, code: string, details?: unknown) {
        super(message, `IDE_${code}`, details);
    }
}

export class IDENotFoundError extends IDEError {
    constructor(message: string = 'No JetBrains IDE found', details?: unknown) {
        super(message, 'NOT_FOUND', details);
    }
}

export class IDEExecutionError extends IDEError {
    constructor(message: string, exitCode?: number | null) {
        super(message, 'EXECUTION_ERROR', { exitCode });
    }
}
