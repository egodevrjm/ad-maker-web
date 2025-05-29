#!/bin/bash

echo "🧹 Cleaning up GitHub repository"
echo "================================"
echo ""

# List of files to remove from Git
git rm test-elevenlabs.html
git rm test-enhance-api.html
git rm test-final-video.html
git rm test-video-assembly.html
git rm test-video-stitching.html
git rm analyze-personal.sh
git rm checklist.sh
git rm clean-personal-info.sh
git rm START_CLEANUP.sh
git rm ENHANCE_AI_IMPROVEMENTS.md
git rm FAL_NODEJS_READY.md
git rm IMPLEMENTATION_COMPLETE.md
git rm NODEJS_FAL_READY.md
git rm PORT_CONFIG.md
git rm QUICK_REFERENCE.md
git rm fix-ffmpeg-path.js.BROKEN
git rm quick-test-enhance.js

# Check for any other test files in subdirectories
echo ""
echo "Checking for test files in subdirectories..."
find . -name "test-*.js" -o -name "test-*.html" -o -name "test-*.sh" | grep -v node_modules | while read file; do
    echo "Removing: $file"
    git rm "$file" 2>/dev/null
done

# Remove deep-clean script if it exists
git rm deep-clean-personal.sh 2>/dev/null

# Remove this cleanup script too
echo ""
echo "This cleanup script will be removed after execution."
echo ""

# Show what will be committed
echo "Files staged for removal:"
git status --porcelain | grep "^D"

echo ""
echo "✅ Files removed from Git tracking"
echo ""
echo "Now run these commands to push the cleanup:"
echo ""
echo "git commit -m 'Clean up: Remove test scripts and development files'"
echo "git push"
echo ""
echo "Then remove this script:"
echo "rm remove-test-files.sh"
