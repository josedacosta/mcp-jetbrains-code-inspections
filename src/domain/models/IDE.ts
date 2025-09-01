/**
 * Domain models for IDE-related entities
 */
export enum IDEType {
    INTELLIJ_IDEA = 'IntelliJ IDEA',
    WEBSTORM = 'WebStorm',
    PYCHARM = 'PyCharm',
    PHPSTORM = 'PhpStorm',
    GOLAND = 'GoLand',
    RIDER = 'Rider',
    CLION = 'CLion',
    RUBYMINE = 'RubyMine',
    DATAGRIP = 'DataGrip',
    DATASPELL = 'DataSpell',
    APPCODE = 'AppCode',
    ANDROID_STUDIO = 'Android Studio',
    RUSTROVER = 'RustRover',
    AQUA = 'Aqua',
    WRITERSIDE = 'Writerside',
}

export interface IDE {
    type: IDEType;
    name: string;
    path: string;
    version?: string;
    isRunning?: boolean;
}

export interface IDEPathConfig {
    darwin: string[];
    linux: string[];
    win32: string[];
}

export interface IDECapabilities {
    supportedLanguages: string[];
    supportedFileExtensions: string[];
    priority: number;
}

export const IDE_CAPABILITIES: Record<IDEType, IDECapabilities> = {
    [IDEType.INTELLIJ_IDEA]: {
        supportedLanguages: ['java', 'kotlin', 'scala', 'groovy', 'xml', 'json', 'yaml'],
        supportedFileExtensions: ['.java', '.kt', '.kts', '.scala', '.groovy', '.gradle'],
        priority: 10,
    },
    [IDEType.WEBSTORM]: {
        supportedLanguages: ['javascript', 'typescript', 'html', 'css', 'json'],
        supportedFileExtensions: ['.js', '.jsx', '.ts', '.tsx', '.vue', '.html', '.css'],
        priority: 9,
    },
    [IDEType.PYCHARM]: {
        supportedLanguages: ['python'],
        supportedFileExtensions: ['.py', '.pyi', '.pyx'],
        priority: 8,
    },
    [IDEType.PHPSTORM]: {
        supportedLanguages: ['php', 'html', 'javascript', 'css'],
        supportedFileExtensions: ['.php', '.phtml', '.blade.php'],
        priority: 7,
    },
    [IDEType.GOLAND]: {
        supportedLanguages: ['go'],
        supportedFileExtensions: ['.go', '.mod'],
        priority: 7,
    },
    [IDEType.RIDER]: {
        supportedLanguages: ['csharp', 'fsharp', 'vb'],
        supportedFileExtensions: ['.cs', '.fs', '.vb', '.csproj', '.sln'],
        priority: 7,
    },
    [IDEType.CLION]: {
        supportedLanguages: ['c', 'cpp', 'rust'],
        supportedFileExtensions: ['.c', '.cpp', '.cc', '.h', '.hpp', '.rs'],
        priority: 6,
    },
    [IDEType.RUBYMINE]: {
        supportedLanguages: ['ruby'],
        supportedFileExtensions: ['.rb', '.erb', '.rake', '.gemspec'],
        priority: 6,
    },
    [IDEType.DATAGRIP]: {
        supportedLanguages: ['sql'],
        supportedFileExtensions: ['.sql'],
        priority: 5,
    },
    [IDEType.DATASPELL]: {
        supportedLanguages: ['python', 'jupyter'],
        supportedFileExtensions: ['.py', '.ipynb'],
        priority: 5,
    },
    [IDEType.APPCODE]: {
        supportedLanguages: ['swift', 'objc'],
        supportedFileExtensions: ['.swift', '.m', '.mm'],
        priority: 5,
    },
    [IDEType.ANDROID_STUDIO]: {
        supportedLanguages: ['java', 'kotlin', 'xml'],
        supportedFileExtensions: ['.java', '.kt', '.xml'],
        priority: 6,
    },
    [IDEType.RUSTROVER]: {
        supportedLanguages: ['rust'],
        supportedFileExtensions: ['.rs', '.toml'],
        priority: 5,
    },
    [IDEType.AQUA]: {
        supportedLanguages: ['java', 'kotlin'],
        supportedFileExtensions: ['.java', '.kt'],
        priority: 4,
    },
    [IDEType.WRITERSIDE]: {
        supportedLanguages: ['markdown', 'xml'],
        supportedFileExtensions: ['.md', '.xml'],
        priority: 3,
    },
};
