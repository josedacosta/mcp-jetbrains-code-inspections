// @ts-check

/** @type {import('@docusaurus/plugin-content-docs').SidebarsConfig} */
const sidebars = {
    docsSidebar: [
        'index',
        {
            type: 'category',
            label: 'Getting Started',
            items: ['getting-started/index', 'getting-started/prerequisites', 'getting-started/installation', 'getting-started/quick-start'],
        },
        {
            type: 'category',
            label: 'Usage',
            items: ['usage/index', 'usage/basic-usage', 'usage/advanced-usage', 'usage/api-reference'],
        },
        {
            type: 'category',
            label: 'Configuration',
            items: ['configuration/index', 'configuration/mcp-setup', 'configuration/environment-variables', 'configuration/inspection-profiles'],
        },
        {
            type: 'category',
            label: 'Guides',
            items: ['guides/index', 'guides/multi-ide-usage', 'guides/testing', 'guides/troubleshooting', 'guides/best-practices'],
        },
        {
            type: 'category',
            label: 'Technical Details',
            items: [
                'technical/index',
                'technical/architecture',
                'technical/ide-detection',
                'technical/inspection-engine',
                'technical/shared-inspection-engine',
                'technical/ide-inspection-equivalence',
                'technical/inspection-consistency',
            ],
        },
        {
            type: 'category',
            label: 'Reference',
            items: ['reference/index', 'reference/changelog', 'reference/contributing', 'reference/jetbrains-resources'],
        },
        {
            type: 'category',
            label: '⚠️ Deprecated Notice',
            items: ['deprecated/index', 'deprecated/jetbrains-native-mcp'],
        },
    ],
};

module.exports = sidebars;
