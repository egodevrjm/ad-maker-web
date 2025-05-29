#!/bin/bash

echo "🚀 Quick Personal Info Cleanup"
echo "============================="
echo ""

# Make all cleaning scripts executable
chmod +x clean-personal-info.sh deep-clean-personal.sh analyze-personal.sh 2>/dev/null

# First analyze
echo "1️⃣ Analyzing personal information in files..."
./analyze-personal.sh

echo ""
echo "2️⃣ Options to clean:"
echo ""
echo "Option A - Quick clean (recommended):"
echo "  ./deep-clean-personal.sh"
echo ""
echo "Option B - Manual review:"
echo "  ./clean-personal-info.sh"
echo ""
echo "Option C - Just clean paths:"
echo "  find . -type f -not -path '*/node_modules/*' -name '*.sh' -o -name '*.js' -o -name '*.md' | xargs sed -i '' 's|/Users/|/path/to|g'"
echo ""
echo "After cleaning, run ./checklist.sh again to verify"
