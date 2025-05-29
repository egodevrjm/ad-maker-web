#!/bin/bash

echo "🚨 NUCLEAR CLEANUP - Remove Everything Unnecessary"
echo "================================================="
echo ""

# Show what's currently in the repo
echo "Files currently in your repository:"
git ls-files | grep -E "\.(html|sh|py|md|txt|js)$" | grep -v -E "(README|LICENSE|QUICKSTART|start\.sh|src/|package)" | sort
echo ""
echo "Total files to remove: $(git ls-files | grep -E "\.(html|sh|py|md|txt|js)$" | grep -v -E "(README|LICENSE|QUICKSTART|start\.sh|src/|package)" | wc -l)"
echo ""

read -p "Remove ALL these files? (y/n): " -n 1 -r
echo ""
if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    exit 1
fi

echo ""
echo "🗑️  Removing files..."

# Remove ALL test files
git rm test-*.html test-*.js test-*.sh test-*.py 2>/dev/null

# Remove ALL scripts except start.sh
git rm *.sh 2>/dev/null
git add start.sh  # Re-add the one we want to keep

# Remove ALL Python files
git rm *.py 2>/dev/null

# Remove ALL development docs except README, LICENSE, QUICKSTART
git rm *.md 2>/dev/null
git add README.md LICENSE QUICKSTART.md  # Re-add the ones we want

# Remove ALL txt files
git rm *.txt 2>/dev/null

# Remove other junk
git rm *.bat *.patch *.BROKEN *.backup 2>/dev/null

# Remove entire Python backend
git rm -r backend/ 2>/dev/null

# Remove testing directory
git rm -r testing/ 2>/dev/null

# Remove temp directory  
git rm -r temp/ 2>/dev/null

# Clean backend-node
cd backend-node && {
    git rm test-*.js test-*.sh debug-*.js check-*.js server-*.js *.backup *.sh *.html 2>/dev/null
    cd ..
}

# Commit everything
echo ""
echo "✅ All files staged for removal"
echo ""
echo "Run these commands to finish:"
echo ""
echo "git commit -m 'Major cleanup: Remove all test files and redundant code'"
echo "git push"
echo "rm nuclear-cleanup.sh comprehensive-cleanup.sh"
