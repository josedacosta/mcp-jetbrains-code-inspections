import * as os from 'os';
import * as path from 'path';

/**
 * Resolves and expands IDE paths across different platforms
 */
export class IDEPathResolver {
    private readonly platform: NodeJS.Platform;

    constructor() {
        this.platform = os.platform();
    }

    /**
     * Expand path variables like ~ and environment variables
     */
    expandPath(filePath: string): string {
        if (!filePath) {
            return '';
        }

        let expanded = filePath.trim();

        if (!expanded) {
            return '';
        }

        switch (this.platform) {
            case 'win32':
                expanded = this.expandWindowsPath(expanded);
                break;
            case 'darwin':
            case 'linux':
            case 'freebsd':
            case 'openbsd':
            case 'sunos':
            case 'aix':
                expanded = this.expandUnixPath(expanded);
                break;
            default:
                // For unknown platforms, try Unix-style expansion
                expanded = this.expandUnixPath(expanded);
                break;
        }

        // Normalize the path to handle parent and current directory segments
        return path.normalize(expanded);
    }

    private expandWindowsPath(filePath: string): string {
        let expanded = filePath;

        // Replace Windows environment variables
        const replacements: Array<[RegExp, string]> = [
            [/%LOCALAPPDATA%/gi, process.env.LOCALAPPDATA || ''],
            [/%APPDATA%/gi, process.env.APPDATA || ''],
            [/%USERPROFILE%/gi, process.env.USERPROFILE || os.homedir()],
            [/%HOMEPATH%/gi, process.env.HOMEPATH || os.homedir()],
            [/%HOMEDRIVE%/gi, process.env.HOMEDRIVE || 'C:'],
            [/%PROGRAMDATA%/gi, process.env.PROGRAMDATA || 'C:\\ProgramData'],
            [/%PROGRAMFILES%/gi, process.env.PROGRAMFILES || 'C:\\Program Files'],
            [/%PROGRAMFILES\(X86\)%/gi, process.env['PROGRAMFILES(X86)'] || 'C:\\Program Files (x86)'],
            [/%SYSTEMROOT%/gi, process.env.SYSTEMROOT || 'C:\\Windows'],
            [/%TEMP%/gi, process.env.TEMP || process.env.TMP || os.tmpdir()],
            [/%TMP%/gi, process.env.TMP || process.env.TEMP || os.tmpdir()],
        ];

        for (const [pattern, replacement] of replacements) {
            expanded = expanded.replace(pattern, replacement);
        }

        // Handle generic environment variables in format %VAR%
        expanded = expanded.replace(/%([^%]+)%/g, (match, varName) => {
            return process.env[varName] || match;
        });

        return expanded;
    }

    private expandUnixPath(filePath: string): string {
        let expanded = filePath;

        // Expand home directory shortcuts
        if (expanded.startsWith('~/')) {
            expanded = path.join(os.homedir(), expanded.slice(2));
        } else if (expanded === '~') {
            expanded = os.homedir();
        } else if (expanded.startsWith('~')) {
            // Handle ~username format (though we can't easily resolve other users' homes)
            const match = /^~([^/]+)(.*)$/.exec(expanded);
            if (match && match[1] === process.env.USER) {
                expanded = os.homedir() + (match[2] || '');
            }
        }

        // Common environment variable replacements
        const commonVars: Array<[RegExp, string]> = [
            [/\$HOME\b/g, os.homedir()],
            [/\$USER\b/g, process.env.USER || ''],
            [/\$TMPDIR\b/g, process.env.TMPDIR || os.tmpdir()],
            [/\$PWD\b/g, process.cwd()],
        ];

        for (const [pattern, replacement] of commonVars) {
            expanded = expanded.replace(pattern, replacement);
        }

        // Expand other environment variables in format $VAR or ${VAR}
        expanded = expanded.replace(/\$\{([^}]+)}/g, (match, varName) => {
            return process.env[varName] || match;
        });

        expanded = expanded.replace(/\$(\w+)/g, (match, varName) => {
            // Don't replace if it's followed by more word characters (e.g., $VARiable)
            return process.env[varName] || match;
        });

        return expanded;
    }
}
