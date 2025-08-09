#!/bin/bash

# Git hooks installation script

HOOKS_DIR=".git/hooks"
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

echo "📦 Installing Git hooks..."

# Create pre-push hook
cat > "$HOOKS_DIR/pre-push" << 'EOF'
#!/bin/bash

echo "🔍 Checking version consistency before push..."

# Execute verification script
node scripts/version/check-version-consistency.js

if [ $? -ne 0 ]; then
    echo ""
    echo "❌ Push cancelled: Versions are not consistent."
    echo "📝 Please synchronize versions in:"
    echo "   - package.json"
    echo "   - CHANGELOG.md"
    echo "   - docs/reference/changelog.md"
    echo ""
    echo "💡 Tip: Use 'npm version' to update the version"
    exit 1
fi

echo "✅ Version check successful."
EOF

# Make hook executable
chmod +x "$HOOKS_DIR/pre-push"

echo "✅ Pre-push hook installed successfully!"
echo ""
echo "📝 To uninstall the hook: rm .git/hooks/pre-push"
echo "🔄 To reinstall: ./scripts/git/install-hooks.sh"