#!/bin/bash

# ============================================================================
# Docusaurus Build Script with Node.js v20
# ============================================================================
#
# WHY THIS SCRIPT EXISTS:
# ------------------------
# Docusaurus 3.8.1 has a known incompatibility with projects that use
# "type": "module" in package.json. When building with Node.js 22 and ESM,
# Docusaurus generates code with require() statements that fail in the browser
# with "require is not defined" errors.
#
# SOLUTION:
# This script uses a separate docs-build directory with its own package.json
# that doesn't have "type": "module", allowing Docusaurus to work properly.
# The main project package.json is NEVER modified.
#
# ============================================================================

set -e

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
RED='\033[0;31m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

echo -e "${CYAN}============================================================================${NC}"
echo -e "${CYAN}                    Docusaurus Build with Node.js v20                      ${NC}"
echo -e "${CYAN}============================================================================${NC}"
echo ""

# Function to find Node v20
find_node_20() {
    local node20_path=""
    
    # Method 1: Check if nvm is available and has Node 20
    if [ -d "$HOME/.nvm/versions/node" ]; then
        for version_dir in "$HOME/.nvm/versions/node"/v20.*/; do
            if [ -d "$version_dir" ]; then
                node20_path="${version_dir}bin"
                break
            fi
        done
    fi
    
    # Method 2: Check Homebrew installation
    if [ -z "$node20_path" ]; then
        if [ -d "/opt/homebrew/opt/node@20/bin" ]; then
            node20_path="/opt/homebrew/opt/node@20/bin"
        elif [ -d "/usr/local/opt/node@20/bin" ]; then
            node20_path="/usr/local/opt/node@20/bin"
        fi
    fi
    
    # Method 3: Check Volta
    if [ -z "$node20_path" ] && command -v volta &> /dev/null; then
        if volta list node 2>/dev/null | grep -q "20\."; then
            echo "volta"
            return
        fi
    fi
    
    echo "$node20_path"
}

# Find Node 20
NODE20_PATH=$(find_node_20)

if [ -z "$NODE20_PATH" ] || [ "$NODE20_PATH" = "" ]; then
    echo -e "${RED}❌ Node.js v20 not found!${NC}"
    echo ""
    echo -e "${YELLOW}Node.js v20 is required to build Docusaurus documentation.${NC}"
    echo ""
    echo "Please install Node.js v20 using one of these methods:"
    echo ""
    echo "1. Using nvm (recommended):"
    echo -e "   ${BLUE}nvm install 20${NC}"
    echo ""
    echo "2. Using Homebrew (macOS):"
    echo -e "   ${BLUE}brew install node@20${NC}"
    echo ""
    echo "3. Using Volta:"
    echo -e "   ${BLUE}volta install node@20${NC}"
    echo ""
    exit 1
fi

# Create a separate build directory
DOCS_BUILD_DIR=".docs-build"
echo -e "${YELLOW}Preparing build environment in ${DOCS_BUILD_DIR}...${NC}"

# Create build directory if it doesn't exist
mkdir -p "$DOCS_BUILD_DIR"

# Copy necessary files to build directory
echo -e "${YELLOW}Copying documentation files...${NC}"
cp -r docs "$DOCS_BUILD_DIR/"
cp -r static "$DOCS_BUILD_DIR/" 2>/dev/null || mkdir -p "$DOCS_BUILD_DIR/static"
mkdir -p "$DOCS_BUILD_DIR/src"
cp -r src/css "$DOCS_BUILD_DIR/src/"
cp docusaurus.config.js "$DOCS_BUILD_DIR/"
cp docusaurus.sidebars.js "$DOCS_BUILD_DIR/"

# Create a package.json without "type": "module"
echo -e "${YELLOW}Creating build-specific package.json...${NC}"
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

# Special handling for Volta
if [ "$NODE20_PATH" = "volta" ]; then
    echo -e "${GREEN}✅ Found Node.js v20 via Volta${NC}"
    echo -e "${BLUE}Installing dependencies and building...${NC}"
    echo ""
    
    # Install dependencies and build with Volta
    VOLTA_HOME="$HOME/.volta" volta run --node 20 yarn install --frozen-lockfile
    VOLTA_HOME="$HOME/.volta" volta run --node 20 yarn build
    BUILD_RESULT=$?
else
    # Display found Node 20 version
    NODE20_VERSION=$("$NODE20_PATH/node" -v 2>/dev/null || echo "unknown")
    echo -e "${GREEN}✅ Found Node.js $NODE20_VERSION at:${NC}"
    echo -e "   ${BLUE}$NODE20_PATH${NC}"
    echo ""
    
    # Show current system Node version for comparison
    SYSTEM_NODE=$(node -v 2>/dev/null || echo "not found")
    echo -e "${YELLOW}ℹ️  Your system Node.js version: $SYSTEM_NODE${NC}"
    echo -e "${YELLOW}   (will remain unchanged)${NC}"
    echo ""
    
    echo -e "${BLUE}Installing dependencies and building...${NC}"
    echo ""
    
    # Install dependencies and build with Node 20
    PATH="$NODE20_PATH:$PATH" yarn install --frozen-lockfile
    PATH="$NODE20_PATH:$PATH" yarn build
    BUILD_RESULT=$?
fi

# Keep build output in .docs-build
if [ $BUILD_RESULT -eq 0 ]; then
    cd ..
    
    echo ""
    echo -e "${GREEN}============================================================================${NC}"
    echo -e "${GREEN}                        ✅ BUILD SUCCESSFUL!                               ${NC}"
    echo -e "${GREEN}============================================================================${NC}"
    echo ""
    echo -e "${CYAN}📁 Documentation built in: ./${DOCS_BUILD_DIR}/build/${NC}"
    echo ""
    echo "To preview locally:"
    echo -e "  ${BLUE}yarn docs:serve${NC}"
    echo -e "  Open: ${BLUE}http://localhost:3000/mcp-jetbrains-code-inspections/${NC}"
    echo ""
    echo "To deploy to GitHub Pages:"
    echo -e "  ${BLUE}git add . && git commit -m 'Update docs' && git push${NC}"
    echo ""
else
    cd ..
    echo ""
    echo -e "${RED}============================================================================${NC}"
    echo -e "${RED}                         ❌ BUILD FAILED                                   ${NC}"
    echo -e "${RED}============================================================================${NC}"
    echo ""
    echo "Please check the error messages above."
    # Keep .docs-build for debugging on failure
    echo -e "${YELLOW}Build directory kept for debugging: ./${DOCS_BUILD_DIR}${NC}"
    exit 1
fi