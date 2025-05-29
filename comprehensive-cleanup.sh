#!/bin/bash

echo "🧹 COMPREHENSIVE GitHub Repository Cleanup"
echo "=========================================="
echo ""
echo "This will remove ALL redundant files and directories from your Git repo"
echo ""

# First, let's see current status
echo "Current Git status:"
git status --short
echo ""

read -p "Continue with cleanup? This will remove many files! (y/n): " -n 1 -r
echo ""
if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    echo "Cancelled."
    exit 1
fi

echo ""
echo "🗑️  Step 1: Removing test and cleanup files..."
echo "----------------------------------------------"

# Remove all test files
git rm -f test-*.html 2>/dev/null
git rm -f test-*.js 2>/dev/null
git rm -f test-*.sh 2>/dev/null
git rm -f test-*.py 2>/dev/null
git rm -f quick-test-*.js 2>/dev/null

# Remove cleanup scripts
git rm -f analyze-personal.sh 2>/dev/null
git rm -f checklist.sh 2>/dev/null
git rm -f clean-personal-info.sh 2>/dev/null
git rm -f deep-clean-personal.sh 2>/dev/null
git rm -f START_CLEANUP.sh 2>/dev/null
git rm -f remove-test-files.sh 2>/dev/null
git rm -f git-cleanup.sh 2>/dev/null
git rm -f CLEANUP_COMMANDS.md 2>/dev/null

# Remove all fix scripts
git rm -f fix-*.sh 2>/dev/null
git rm -f fix-*.js 2>/dev/null
git rm -f fix_*.py 2>/dev/null

# Remove debug scripts
git rm -f debug-*.js 2>/dev/null
git rm -f debug-*.sh 2>/dev/null
git rm -f check-*.js 2>/dev/null
git rm -f check-*.py 2>/dev/null

# Remove all the development documentation
git rm -f ENHANCE_AI_IMPROVEMENTS.md 2>/dev/null
git rm -f FAL_NODEJS_READY.md 2>/dev/null
git rm -f IMPLEMENTATION_COMPLETE.md 2>/dev/null
git rm -f NODEJS_FAL_READY.md 2>/dev/null
git rm -f PORT_CONFIG.md 2>/dev/null
git rm -f QUICK_REFERENCE.md 2>/dev/null
git rm -f ALL_ISSUES_FIXED.md 2>/dev/null
git rm -f API_RECOVERY.md 2>/dev/null
git rm -f BACKEND_COMPARISON.md 2>/dev/null
git rm -f COMPLETE_*.md 2>/dev/null
git rm -f *_IMPLEMENTATION.md 2>/dev/null
git rm -f *_STATUS.md 2>/dev/null
git rm -f *_FIX*.md 2>/dev/null
git rm -f *_SETUP.md 2>/dev/null
git rm -f *_GUIDE.md 2>/dev/null
git rm -f *_RECOVERY.md 2>/dev/null
git rm -f *_UPDATE.md 2>/dev/null
git rm -f *_SUMMARY.md 2>/dev/null
git rm -f WHICH_BACKEND.md 2>/dev/null
git rm -f COPY_THIS_COMMAND.txt 2>/dev/null
git rm -f README_PERMISSION_FIX.md 2>/dev/null
git rm -f frontend-debug.txt 2>/dev/null
git rm -f frontend-video-fix.txt 2>/dev/null

# Remove other redundant files
git rm -f *.py 2>/dev/null  # Remove Python scripts in root
git rm -f *.bat 2>/dev/null
git rm -f *.patch 2>/dev/null
git rm -f fix-ffmpeg-path.js.BROKEN 2>/dev/null
git rm -f start-app-with-ffmpeg-fixed.sh.backup 2>/dev/null
git rm -f x.sh 2>/dev/null

# Remove all other shell scripts except start.sh
for script in *.sh; do
    if [[ "$script" != "start.sh" && "$script" != "comprehensive-cleanup.sh" ]]; then
        git rm -f "$script" 2>/dev/null
    fi
done

echo ""
echo "🗑️  Step 2: Removing Python backend directory..."
echo "----------------------------------------------"
# Remove the entire Python backend directory (keeping only backend-node)
git rm -rf backend/ 2>/dev/null

echo ""
echo "🗑️  Step 3: Removing testing directory..."
echo "----------------------------------------------"
git rm -rf testing/ 2>/dev/null

echo ""
echo "🗑️  Step 4: Removing temp directory..."
echo "----------------------------------------------"
git rm -rf temp/ 2>/dev/null

echo ""
echo "🗑️  Step 5: Cleaning backend-node directory..."
echo "----------------------------------------------"
# Clean up backend-node directory
cd backend-node 2>/dev/null && {
    git rm -f test-*.js 2>/dev/null
    git rm -f test-*.sh 2>/dev/null
    git rm -f debug-*.js 2>/dev/null
    git rm -f check-*.js 2>/dev/null
    git rm -f server-*.js 2>/dev/null
    git rm -f server.js.backup 2>/dev/null
    git rm -f server.js.audio-backup 2>/dev/null
    git rm -f install.sh 2>/dev/null
    git rm -f server-with-ffmpeg.sh 2>/dev/null
    git rm -f *.html 2>/dev/null
    cd ..
}

echo ""
echo "📋 Summary of changes:"
echo "====================="
echo ""
echo "Files to be removed:"
git status --porcelain | grep "^D " | wc -l | tr -d ' '
echo ""

echo "Files that will remain:"
echo "- README.md"
echo "- QUICKSTART.md"
echo "- LICENSE"
echo "- start.sh"
echo "- .gitignore"
echo "- frontend/ (source code)"
echo "- backend-node/ (source code)"
echo ""

echo "Preview of removals (first 20):"
git status --porcelain | grep "^D " | head -20
echo ""

read -p "Commit and push these changes? (y/n): " -n 1 -r
echo ""
if [[ $REPLY =~ ^[Yy]$ ]]; then
    echo ""
    echo "Committing changes..."
    git add -A
    git commit -m "Major cleanup: Remove test files, Python backend, and redundant files"
    
    echo ""
    echo "✅ Changes committed!"
    echo ""
    echo "Now push to GitHub:"
    echo "  git push"
    echo ""
    echo "Then remove this cleanup script:"
    echo "  rm comprehensive-cleanup.sh"
else
    echo "Changes not committed. Run 'git status' to see pending changes."
fi
