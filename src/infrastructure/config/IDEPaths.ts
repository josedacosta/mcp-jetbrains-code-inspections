import { IDEPathConfig } from '../../domain/models/IDE.js';

/**
 * Get IDE paths configuration for all platforms
 */
export function getIDEPaths(): IDEPathConfig {
    return {
        darwin: getDarwinPaths(),
        linux: getLinuxPaths(),
        win32: getWindowsPaths(),
    };
}

function getDarwinPaths(): string[] {
    const ideNames = [
        'IntelliJ IDEA',
        'IntelliJ IDEA CE',
        'WebStorm',
        'PyCharm',
        'PyCharm CE',
        'Android Studio',
        'PhpStorm',
        'GoLand',
        'DataGrip',
        'Rider',
        'CLion',
        'RubyMine',
        'DataSpell',
        'RustRover',
        'AppCode',
        'Aqua',
        'Writerside',
    ];

    const paths: string[] = [];

    // User Applications
    for (const ide of ideNames) {
        paths.push(`~/Applications/${ide}.app/Contents/bin/inspect.sh`);
    }

    // System Applications
    for (const ide of ideNames) {
        paths.push(`/Applications/${ide}.app/Contents/bin/inspect.sh`);
    }

    // JetBrains Toolbox patterns
    const toolboxPatterns = [
        '~/Library/Application Support/JetBrains/Toolbox/apps/IDEA-U/ch-0/*/IntelliJ IDEA.app/Contents/bin/inspect.sh',
        '~/Library/Application Support/JetBrains/Toolbox/apps/IDEA-C/ch-0/*/IntelliJ IDEA CE.app/Contents/bin/inspect.sh',
        '~/Library/Application Support/JetBrains/Toolbox/apps/WebStorm/ch-0/*/WebStorm.app/Contents/bin/inspect.sh',
        '~/Library/Application Support/JetBrains/Toolbox/apps/PyCharm-P/ch-0/*/PyCharm.app/Contents/bin/inspect.sh',
        '~/Library/Application Support/JetBrains/Toolbox/apps/PyCharm-C/ch-0/*/PyCharm CE.app/Contents/bin/inspect.sh',
        '~/Library/Application Support/JetBrains/Toolbox/apps/AndroidStudio/ch-0/*/Android Studio.app/Contents/bin/inspect.sh',
        '~/Library/Application Support/JetBrains/Toolbox/apps/PhpStorm/ch-0/*/PhpStorm.app/Contents/bin/inspect.sh',
        '~/Library/Application Support/JetBrains/Toolbox/apps/Goland/ch-0/*/GoLand.app/Contents/bin/inspect.sh',
        '~/Library/Application Support/JetBrains/Toolbox/apps/datagrip/ch-0/*/DataGrip.app/Contents/bin/inspect.sh',
        '~/Library/Application Support/JetBrains/Toolbox/apps/Rider/ch-0/*/Rider.app/Contents/bin/inspect.sh',
        '~/Library/Application Support/JetBrains/Toolbox/apps/CLion/ch-0/*/CLion.app/Contents/bin/inspect.sh',
        '~/Library/Application Support/JetBrains/Toolbox/apps/RubyMine/ch-0/*/RubyMine.app/Contents/bin/inspect.sh',
        '~/Library/Application Support/JetBrains/Toolbox/apps/DataSpell/ch-0/*/DataSpell.app/Contents/bin/inspect.sh',
        '~/Library/Application Support/JetBrains/Toolbox/apps/RustRover/ch-0/*/RustRover.app/Contents/bin/inspect.sh',
        '~/Library/Application Support/JetBrains/Toolbox/apps/AppCode/ch-0/*/AppCode.app/Contents/bin/inspect.sh',
        '~/Library/Application Support/JetBrains/Toolbox/apps/Aqua/ch-0/*/Aqua.app/Contents/bin/inspect.sh',
        '~/Library/Application Support/JetBrains/Toolbox/apps/Writerside/ch-0/*/Writerside.app/Contents/bin/inspect.sh',
    ];

    paths.push(...toolboxPatterns);
    return paths;
}

