import { InspectionResult } from '../../domain/models/InspectionResult.js';
import { IFormatter } from '../../domain/interfaces/IFormatter.js';

/**
 * Formats inspection results as JSON
 */
export class JSONFormatter implements IFormatter {
    format(result: InspectionResult): string {
        return JSON.stringify(result, null, 2);
    }
}
