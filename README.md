<div align="center">
  <img src="static/img/logo.svg" alt="MCP JetBrains Code Inspections" width="120" height="120">
</div>

# MCP JetBrains Code Inspections

[![License: OSL-3.0](https://img.shields.io/badge/License-OSL--3.0-yellow.svg)](https://opensource.org/licenses/OSL-3.0)
[![Node.js](https://img.shields.io/badge/Node.js-%3E%3D20-brightgreen)](https://nodejs.org)
[![TypeScript](https://img.shields.io/badge/TypeScript-%5E5.0-blue)](https://www.typescriptlang.org/)
[![Documentation](https://img.shields.io/badge/docs-available-brightgreen)](https://josedacosta.github.io/mcp-jetbrains-code-inspections/)
[![MCP SDK](https://img.shields.io/badge/MCP-SDK-green)](https://github.com/modelcontextprotocol/sdk)
[![JetBrains](https://img.shields.io/badge/JetBrains-Compatible-orange)](https://www.jetbrains.com)
[![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen.svg)](https://makeapullrequest.com)

A Model Context Protocol (MCP) server that provides JetBrains IDE code inspections with automatic IDE selection and a unified inspection profile that
works across all file types.

## Features

- 🔍 Automatic JetBrains IDE detection and selection
- ⚡ Configurable timeout (default: 120 seconds)
- 🔄 Cross-IDE compatibility (WebStorm, IntelliJ IDEA, PyCharm, etc.)
- 📊 Markdown output format optimized for LLMs (JSON optional)
- 🎯 Runs inspections even when IDE is already open (isolated configuration)
- 🌐 Unified inspection profile supporting all languages

## Installation

1. Install dependencies:

```bash
yarn install
```

2. Build the server:

```bash
yarn build
```

3. Configure MCP (see [Configuration](#configuration) section below)

## Usage

### Running the Server

```bash
# Run in development mode
yarn dev

# Run the built server
yarn start

# Use MCP Inspector for interactive testing
yarn inspect
```

### Configuration

The code inspections server can be configured through environment variables in `.mcp.json`:

```json
{
    "mcpServers": {
        "mcp-jetbrains-code-inspections": {
            "command": "node",
            "args": ["./dist/index.js"],
            "env": {
                "EXCLUDE_INSPECTIONS": "SpellCheckingInspection"
            }
        }
    }
}
```

### Available Parameters

#### Tool Parameter (Required)

The tool accepts only one parameter from the LLM:

| Parameter | Type   | Description                       | Required |
| --------- | ------ | --------------------------------- | -------- |
| `path`    | string | File or directory path to inspect | Yes      |

#### Configuration via Environment Variables

All other configurations are managed through environment variables in `.mcp.json`:

| Environment Variable  | Type               | Description                                               | Default                 |
| --------------------- | ------------------ | --------------------------------------------------------- | ----------------------- |
| `FORCE_INSPECT_PATH`  | string             | Force specific IDE inspect tool (disables auto-detection) | Auto-detected           |
| `FORCE_PROJECT_ROOT`  | string             | Force project root directory (disables auto-detection)    | Auto-detected           |
| `FORCE_PROFILE_PATH`  | string             | Force inspection profile path (disables defaults)         | Project defaults        |
| `INSPECTION_TIMEOUT`  | number             | Maximum analysis time (ms)                                | 120000                  |
| `EXCLUDE_INSPECTIONS` | string             | Comma-separated inspection codes to exclude               | SpellCheckingInspection |
| `ONLY_INSPECTIONS`    | string             | Only include these inspection codes                       | -                       |
| `RESPONSE_FORMAT`     | 'markdown'\|'json' | Output format for diagnostics                             | 'markdown'              |
| `DEBUG`               | boolean            | Enable debug logging                                      | false                   |

For detailed configuration options, see [Configuration Documentation](docs/configuration/).

## Testing

### 1. Interactive MCP Test

```bash
yarn test:mcp
```

This runs an interactive test that allows you to test the MCP server functionality directly.

### 2. Test with MCP Inspector (recommended)

```bash
# Launch the inspector (no installation needed)
yarn inspect

# Or for development mode with hot reload
yarn inspect:dev
```

The inspector opens a web interface where you can:

- View available tools
- Test get_jetbrains_code_inspections tool interactively
- See requests/responses in real-time

## How It Works

### Automatic IDE Selection

The server automatically finds and uses the first available JetBrains IDE in this priority order:

1. IntelliJ IDEA
2. WebStorm
3. PyCharm
4. PhpStorm
5. GoLand
6. Rider
7. CLion
8. RubyMine
9. DataGrip
10. DataSpell
11. AppCode

### Isolated Configuration

The server uses temporary isolated configuration directories with `-Didea.config.path` and `-Didea.system.path` JVM properties, allowing inspections
to run even when the IDE is already open. This eliminates the historical restriction where only one IDE instance could run at a time.

### Example Output

```
🔍 Searching for available JetBrains IDE inspect tools...
   Following priority order: IntelliJ IDEA > WebStorm > PyCharm > PhpStorm > GoLand > ...

   ✅ WebStorm - Found and selected!
      Path: /Applications/WebStorm.app/Contents/bin/inspect.sh
      Note: Using isolated configuration - works even if IDE is already running
```

## Troubleshooting

### "JetBrains IDE inspect tool not found"

- Verify that a JetBrains IDE is installed in `/Applications/` or `~/Applications/`
- Ensure the `inspect.sh` file is executable

### "No inspection profile found"

- Open the project in a JetBrains IDE
- Go to Settings > Inspections
- Configure and save an inspection profile

### Timeout

- Increase the timeout in test scripts
- Check that the IDE is not currently indexing

### "Only one instance can be run at a time"

The server automatically handles this by using isolated configuration directories, allowing inspections to run even when the IDE is already open.

## Documentation

Visit our comprehensive documentation
at [https://josedacosta.github.io/mcp-jetbrains-code-inspections/](https://josedacosta.github.io/mcp-jetbrains-code-inspections/)

- **Getting Started** - Installation and prerequisites
- **Configuration** - Environment variables and profiles
- **Usage Guide** - Basic and advanced usage
- **Technical Details** - Architecture and IDE detection
- **Guides** - Best practices and troubleshooting

## JetBrains Documentation

For more information about JetBrains code inspections and the command-line inspector:

- [Code Inspection Overview](https://www.jetbrains.com/help/webstorm/code-inspection.html) - Learn about code inspections, severity levels, and
  inspection profiles
- [Command-Line Code Inspector](https://www.jetbrains.com/help/webstorm/command-line-code-inspector.html) - Detailed documentation on using the
  inspect.sh/inspect.bat tool

## Contributing

We welcome contributions! Please see our [Contributing Guide](CONTRIBUTING.md) for details on:

- Development setup
- Code style guidelines
- Submitting pull requests
- Reporting issues

### Quick Start for Contributors

1. Fork and clone the repository
2. Create a feature branch: `git checkout -b feat/amazing-feature`
3. Commit your changes: `git commit -m 'feat(scope): add amazing feature'`
4. Push to your branch: `git push origin feat/amazing-feature`
5. Open a Pull Request

We follow [Conventional Commits](https://www.conventionalcommits.org/) and use GitHub Flow. See [CONTRIBUTING.md](CONTRIBUTING.md) for full details.

## Keywords

MCP server, Model Context Protocol, Claude Code integration, MCP JetBrains, Claude AI code inspection, MCP tools, Claude Code extensions, MCP
inspector, JetBrains code inspection, WebStorm MCP, IntelliJ IDEA MCP integration, PyCharm MCP server, MCP SDK, Claude.ai code analysis, MCP protocol
implementation, Claude Code plugins, Anthropic MCP, MCP server development, Claude Code automation, MCP configuration, WebStorm inspection, IntelliJ
IDEA code analysis, PyCharm linting, JetBrains IDE inspector, TypeScript linter MCP, JavaScript static analysis MCP, ESLint MCP integration, code
review automation, PhpStorm code inspection, GoLand analysis, Rider code quality, CLion inspection, RubyMine linter, DataGrip SQL analysis, Android
Studio inspection, RustRover analysis, JetBrains command line inspector, inspect.sh, LLM code analysis, AI code review, automated code inspection,
JetBrains unified profile, IDE code diagnostics, static code analysis, inspection severity levels, inspection profiles, Node.js MCP server, MCP
environment variables, code problems detection, JetBrains problems view, IDE problem analysis, code problem finder, inspection problems report
