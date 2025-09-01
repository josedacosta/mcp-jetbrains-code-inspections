#!/bin/bash

# Build script for GitHub Actions
# Creates a temporary package.json without "type": "module" for Docusaurus

set -e

echo "Building Docusaurus documentation for GitHub Actions..."

# Create temporary build directory
DOCS_BUILD_DIR=".docs-build"
mkdir -p "$DOCS_BUILD_DIR"

# Copy necessary files
cp -r docs "$DOCS_BUILD_DIR/"
cp -r static "$DOCS_BUILD_DIR/" 2>/dev/null || mkdir -p "$DOCS_BUILD_DIR/static"
mkdir -p "$DOCS_BUILD_DIR/src"
cp -r src/css "$DOCS_BUILD_DIR/src/"
cp docusaurus.config.js "$DOCS_BUILD_DIR/"
cp docusaurus.sidebars.js "$DOCS_BUILD_DIR/"

# Create package.json without "type": "module"
cat > "$DOCS_BUILD_DIR/package.json" << 'EOF'
{
  "name": "mcp-jetbrains-docs-build",
  "version": "1.0.0",
  "private": true,
  "scripts": {
    "build": "docusaurus build",
    "start": "docusaurus start",
    "serve": "docusaurus serve"
  },
  "dependencies": {
    "@docusaurus/core": "^3.8.1",
    "@docusaurus/preset-classic": "^3.8.1",
    "@mdx-js/react": "^3.1.0",
    "prism-react-renderer": "^2.4.1",
    "react": "^19.1.1",
    "react-dom": "^19.1.1"
  }
}
EOF

# Change to build directory
cd "$DOCS_BUILD_DIR"

# Install dependencies
yarn install --frozen-lockfile

# Build documentation
yarn build

# Move build output to root
cd ..
rm -rf build
mv "$DOCS_BUILD_DIR/build" .

# Clean up temp directory
rm -rf "$DOCS_BUILD_DIR"

echo "Documentation built successfully!"