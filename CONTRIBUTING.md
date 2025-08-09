# Contributing to MCP JetBrains Code Inspections

Thank you for your interest in contributing to MCP JetBrains Code Inspections! This document provides guidelines and standards for contributing to
this project.

## 🌍 Language Requirements

**EVERYTHING in this project MUST be in English**: All code, documentation, commit messages, pull requests, issues, and discussions must be written in
English.

## 📋 Prerequisites

Before contributing, ensure you have:

- Node.js 18+ installed
- Yarn package manager
- A JetBrains IDE installed (WebStorm, IntelliJ IDEA, PyCharm, etc.)
- Git configured with your name and email
- Familiarity with TypeScript and MCP (Model Context Protocol)

## 🚀 Getting Started

1. **Fork the repository**

    ```bash
    git clone https://github.com/your-username/mcp-jetbrains-code-inspections.git
    cd mcp-jetbrains-code-inspections
    ```

2. **Install dependencies**

    ```bash
    yarn install
    ```

3. **Run development mode**

    ```bash
    yarn dev
    ```

4. **Run tests**
    ```bash
    yarn test:mcp --path <test-file>
    ```

## 🌳 Branching Strategy: GitHub Flow

We use GitHub Flow for our development process:

1. **Create a feature branch** from `main`

    ```bash
    git checkout -b feat/auth-oauth-support
    ```

2. **Make your changes** and commit regularly

3. **Push to your fork** and create a Pull Request

4. **Wait for review** and CI checks to pass

5. **Merge** when approved (maintainers will squash & merge)

### Branch Naming Convention

Use descriptive branch names following these patterns:

- `feat/<scope>-<description>` - New features
- `fix/<scope>-<description>` - Bug fixes
- `docs/<scope>-<description>` - Documentation updates
- `chore/<scope>-<description>` - Maintenance tasks
- `refactor/<scope>-<description>` - Code refactoring
- `test/<scope>-<description>` - Test improvements

**Examples**:

- `feat/ide-detection-pycharm`
- `fix/timeout-handling`
- `docs/api-usage-examples`

**Rules**:

- Use lowercase letters only
- Separate words with hyphens `-`
- Keep it under 50-72 characters
- Optionally prefix with issue number: `123-fix-memory-leak`

## 📝 Commit Message Convention

We follow [Conventional Commits](https://www.conventionalcommits.org/):

### Format

```
<type>(<scope>): <summary>

[optional body]

[optional footer(s)]
```

### Types

- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation changes
- `style`: Code style changes (formatting, missing semicolons, etc.)
- `refactor`: Code refactoring without changing functionality
- `test`: Adding or modifying tests
- `chore`: Maintenance tasks
- `ci`: CI/CD changes
- `build`: Build system changes
- `perf`: Performance improvements

### Examples

```bash
feat(inspector): add support for PhpStorm inspections

fix(timeout): increase default timeout to 2 minutes (Fixes #42)

docs(readme): add installation instructions for VS Code

feat!: drop support for Node 16

BREAKING CHANGE: Node 18+ is now required
```

### Rules

- Summary: 50 characters max, imperative mood ("add" not "added")
- Body: Wrap at 72 characters, explain why and how
- Footer: Reference issues, note breaking changes

## 🔄 Pull Request Process

### Before Submitting

1. **Ensure your code follows our standards**:

    ```bash
    yarn lint
    yarn build
    yarn test:mcp --path src/index.ts
    ```

2. **Update documentation** if you've added new features

3. **Add tests** for new functionality

4. **Keep PRs small** - ideally under 300 lines changed

### PR Guidelines

- **Title**: Use conventional commit format
- **Description**: Use our PR template and include:
    - Problem being solved
    - Solution approach
    - Testing performed
    - Breaking changes (if any)
- **Link issues**: Use "Fixes #123" or "Closes #123"
- **Screenshots**: Include for UI changes
- **Draft PRs**: Open early for feedback

### Review Process

1. At least one maintainer approval required
2. All CI checks must pass
3. Branch must be up-to-date with `main`
4. Respond to feedback within 48 hours
5. Maintainers will squash & merge

## 🧪 Testing

### Running Tests

```bash
# Test MCP server functionality
yarn test:mcp --path <file-to-inspect>

# Test with MCP Inspector
yarn inspect

# Run TypeScript compiler
yarn build
```

### Writing Tests

- Test files should be colocated with source files
- Use descriptive test names
- Cover edge cases and error scenarios
- Ensure tests are deterministic

## 💻 Code Style

### TypeScript Guidelines

- Use TypeScript strict mode
- Prefer `const` over `let`
- Use meaningful variable names
- Add JSDoc comments for public APIs
- Handle errors explicitly
- Use async/await over callbacks

### File Structure

```
src/
├── index.ts           # Main entry point
├── ide-detector.ts    # IDE detection logic
├── inspector.ts       # Inspection runner
├── types.ts          # TypeScript types
└── utils.ts          # Utility functions
```

## 🐛 Reporting Issues

### Before Creating an Issue

1. Search existing issues to avoid duplicates
2. Try with the latest version
3. Check the documentation

### Issue Template

When creating an issue, provide:

- Clear title describing the problem
- Steps to reproduce
- Expected vs actual behavior
- Environment details (OS, Node version, IDE version)
- Error messages or logs
- Screenshots if applicable

## 🔒 Security

- Never commit sensitive data (API keys, passwords, tokens)
- Report security vulnerabilities via [SECURITY.md](SECURITY.md)
- Don't discuss vulnerabilities publicly until fixed
- See [SECURITY.md](SECURITY.md) for details

## 📚 Documentation

- Keep README.md up-to-date
- Document new features and APIs
- Include code examples
- Update CHANGELOG.md following [Keep a Changelog](https://keepachangelog.com/)

### Docusaurus Site

To work on the documentation site:

```bash
# Start development server
yarn docs:start

# Build documentation
yarn docs:build

# Serve built documentation
yarn docs:serve
```

## 🤝 Code of Conduct

Please read and follow our [Code of Conduct](CODE_OF_CONDUCT.md). We're committed to providing a welcoming and inclusive environment.

## ⚖️ License

By contributing, you agree that your contributions will be licensed under the same license as the project (MIT).

## 📮 Getting Help

- Open a [Discussion](https://github.com/your-org/mcp-jetbrains-code-inspections/discussions) for questions
- Check existing issues and PRs
- Read the documentation thoroughly
- Join our community chat (if available)

## 🎉 Recognition

Contributors are recognized in:

- The project's contributors list
- Release notes for significant contributions
- Special mentions for exceptional contributions

Thank you for contributing to MCP JetBrains Code Inspections! 🚀
