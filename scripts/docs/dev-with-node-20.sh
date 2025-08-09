#!/bin/bash

# ============================================================================
# Docusaurus Development Server with Node.js v20
# ============================================================================
#
# WHY THIS SCRIPT EXISTS:
# ------------------------
# Same issue as with build: Docusaurus 3.8.1 doesn't work properly with
# projects using "type": "module". This script runs the development server
# with Node.js v20 in an isolated environment to avoid the "require is not 
# defined" errors while never modifying the main package.json.
#
# This version includes automatic file syncing for hot-reload support.
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
echo -e "${CYAN}              Docusaurus Development Server with Node.js v20               ${NC}"
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
    echo -e "${YELLOW}Node.js v20 is required to run Docusaurus development server.${NC}"
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

# Create a separate dev directory
DOCS_DEV_DIR=".docs-node"
echo -e "${YELLOW}Creating isolated development environment in ${DOCS_DEV_DIR}...${NC}"

# Variables for process management
SYNC_PID=""
DOCUSAURUS_PID=""

# Function to sync files continuously
sync_files_loop() {
    while true; do
        # Use rsync to sync changes efficiently
        rsync -av --delete \
            --exclude 'node_modules' \
            --exclude '.git' \
            --exclude '.docs-node' \
            --exclude 'build' \
            docs/ "$DOCS_DEV_DIR/docs/" 2>/dev/null || true
        
        rsync -av --delete \
            --exclude 'node_modules' \
            static/ "$DOCS_DEV_DIR/static/" 2>/dev/null || true
        
        rsync -av --delete \
            src/css/ "$DOCS_DEV_DIR/src/css/" 2>/dev/null || true
        
        # Copy config files if they changed
        if [ docusaurus.config.js -nt "$DOCS_DEV_DIR/docusaurus.config.js" ]; then
            cp docusaurus.config.js "$DOCS_DEV_DIR/"
            echo -e "${GREEN}✅ Updated: docusaurus.config.js${NC}"
        fi
        
        if [ docusaurus.sidebars.js -nt "$DOCS_DEV_DIR/docusaurus.sidebars.js" ]; then
            cp docusaurus.sidebars.js "$DOCS_DEV_DIR/"
            echo -e "${GREEN}✅ Updated: docusaurus.sidebars.js${NC}"
        fi
        
        # Wait 1 second before next sync
        sleep 1
    done
}

# Function to cleanup on exit
cleanup() {
    echo ""
    echo -e "${YELLOW}Stopping development server...${NC}"
    
    # Kill sync process
    if [ ! -z "$SYNC_PID" ] && kill -0 "$SYNC_PID" 2>/dev/null; then
        echo -e "${YELLOW}Stopping file sync...${NC}"
        kill "$SYNC_PID" 2>/dev/null || true
    fi
    
    # Kill Docusaurus process  
    if [ ! -z "$DOCUSAURUS_PID" ] && kill -0 "$DOCUSAURUS_PID" 2>/dev/null; then
        echo -e "${YELLOW}Stopping Docusaurus...${NC}"
        kill "$DOCUSAURUS_PID" 2>/dev/null || true
    fi
    
    # Clean up dev directory on exit
    if [ -d "$DOCS_DEV_DIR" ]; then
        echo -e "${YELLOW}Cleaning up development environment...${NC}"
        rm -rf "$DOCS_DEV_DIR"
    fi
    echo -e "${GREEN}✅ Cleanup complete${NC}"
}

# Set trap to cleanup on exit
trap cleanup EXIT INT TERM

# Clean and create dev directory
rm -rf "$DOCS_DEV_DIR"
mkdir -p "$DOCS_DEV_DIR"

# Copy necessary files to dev directory
echo -e "${YELLOW}Setting up development environment...${NC}"
cp -r docs "$DOCS_DEV_DIR/"
cp -r static "$DOCS_DEV_DIR/" 2>/dev/null || mkdir -p "$DOCS_DEV_DIR/static"
mkdir -p "$DOCS_DEV_DIR/src"
cp -r src/css "$DOCS_DEV_DIR/src/" 2>/dev/null || mkdir -p "$DOCS_DEV_DIR/src/css"
cp docusaurus.config.js "$DOCS_DEV_DIR/"
cp docusaurus.sidebars.js "$DOCS_DEV_DIR/"

# Create a package.json without "type": "module"
echo -e "${YELLOW}Creating development-specific package.json...${NC}"
cat > "$DOCS_DEV_DIR/package.json" << 'EOF'
{
  "name": "mcp-jetbrains-docs-dev",
  "version": "1.0.0",
  "private": true,
  "scripts": {
    "start": "docusaurus start",
    "build": "docusaurus build",
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

echo -e "${CYAN}============================================================================${NC}"
echo -e "${GREEN}🚀 Development server will start at:${NC}"
echo -e "${GREEN}   http://localhost:3000/mcp-jetbrains-code-inspections/${NC}"
echo ""
echo -e "${YELLOW}📝 Hot reload enabled - changes to ./docs will sync automatically${NC}"
echo -e "${YELLOW}Press Ctrl+C to stop the server${NC}"
echo -e "${CYAN}============================================================================${NC}"
echo ""

# Start the file sync in background (from root directory)
echo -e "${BLUE}Starting file sync process...${NC}"
sync_files_loop &
SYNC_PID=$!
echo -e "${GREEN}✅ File sync started (PID: $SYNC_PID)${NC}"
echo ""

# Change to dev directory for Docusaurus
cd "$DOCS_DEV_DIR"

# Special handling for Volta
if [ "$NODE20_PATH" = "volta" ]; then
    echo -e "${GREEN}✅ Found Node.js v20 via Volta${NC}"
    echo -e "${BLUE}Installing dependencies and starting server...${NC}"
    echo ""
    
    # Install dependencies and start dev server with Volta
    VOLTA_HOME="$HOME/.volta" volta run --node 20 yarn install --frozen-lockfile
    VOLTA_HOME="$HOME/.volta" volta run --node 20 yarn start &
    DOCUSAURUS_PID=$!
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
    
    echo -e "${BLUE}Installing dependencies and starting server...${NC}"
    echo ""
    
    # Install dependencies and start dev server with Node 20
    PATH="$NODE20_PATH:$PATH" yarn install --frozen-lockfile
    PATH="$NODE20_PATH:$PATH" yarn start &
    DOCUSAURUS_PID=$!
fi

# Wait for the Docusaurus process
wait "$DOCUSAURUS_PID"