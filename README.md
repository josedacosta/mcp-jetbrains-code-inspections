<div align="center">
  <img src="static/img/logo.svg" alt="MCP JetBrains Code Inspections" width="120" height="120">
</div>

# 🔍 MCP JetBrains Code Inspections

[![License: OSL-3.0](https://img.shields.io/badge/License-OSL--3.0-yellow.svg)](https://opensource.org/licenses/OSL-3.0)
[![Node.js](https://img.shields.io/badge/Node.js-%3E%3D20-brightgreen)](https://nodejs.org)
[![TypeScript](https://img.shields.io/badge/TypeScript-%5E5.0-blue)](https://www.typescriptlang.org/)
[![Documentation](https://img.shields.io/badge/docs-available-brightgreen)](https://josedacosta.github.io/mcp-jetbrains-code-inspections/)
[![MCP SDK](https://img.shields.io/badge/MCP-SDK-green)](https://github.com/modelcontextprotocol/sdk)
[![JetBrains](https://img.shields.io/badge/JetBrains-Compatible-orange)](https://www.jetbrains.com)
[![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen.svg)](https://makeapullrequest.com)

> [!CAUTION]
>
> ## ⚠️ Deprecated Notice
>
> [![Status: Deprecated](https://img.shields.io/badge/Status-Deprecated-red.svg)](https://github.com/josedacosta/mcp-jetbrains-code-inspections#deprecated-notice)
>
> **This project is deprecated but still functional.** Starting from version 2025.2, JetBrains IDEs (WebStorm, IntelliJ IDEA, PyCharm, etc.) now include a built-in MCP server that provides native integration with external clients like Claude Desktop, Cursor, VS Code, and others.
>
> ### 🔄 Migration Options
>
> | IDE Version          | Recommended Solution | Link                                                                              |
> | -------------------- | -------------------- | --------------------------------------------------------------------------------- |
> | **2025.2+**          | Built-in MCP server  | [Official Documentation](https://www.jetbrains.com/help/webstorm/mcp-server.html) |
> | **Earlier versions** | JetBrains MCP plugin | [Plugin Marketplace](https://plugins.jetbrains.com/plugin/26071-mcp-server)       |
>
> ### ✅ Native Integration Benefits
>
> - **Direct IDE control** without external tools
> - **25+ tools** comprehensive tool set
> - **Better performance** and reliability
> - **Official support** from JetBrains
>
> > [!IMPORTANT]
> > The native `get_file_problems` tool requires setting `errorsOnly: false` for similar functionality to this project. The `get_project_problems` tool only returns critical errors.
>
> 📚 **[View Migration Guide & Comparison →](https://josedacosta.github.io/mcp-jetbrains-code-inspections/deprecated/jetbrains-native-mcp)**

A **Model Context Protocol (MCP)** server that provides JetBrains IDE code inspections with automatic IDE selection and a unified inspection profile that works across all file types.

> [!TIP]
> 📚 **Full Documentation Available**: Visit our comprehensive docs at [josedacosta.github.io/mcp-jetbrains-code-inspections](https://josedacosta.github.io/mcp-jetbrains-code-inspections/)

## 🎯 Quick Start

> [!NOTE]
> Get started in under 2 minutes!

```bash
# Clone the repository
git clone https://github.com/josedacosta/mcp-jetbrains-code-inspections.git
cd mcp-jetbrains-code-inspections

# Install and build
yarn install && yarn build

# Test with MCP Inspector
yarn inspect
```

Then configure your MCP client (Claude Desktop, Cursor, etc.) with the [configuration below](#️-configuration).

## ✨ Features

<table>
<tr>
<td width="50%">

### 🚀 Core Features

- 🔍 **Automatic IDE Detection**
  <br>Intelligently selects the best JetBrains IDE
- ⚡ **Configurable Timeout**
  <br>Default 120s, adjustable for large projects
- 🔄 **Cross-IDE Compatible**
  <br>Works with all JetBrains IDEs

</td>
<td width="50%">

### 🔧 Advanced Capabilities

- 📊 **Smart Output Formats**
  <br>Markdown for LLMs, JSON for tools
- 🎯 **Concurrent Execution**
  <br>Run even when IDE is open
- 🌐 **Universal Profiles**
  <br>One profile for all languages
- 💬 **Built-in Prompts**
  <br>Pre-configured prompts for common tasks
- 📚 **Server Resources**
  <br>Access profiles, config, and IDE info

</td>
</tr>
</table>

## 📦 Installation

> [!NOTE]
> **Prerequisites**: Node.js ≥20 and a JetBrains IDE installed

### Step-by-step Installation

1. **Install dependencies**:

    ```bash
    yarn install
    ```

2. **Build the server**:

    ```bash
    yarn build
    ```

3. **Configure MCP** (see [⚙️ Configuration](#️-configuration) section below)

> [!TIP]
> Use `yarn inspect` after installation to test the server with the MCP Inspector

## 🚀 Usage

### 📚 MCP Features

The server provides three types of MCP features:

#### 🔨 Tools

- **get_jetbrains_code_inspections**: Runs code inspections on specified files or directories

#### 💬 Prompts

- **analyze-project**: Analyze a project for code quality issues
- **check-file**: Check a specific file for issues
- **fix-issues**: Get suggestions to fix detected issues

#### 📚 Resources

- **inspection://profiles**: List of available inspection profiles
- **inspection://config**: Current MCP server configuration
- **inspection://ides**: List of detected JetBrains IDEs on the system

### 🏃 Running the Server

> [!TIP]
> For development, use `yarn dev` which includes hot-reload for faster iteration.

```bash
# 🔄 Run in development mode (with hot-reload)
yarn dev

# 📦 Run the built server (production)
yarn start

# 🧪 Use MCP Inspector for interactive testing
yarn inspect
```

### ⚙️ Configuration

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

### 📝 Available Parameters

#### 🔧 Tool Parameter (Required)

> [!IMPORTANT]
> The tool accepts only one parameter from the LLM:

| Parameter | Type     | Description                       | Required | Example                       |
| --------- | -------- | --------------------------------- | -------- | ----------------------------- |
| `path`    | `string` | File or directory path to inspect | ✅ Yes   | `"src/index.ts"` or `"./src"` |

#### 🌍 Configuration via Environment Variables

> [!NOTE]
> All configurations are managed through environment variables in `.mcp.json`. These settings control how the inspection server operates.

<details>
<summary><b>📑 Available Environment Variables</b> (click to expand)</summary>

| Environment Variable  | Type                 | Description                                               | Default                   |
| --------------------- | -------------------- | --------------------------------------------------------- | ------------------------- |
| `FORCE_INSPECT_PATH`  | `string`             | Force specific IDE inspect tool (disables auto-detection) | Auto-detected             |
| `FORCE_PROJECT_ROOT`  | `string`             | Force project root directory (disables auto-detection)    | Auto-detected             |
| `FORCE_PROFILE_PATH`  | `string`             | Force inspection profile path (disables defaults)         | Project defaults          |
| `INSPECTION_TIMEOUT`  | `number`             | Maximum analysis time (ms)                                | `120000`                  |
| `EXCLUDE_INSPECTIONS` | `string`             | Comma-separated inspection codes to exclude               | `SpellCheckingInspection` |
| `ONLY_INSPECTIONS`    | `string`             | Only include these inspection codes                       | -                         |
| `RESPONSE_FORMAT`     | `'markdown'\|'json'` | Output format for diagnostics                             | `'markdown'`              |
| `DEBUG`               | `boolean`            | Enable debug logging                                      | `false`                   |

</details>

> [!TIP]
> 📚 For detailed configuration options, see [Configuration Documentation](docs/configuration/).

## 🧪 Testing

### 1️⃣ Interactive MCP Test

```bash
yarn test:mcp
```

This runs an interactive test that allows you to test the MCP server functionality directly.

### 2️⃣ Test with MCP Inspector (recommended)

```bash
# Launch the inspector (no installation needed)
yarn inspect

# Or for development mode with hot reload
yarn inspect:dev
```

The inspector opens a web interface where you can:

- View available tools, prompts, and resources
- Test get_jetbrains_code_inspections tool interactively
- Use pre-configured prompts for common tasks
- Access server resources (profiles, config, detected IDEs)
- See requests/responses in real-time

## ⚙️ How It Works

### 🎯 Automatic IDE Selection

> [!NOTE]
> The server intelligently detects and selects the most appropriate JetBrains IDE for your project.

**Priority order:**

1. **IntelliJ IDEA** - Ultimate Java/Kotlin IDE
2. **WebStorm** - JavaScript/TypeScript specialist
3. **PyCharm** - Python development
4. **PhpStorm** - PHP development
5. **GoLand** - Go programming
6. **Rider** - .NET development
7. **CLion** - C/C++ development
8. **RubyMine** - Ruby/Rails
9. **DataGrip** - Database management
10. **DataSpell** - Data science
11. **AppCode** - iOS/macOS development

> [!TIP]
> Use `FORCE_INSPECT_PATH` to override auto-detection and specify a particular IDE.

### 🔒 Isolated Configuration

> [!IMPORTANT]
> **Key Innovation**: The server uses temporary isolated configuration directories with `-Didea.config.path` and `-Didea.system.path` JVM properties. This allows inspections to run even when the IDE is already open!

**Benefits:**

- ✅ No IDE conflicts
- ✅ Parallel execution support
- ✅ Clean, isolated analysis
- ✅ No interference with your active IDE sessions

### 💻 Example Output

<details>
<summary><b>🔎 View Example Output</b> (click to expand)</summary>

```console
🔍 Searching for available JetBrains IDE inspect tools...
   Following priority order: IntelliJ IDEA > WebStorm > PyCharm > PhpStorm > GoLand > ...

   ✅ WebStorm - Found and selected!
      Path: /Applications/WebStorm.app/Contents/bin/inspect.sh
      Note: Using isolated configuration - works even if IDE is already running

📊 Analysis Results:
   ⚠️ Warning: Unused variable 'config' at line 42
   ❌ Error: Missing semicolon at line 156
   💡 Info: Consider using const instead of let at line 78
```

</details>

## 🛠️ Troubleshooting

### ❌ "JetBrains IDE inspect tool not found"

> [!WARNING]
> This error occurs when no JetBrains IDE can be found in standard installation locations.

**Solutions:**

- ✅ Verify that a JetBrains IDE is installed in `/Applications/` or `~/Applications/`
- ✅ Ensure the `inspect.sh` file is executable
- ✅ Use `FORCE_INSPECT_PATH` environment variable to specify the exact path

### ⚠️ "No inspection profile found"

> [!CAUTION]
> Without an inspection profile, the tool cannot analyze your code properly.

**Steps to fix:**

1. Open the project in a JetBrains IDE
2. Go to **Settings** → **Inspections**
3. Configure and save an inspection profile
4. Alternatively, use `FORCE_PROFILE_PATH` to specify a custom profile

### ⏱️ Timeout Issues

> [!TIP]
> Default timeout is 120 seconds. Large projects may need more time.

**Solutions:**

- 🔄 Increase timeout: Set `INSPECTION_TIMEOUT=300000` (5 minutes)
- 📊 Check that the IDE is not currently indexing
- 📦 For very large projects, consider inspecting specific directories

### 🚫 "Only one instance can be run at a time"

> [!NOTE]
> ✅ **This is no longer an issue!** The server automatically handles this by using isolated configuration directories, allowing inspections to run even when the IDE is already open.

## 📚 Documentation

> [!TIP]
> 🌐 Visit our comprehensive documentation at [josedacosta.github.io/mcp-jetbrains-code-inspections](https://josedacosta.github.io/mcp-jetbrains-code-inspections/)

**Available sections:**

| Section                                                                                                 | Description                        |
| ------------------------------------------------------------------------------------------------------- | ---------------------------------- |
| 🏁 **[Getting Started](https://josedacosta.github.io/mcp-jetbrains-code-inspections/getting-started/)** | Installation and prerequisites     |
| ⚙️ **[Configuration](https://josedacosta.github.io/mcp-jetbrains-code-inspections/configuration/)**     | Environment variables and profiles |
| 📖 **[Usage Guide](https://josedacosta.github.io/mcp-jetbrains-code-inspections/usage/)**               | Basic and advanced usage           |
| 🔬 **[Technical Details](https://josedacosta.github.io/mcp-jetbrains-code-inspections/technical/)**     | Architecture and IDE detection     |
| 💡 **[Guides](https://josedacosta.github.io/mcp-jetbrains-code-inspections/guides/)**                   | Best practices and troubleshooting |

## 📖 JetBrains Documentation

> [!TIP]
> Learn more about JetBrains code inspections and the command-line inspector:

| Resource                                                                                                       | Description                                                            |
| -------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------- |
| 📘 **[Code Inspection Overview](https://www.jetbrains.com/help/webstorm/code-inspection.html)**                | Learn about code inspections, severity levels, and inspection profiles |
| 🔧 **[Command-Line Code Inspector](https://www.jetbrains.com/help/webstorm/command-line-code-inspector.html)** | Detailed documentation on using the inspect.sh/inspect.bat tool        |

## 🤝 Contributing

> [!NOTE]
> We welcome contributions! Please see our [Contributing Guide](CONTRIBUTING.md) for full details.

**What we're looking for:**

- 🐛 Bug fixes and issue reports
- ✨ New features and enhancements
- 📝 Documentation improvements
- 🧪 Test coverage expansion
- 🌍 Language/IDE support

### 🚀 Quick Start for Contributors

> [!IMPORTANT]
> We follow [Conventional Commits](https://www.conventionalcommits.org/) and use GitHub Flow.

```bash
# 1. Fork and clone the repository
git clone https://github.com/YOUR-USERNAME/mcp-jetbrains-code-inspections.git

# 2. Create a feature branch
git checkout -b feat/amazing-feature

# 3. Make your changes and commit
git commit -m 'feat(scope): add amazing feature'

# 4. Push to your fork
git push origin feat/amazing-feature

# 5. Open a Pull Request
```

> [!TIP]
> See [CONTRIBUTING.md](CONTRIBUTING.md) for branch naming, commit message standards, and PR guidelines.

## 🏷️ Keywords

<details>
<summary><b>🔍 SEO Keywords</b> (click to expand)</summary>

**MCP & AI Integration:**
`MCP server` • `Model Context Protocol` • `Claude Code integration` • `MCP JetBrains` • `Claude AI code inspection` • `MCP tools` • `Claude Code extensions` • `MCP inspector` • `Anthropic MCP` • `Claude.ai code analysis` • `LLM code analysis` • `AI code review`

**JetBrains IDEs:**
`JetBrains code inspection` • `WebStorm MCP` • `IntelliJ IDEA MCP integration` • `PyCharm MCP server` • `PhpStorm code inspection` • `GoLand analysis` • `Rider code quality` • `CLion inspection` • `RubyMine linter` • `DataGrip SQL analysis` • `Android Studio inspection` • `RustRover analysis`

**Technical Terms:**
`JetBrains command line inspector` • `inspect.sh` • `automated code inspection` • `JetBrains unified profile` • `IDE code diagnostics` • `static code analysis` • `inspection severity levels` • `inspection profiles` • `Node.js MCP server` • `MCP environment variables` • `code problems detection`

</details>

---

<div align="center">

**Made with ❤️ by the Runtima Team**

[![Star on GitHub](https://img.shields.io/github/stars/josedacosta/mcp-jetbrains-code-inspections.svg?style=social)](https://github.com/josedacosta/mcp-jetbrains-code-inspections)
[![Follow on GitHub](https://img.shields.io/github/followers/josedacosta.svg?style=social&label=Follow)](https://github.com/josedacosta)

</div>
