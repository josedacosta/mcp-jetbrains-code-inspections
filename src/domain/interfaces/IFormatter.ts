import { InspectionResult } from '../models/InspectionResult.js';

/**
 * Interface for result formatters
 */
export interface IFormatter {
    /**
     * Format inspection results
     */
    format(result: InspectionResult): string;
}
