# Documentation Build Scripts

## Why These Scripts Exist

Docusaurus 3.8.1 has a known incompatibility with projects using `"type": "module"` in package.json. This causes "require is not defined" errors when
building or running the documentation.

Our solution: Use Node.js v20 specifically for building documentation while keeping Node.js v22 for the main project.

## Scripts

### `build-with-node-20.sh`

Builds the production documentation:

1. **Automatically detects** Node.js v20 installed on your system (via nvm, Homebrew, or Volta)
2. **Temporarily swaps** to a CommonJS package.json to avoid ESM issues
3. **Builds** the documentation with Node.js v20
4. **Restores** your original package.json
5. **Keeps** your system Node.js version unchanged

### `dev-with-node-20.sh`

Runs the development server with hot reload:

1. **Same detection and swap mechanism** as the build script
2. **Starts the development server** with Node.js v20
3. **Enables hot reload** for instant updates
4. **Automatically restores** package.json on exit (Ctrl+C)
5. **Prevents the blank page issue** that occurs with Node.js v22

## Usage

### Build Documentation

```bash
yarn docs:build
```

This command automatically uses the Node.js v20 build script.

### Preview Documentation

```bash
yarn docs:preview
```

This builds and then serves the documentation locally.

### Development Mode

```bash
yarn docs:dev
```

Starts the development server with hot reload (may have issues with Node.js v22).

### Serve Built Documentation

```bash
yarn docs:serve
```

Serves the already built documentation.

## Prerequisites

You need Node.js v20 installed. The script will detect it automatically if installed via:

- **nvm**: `nvm install 20`
- **Homebrew**: `brew install node@20`
- **Volta**: `volta install node@20`

## Troubleshooting

If the build fails:

1. **Check Node.js v20 is installed**: The script will tell you if it can't find Node.js v20
2. **Check package-docs.json exists**: The script will create it if missing
3. **Clear cache**: Run `yarn docs:clear` before building

## Technical Details

The main issue is that our project uses ES modules (`"type": "module"`), but Docusaurus generates CommonJS code with `require()` statements. The
workaround is to temporarily use a CommonJS package.json just for the build process.
