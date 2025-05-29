#!/bin/bash

echo "🧹 Removing test and cleanup files from Git repository"
echo "===================================================="
echo ""

# Files to remove
FILES_TO_REMOVE=(
    # Test HTML files
    "test-elevenlabs.html"
    "test-enhance-api.html"
    "test-final-video.html"
    "test-video-assembly.html"
    "test-video-stitching.html"
    
    # Cleanup scripts
    "analyze-personal.sh"
    "checklist.sh"
    "clean-personal-info.sh"
    "START_CLEANUP.sh"
    
    # Documentation files that shouldn't be in production
    "ENHANCE_AI_IMPROVEMENTS.md"
    "FAL_NODEJS_READY.md"
    "IMPLEMENTATION_COMPLETE.md"
    "NODEJS_FAL_READY.md"
    "PORT_CONFIG.md"
    "QUICK_REFERENCE.md"
    
    # Broken/test files
    "fix-ffmpeg-path.js.BROKEN"
    "quick-test-enhance.js"
    
    # Any remaining test files
    "test-*.html"
    "test-*.js"
    "test-*.sh"
    "*-personal*.sh"
    "*CLEANUP*.sh"
)

echo "Removing files..."
echo ""

# Remove each file
for file in "${FILES_TO_REMOVE[@]}"; do
    if [ -f "$file" ]; then
        git rm "$file" 2>/dev/null || rm -f "$file"
        echo "✅ Removed: $file"
    else
        # Try pattern matching for wildcards
        for match in $file; do
            if [ -f "$match" ]; then
                git rm "$match" 2>/dev/null || rm -f "$match"
                echo "✅ Removed: $match"
            fi
        done
    fi
done

# Also remove any other test/debug files that might have been missed
echo ""
echo "Looking for additional test/debug files..."

# Find and remove test files
find . -name "test-*.html" -o -name "test-*.js" -o -name "test-*.sh" -o -name "debug-*.js" -o -name "check-*.js" | while read file; do
    if [ -f "$file" ]; then
        git rm "$file" 2>/dev/null || rm -f "$file"
        echo "✅ Removed: $file"
    fi
done

echo ""
echo "✅ Cleanup complete!"
echo ""
echo "Now commit and push these changes:"
echo ""
echo "git add -A"
echo "git commit -m 'Remove test scripts and cleanup files'"
echo "git push"
