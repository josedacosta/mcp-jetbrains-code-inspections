// Minimal Docusaurus configuration - CommonJS to avoid ESM issues
const config = {
    title: 'MCP JetBrains Code Inspections',
    tagline: 'Run JetBrains IDE code inspections via MCP',
    favicon: 'img/logo.svg',

    url: 'https://josedacosta.github.io',
    baseUrl: '/mcp-jetbrains-code-inspections/',

    organizationName: 'josedacosta',
    projectName: 'mcp-jetbrains-code-inspections',

    onBrokenLinks: 'warn',
    onBrokenMarkdownLinks: 'warn',

    i18n: {
        defaultLocale: 'en',
        locales: ['en'],
    },

    presets: [
        [
            'classic',
            {
                docs: {
                    sidebarPath: './docusaurus.sidebars.js',
                    routeBasePath: '/',
                },
                blog: false,
                theme: {
                    customCss: './src/css/custom.css',
                },
            },
        ],
    ],

    themeConfig: {
        // Color mode configuration
        colorMode: {
            defaultMode: 'light', // Default to light if system preference not detected
            disableSwitch: false, // Keep the switch enabled
            respectPrefersColorScheme: true, // Respect system preference
        },
        navbar: {
            title: 'MCP JetBrains Code Inspections',
            logo: {
                alt: 'MCP JetBrains Inspections Logo',
                src: 'img/logo.svg',
            },
            items: [
                {
                    href: 'https://github.com/josedacosta/mcp-jetbrains-code-inspections',
                    label: 'GitHub',
                    position: 'right',
                },
            ],
        },
        footer: {
            style: 'dark',
            copyright: `Copyright © ${new Date().getFullYear()} MCP JetBrains Code Inspections.`,
        },
    },
};

module.exports = config;