function getLinuxPaths(): string[] {
    const paths: string[] = [];

    // JetBrains Toolbox
    const toolboxApps = [
        'IDEA-U',
        'IDEA-C',
        'WebStorm',
        'PyCharm-P',
        'PyCharm-C',
        'AndroidStudio',
        'PhpStorm',
        'Goland',
        'datagrip',
        'Rider',
        'CLion',
        'RubyMine',
        'DataSpell',
        'RustRover',
        'Aqua',
        'Writerside',
    ];

    for (const app of toolboxApps) {
        paths.push(`~/.local/share/JetBrains/Toolbox/apps/${app}/ch-0/*/bin/inspect.sh`);
    }

    // Snap packages
    const snapPackages = [
        'intellij-idea-ultimate',
        'intellij-idea-community',
        'webstorm',
        'pycharm-professional',
        'pycharm-community',
        'android-studio',
        'phpstorm',
        'goland',
        'datagrip',
        'rider',
        'clion',
        'rubymine',
        'dataspell',
        'rustrover',
    ];

    for (const pkg of snapPackages) {
        paths.push(`/snap/${pkg}/current/bin/inspect.sh`);
    }

    // Standard installation locations
    const standardLocations = ['/opt', '/usr/local/bin', '~/bin'];
    const ideNames = [
        'idea',
        'idea-ce',
        'webstorm',
        'pycharm',
        'pycharm-ce',
        'android-studio',
        'phpstorm',
        'goland',
        'datagrip',
        'rider',
        'clion',
        'rubymine',
        'dataspell',
        'rustrover',
        'aqua',
        'writerside',
    ];

    for (const location of standardLocations) {
        for (const ide of ideNames) {
            paths.push(`${location}/${ide}/bin/inspect.sh`);
        }
    }

    // Flatpak installations
    const flatpakApps = [
        'com.jetbrains.IntelliJ-IDEA-Ultimate',
        'com.jetbrains.IntelliJ-IDEA-Community',
        'com.jetbrains.WebStorm',
        'com.jetbrains.PyCharm-Professional',
        'com.jetbrains.PyCharm-Community',
        'com.jetbrains.PhpStorm',
        'com.jetbrains.GoLand',
        'com.jetbrains.DataGrip',
        'com.jetbrains.Rider',
        'com.jetbrains.CLion',
        'com.jetbrains.RubyMine',
        'com.jetbrains.DataSpell',
    ];

    for (const app of flatpakApps) {
        paths.push(`/var/lib/flatpak/app/${app}/current/active/files/bin/inspect.sh`);
    }

    return paths;
}

function getWindowsPaths(): string[] {
    const paths: string[] = [];

    // JetBrains Toolbox
    const toolboxApps = [
        'IDEA-U',
        'IDEA-C',
        'WebStorm',
        'PyCharm-P',
        'PyCharm-C',
        'AndroidStudio',
        'PhpStorm',
        'Goland',
        'datagrip',
        'Rider',
        'CLion',
        'RubyMine',
        'DataSpell',
        'RustRover',
        'Aqua',
        'Writerside',
    ];

    for (const app of toolboxApps) {
        paths.push(`%LOCALAPPDATA%\\JetBrains\\Toolbox\\apps\\${app}\\ch-0\\*\\bin\\inspect.bat`);
        paths.push(`%PROGRAMDATA%\\JetBrains\\Toolbox\\apps\\${app}\\ch-0\\*\\bin\\inspect.bat`);
    }

    // Standard installations
    const ideNames = [
        'IntelliJ IDEA',
        'IntelliJ IDEA Community Edition',
        'WebStorm',
        'PyCharm',
        'PyCharm Community Edition',
        'PhpStorm',
        'GoLand',
        'DataGrip',
        'Rider',
        'CLion',
        'RubyMine',
        'DataSpell',
        'RustRover',
        'Aqua',
        'Writerside',
    ];

    // Program Files
    for (const ide of ideNames) {
        paths.push(`C:\\Program Files\\JetBrains\\${ide}\\bin\\inspect.bat`);
        paths.push(`C:\\Program Files (x86)\\JetBrains\\${ide}\\bin\\inspect.bat`);
    }

    // Android Studio special case
    paths.push('C:\\Program Files\\Android\\Android Studio\\bin\\inspect.bat');
    paths.push('C:\\Program Files (x86)\\Android\\Android Studio\\bin\\inspect.bat');

    // User profile installations
    for (const ide of ideNames) {
        paths.push(`%USERPROFILE%\\JetBrains\\${ide}\\bin\\inspect.bat`);
    }

    return paths;
}
