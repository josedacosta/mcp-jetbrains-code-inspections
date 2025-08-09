---
sidebar_position: 4
title: Contributing
description: How to contribute to the MCP JetBrains Code Inspections project
---

# Contributing

Thank you for your interest in contributing to MCP JetBrains Code Inspections! We welcome contributions from the community to help improve this
project.

## Table of Contents

- [Code of Conduct](#code-of-conduct)
- [Getting Started](#getting-started)
- [Development Setup](#development-setup)
- [How to Contribute](#how-to-contribute)
- [Pull Request Process](#pull-request-process)
- [Coding Standards](#coding-standards)
- [Testing](#testing)
- [Documentation](#documentation)
- [Reporting Issues](#reporting-issues)

## Code of Conduct

Please note that this project has a [Code of Conduct](https://github.com/josedacosta/mcp-jetbrains-code-inspections/blob/main/CODE_OF_CONDUCT.md). By
participating in this project, you agree to abide by its terms.

## Getting Started

### 1. Fork and Clone

```bash
# Fork the repository on GitHub, then:
git clone https://github.com/YOUR-USERNAME/mcp-jetbrains-code-inspections.git
cd mcp-jetbrains-code-inspections

# Add upstream remote
git remote add upstream https://github.com/josedacosta/mcp-jetbrains-code-inspections.git
```

### 2. Create a Branch

```bash
# Create and switch to a new branch
git checkout -b feature/your-feature-name

# Or for bug fixes
git checkout -b fix/issue-description
```

## Development Setup

### Prerequisites

Ensure you have:

- **Node.js** 20+ installed
- **Yarn** package manager
- At least one **JetBrains IDE** installed
- **Git** for version control

### Installation

```bash
# Install dependencies
yarn install

# Build the project
yarn build

# Start development mode
yarn dev
```

### Development Commands

```bash
# Development with hot reload
yarn dev

# Build for production
yarn build

# Run in production mode
yarn start

# Test with MCP Inspector
yarn inspect

# Build documentation
yarn docs:build

# Start documentation server
yarn docs:start
```

### Project Structure

```
src/
├── index.ts              # Main MCP server entry point
├── core/                 # Core business logic
│   ├── ide/             # IDE detection and management
│   ├── inspection/      # Inspection execution
│   └── parsing/         # Result parsing
├── domain/              # Domain models and interfaces
├── utils/               # Utility functions
└── resources/           # Static resources (profiles, etc.)

docs/                    # Documentation source
tests/                   # Test files (when added)
scripts/                 # Build and utility scripts
```

## How to Contribute

### Types of Contributions

We welcome several types of contributions:

1. **Bug Fixes**: Fix issues reported in GitHub Issues
2. **Feature Enhancements**: Improve existing functionality
3. **New Features**: Add new capabilities
4. **Documentation**: Improve or add documentation
5. **Testing**: Add tests for existing functionality
6. **Performance**: Optimize performance

### Finding Issues to Work On

- Check the [Issues](https://github.com/josedacosta/mcp-jetbrains-code-inspections/issues) page
- Look for issues labeled `good first issue` for beginners
- Issues labeled `help wanted` are great for contributors
- Feel free to propose new features via issues

## Pull Request Process

### 1. Before You Start

- Check if an issue exists for your change
- If not, create an issue to discuss the change
- Make sure your branch is up to date with main

```bash
git checkout main
git pull upstream main
git checkout your-branch
git rebase main
```

### 2. Making Changes

- Keep changes focused and atomic
- Follow the coding standards (see below)
- Add/update documentation as needed
- Test your changes thoroughly

### 3. Commit Messages

Follow this format for commit messages:

```
type(scope): brief description

Longer description if needed

Fixes #issue-number
```

**Types:**

- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation changes
- `style`: Code style changes (formatting, etc.)
- `refactor`: Code refactoring
- `test`: Adding or updating tests
- `chore`: Maintenance tasks

**Examples:**

```
feat(ide): add support for Android Studio detection

fix(parsing): handle malformed JSON output gracefully

docs(api): update environment variable documentation
```

### 4. Creating the Pull Request

```bash
# Push your branch
git push origin your-branch

# Create a pull request on GitHub
```

**Pull Request Template:**

```markdown
## Description

Brief description of changes

## Type of Change

- [ ] Bug fix
- [ ] New feature
- [ ] Documentation update
- [ ] Performance improvement
- [ ] Other: \_\_\_

## Testing

- [ ] Tested with multiple IDEs
- [ ] Tested on different platforms
- [ ] Added/updated tests
- [ ] Documentation updated

## Screenshots (if applicable)

Add screenshots or example output

## Additional Notes

Any additional information or context
```

### 5. Review Process

- Maintainers will review your PR
- Address any feedback or requested changes
- Once approved, the PR will be merged

## Coding Standards

### TypeScript Guidelines

- **Use TypeScript**: All code should be properly typed
- **Strict Mode**: We use TypeScript strict mode
- **Interface Definitions**: Define clear interfaces for data structures
- **Error Handling**: Use proper error types and handling

```typescript
// ✅ Good
interface InspectionConfig {
    timeout: number;
    format: 'json' | 'markdown';
    excludeInspections?: string[];
}

async function executeInspection(config: InspectionConfig): Promise<InspectionResult> {
    try {
        // Implementation
    } catch (error) {
        if (error instanceof InspectionTimeoutError) {
            // Handle timeout specifically
        }
        throw new InspectionError(`Execution failed: ${error.message}`);
    }
}

// ❌ Avoid
function doInspection(config: any): any {
    // Implementation without types
}
```

### Code Style

- **Formatting**: We use Prettier for code formatting
- **Linting**: ESLint is used for code quality
- **Imports**: Use explicit imports and organize them logically

```bash
# Format code
yarn format

# Lint code
yarn lint

# Fix linting issues
yarn lint:fix
```

### File Organization

- **Single Responsibility**: Each file should have a clear, single purpose
- **Barrel Exports**: Use index files for clean imports
- **Constants**: Keep configuration constants in dedicated files

```typescript
// src/core/ide/index.ts
export { IDEDetector } from './IDEDetector';
export { IDESelector } from './IDESelector';
export type { IDE, IDEConfig } from './types';
```

### Error Handling

- **Custom Errors**: Use specific error types for different scenarios
- **Error Context**: Provide helpful error messages with context
- **Graceful Degradation**: Handle errors gracefully when possible

```typescript
// Custom error types
export class IDENotFoundError extends Error {
    constructor(message: string) {
        super(message);
        this.name = 'IDENotFoundError';
    }
}

export class InspectionTimeoutError extends Error {
    constructor(timeout: number) {
        super(`Inspection timed out after ${timeout}ms`);
        this.name = 'InspectionTimeoutError';
    }
}
```

## Testing

### Manual Testing

Always test your changes with:

1. **Multiple IDEs**: Test with different JetBrains IDEs
2. **Different Platforms**: macOS, Windows, Linux (if possible)
3. **Various Project Types**: JavaScript, TypeScript, Java, Python, etc.
4. **Edge Cases**: Large projects, malformed projects, network issues

### Testing Checklist

- [ ] Basic functionality works
- [ ] Error cases are handled properly
- [ ] Performance is acceptable
- [ ] No memory leaks
- [ ] Cleanup happens correctly

### MCP Inspector Testing

Use the MCP Inspector for interactive testing:

```bash
yarn inspect
```

### Integration Testing

Test with real MCP clients:

```bash
# Test with Claude Code or other MCP clients
# Ensure the server starts and responds correctly
```

## Documentation

### Documentation Standards

- **Clear and Concise**: Write clear, easy-to-understand documentation
- **Examples**: Provide practical examples
- **Up-to-Date**: Keep documentation current with code changes
- **Comprehensive**: Cover all public APIs and features

### Documentation Types

1. **API Documentation**: Document all public interfaces
2. **User Guides**: Help users accomplish tasks
3. **Technical Documentation**: Explain system design and architecture
4. **Examples**: Provide real-world usage examples

### Writing Guidelines

- Use active voice
- Be specific and precise
- Include code examples
- Test all examples to ensure they work
- Use proper markdown formatting

### Building Documentation

```bash
# Start development server
yarn docs:start

# Build static documentation
yarn docs:build

# Serve built documentation
yarn docs:serve
```

## Reporting Issues

### Bug Reports

When reporting bugs, please include:

1. **Clear Description**: What happened vs. what you expected
2. **Reproduction Steps**: Step-by-step instructions to reproduce
3. **Environment**: OS, Node.js version, IDE versions
4. **Configuration**: Relevant MCP configuration
5. **Error Messages**: Full error messages and stack traces
6. **Additional Context**: Screenshots, logs, etc.

### Bug Report Template

````markdown
**Bug Description**
A clear and concise description of the bug.

**Reproduction Steps**

1. Go to '...'
2. Click on '...'
3. See error

**Expected Behavior**
What you expected to happen.

**Actual Behavior**
What actually happened.

**Environment**

- OS: [e.g., macOS 14.2]
- Node.js: [e.g., 20.17.0]
- IDE: [e.g., IntelliJ IDEA 2023.3]
- Project Type: [e.g., TypeScript React]

**Configuration**

```json
{
    "your": "mcp configuration"
}
```
````

**Error Messages**

```
Full error messages and stack traces
```

**Additional Context**
Any additional information, screenshots, etc.

```

### Feature Requests

For feature requests, please include:

1. **Use Case**: Why do you need this feature?
2. **Proposed Solution**: How should it work?
3. **Alternatives**: What alternatives have you considered?
4. **Examples**: Show examples of the desired behavior

## Code Review Guidelines

### For Contributors

- **Test Thoroughly**: Ensure your code works in various scenarios
- **Document Changes**: Update documentation for any public API changes
- **Keep It Simple**: Make changes as simple and focused as possible
- **Follow Standards**: Adhere to the established coding standards

### For Reviewers

- **Be Constructive**: Provide helpful, actionable feedback
- **Focus on Code**: Review the code, not the person
- **Explain Why**: Explain the reasoning behind suggested changes
- **Acknowledge Good Work**: Recognize good practices and improvements

## Release Process

Releases are handled by maintainers following semantic versioning:

- **Patch** (1.0.X): Bug fixes and minor improvements
- **Minor** (1.X.0): New features, backward compatible
- **Major** (X.0.0): Breaking changes

## Getting Help

If you need help:

- **Documentation**: Check the comprehensive documentation
- **Issues**: Search existing issues or create a new one
- **Discussions**: Use GitHub Discussions for questions
- **Community**: Engage with the community

## Recognition

We appreciate all contributions! Contributors will be:

- Listed in the project's contributor list
- Mentioned in release notes for significant contributions
- Invited to join the project as maintainers for sustained contributions

## License

By contributing, you agree that your contributions will be licensed under the Open Software License 3.0 (OSL-3.0), the same license as the project.

Thank you for contributing to MCP JetBrains Code Inspections!
```
