# Quick Git Cleanup Commands

Run these commands to remove all test and cleanup files from your repository:

```bash
# Remove test HTML files
git rm test-*.html

# Remove cleanup scripts  
git rm analyze-personal.sh checklist.sh clean-personal-info.sh START_CLEANUP.sh

# Remove development documentation
git rm ENHANCE_AI_IMPROVEMENTS.md FAL_NODEJS_READY.md IMPLEMENTATION_COMPLETE.md NODEJS_FAL_READY.md PORT_CONFIG.md QUICK_REFERENCE.md

# Remove broken/test files
git rm fix-ffmpeg-path.js.BROKEN quick-test-enhance.js

# Remove deep-clean if it exists
git rm deep-clean-personal.sh 2>/dev/null

# Commit all removals
git commit -m "Clean up: Remove test scripts and development files"

# Push to GitHub
git push
```

## Or use this one-liner to remove everything at once:

```bash
git rm test-*.html analyze-personal.sh checklist.sh clean-personal-info.sh START_CLEANUP.sh ENHANCE_AI_IMPROVEMENTS.md FAL_NODEJS_READY.md IMPLEMENTATION_COMPLETE.md NODEJS_FAL_READY.md PORT_CONFIG.md QUICK_REFERENCE.md fix-ffmpeg-path.js.BROKEN quick-test-enhance.js deep-clean-personal.sh 2>/dev/null && git commit -m "Clean up: Remove test scripts and development files" && git push
```

## Files being removed:
- All test-*.html files
- All personal info cleanup scripts
- Development documentation (ENHANCE_AI_IMPROVEMENTS.md, etc.)
- Broken files (fix-ffmpeg-path.js.BROKEN)
- Test scripts (quick-test-enhance.js)

## Files that should stay:
- README.md
- QUICKSTART.md  
- LICENSE
- start.sh
- Source code directories (frontend/, backend-node/)
