# CLAUDE.md

## Project Context

MCP server for JetBrains IDE inspections with auto-detection (WebStorm, IntelliJ, PyCharm, etc.)

## Essential Commands

- `yarn dev` - Development mode
- `yarn build` - TypeScript compilation
- `yarn inspect` - Test with MCP Inspector with @modelcontextprotocol/inspector
- `yarn test:mcp --path <file>` - Test MCP server with specific file

## Critical Architecture

### Key Files

- `src/index.ts` - Entry point, exposes `get_jetbrains_code_inspections`

### Specific Behavior

- **IDE Isolation**: Uses `-Didea.config.path` and `-Didea.system.path` to run even when IDE is open

## ⚠️ CRITICAL INSTRUCTION

**EVERYTHING in this project MUST be in English**: All code, documentation, code comments, commit messages, variable names, function names, class
names, file names, error messages, logs, READMEs, markdown files, configuration files - ABSOLUTELY EVERYTHING must be written in English. No
exceptions.

## ⚠️ CRITICAL: inspect.sh Parameters

```bash
inspect.sh <project_path> <profile> <output_path> [options]
```

## Important Environment Variables

- `FORCE_INSPECT_PATH` - Force specific IDE (disables auto-detection)
- `INSPECTION_TIMEOUT` - Timeout in ms (default: 120000)
- `DEBUG` - Enable debug logs

## Git & Version Control

### Branching Model: GitHub Flow

- **Base**: `main` branch - always deployable
- **Workflow**: Create short-lived branch from `main` → Push regularly → Open PR early (draft if needed) → Code review → CI green → Merge → Delete
  branch
- **Deploy frequently**: Risky features use feature flags

### Branch Naming Convention

**Patterns**:

- `feat/<scope>-<short-description>`
- `fix/<scope>-<short-description>`
- `chore/<scope>-<short-description>`
- `docs/<scope>-<short-description>`
- `refactor/<scope>-<short-description>`
- `test/<scope>-<short-description>`

**Optional**: Prefix with issue ID → `1234-fix-login-timeout` or `feat/auth-oauth-device-flow-#812`

**Rules**:

- Lowercase only
- Use hyphens `-`
- No accents or spaces
- 50-72 characters max

### Commit Message Standards: Conventional Commits

**Format**: `<type>(<scope>): <summary>`

**Types**: `feat`, `fix`, `docs`, `style`, `refactor`, `test`, `chore`, `ci`, `build`, `perf`

**Examples**:

- `feat(auth): support OAuth device flow`
- `fix(api): retry on 429 (Fixes #812)`
- `feat!: drop Node 16 (BREAKING CHANGE)`

**Rules**:

- Summary: 50 chars max, imperative mood
- Body: Optional, explain why/how, 72 chars per line
- Footer: Link issues (`Fixes #123`), breaking changes (`BREAKING CHANGE:`)
- **NO Claude Code references** - Never add Claude Code references in commits
- **Keep messages clean** - Only actual commit content

### Pull Request Standards

- **Small PRs**: ≤300 lines modified when possible
- **Clear description**: Context → Solution → Tests → Risks/rollbacks
- **Link issues**: Use "Fixes #ID" or "Closes #ID"
- **Include visuals**: Screenshots/GIFs when relevant
- **Use PR template**: See `.github/PULL_REQUEST_TEMPLATE.md`
- **Review quickly**: Respond to feedback promptly
- **Merge strategy**: Squash & merge recommended

### Protected Branch Rules (main)

**Required**:

- Pull request before merging
- At least 1 approval
- Status checks must pass (CI/lint/test/build)
- Branches up to date before merging
- Linear history (no merge commits)
- CODEOWNERS review when applicable

**Optional**:

- Signed commits
- Restrict direct pushes

### Versioning & Releases

- **SemVer**: `vMAJOR.MINOR.PATCH`
- **Tags**: Tag each release
- **CHANGELOG**: Follow Keep a Changelog format
- **Release automation**: Consider semantic-release or release-please
