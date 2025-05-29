# 🚨 DIRECT COMMANDS TO CLEAN YOUR REPO

Copy and paste these commands to remove everything:

```bash
# Remove all test files
git rm test-elevenlabs.html test-enhance-api.html test-final-video.html test-video-assembly.html test-video-stitching.html

# Remove all cleanup/personal scripts  
git rm analyze-personal.sh checklist.sh clean-personal-info.sh START_CLEANUP.sh deep-clean-personal.sh

# Remove all development documentation
git rm ENHANCE_AI_IMPROVEMENTS.md FAL_NODEJS_READY.md IMPLEMENTATION_COMPLETE.md NODEJS_FAL_READY.md PORT_CONFIG.md QUICK_REFERENCE.md

# Remove broken and test files
git rm fix-ffmpeg-path.js.BROKEN quick-test-enhance.js

# Remove the entire Python backend directory
git rm -r backend/

# Remove all other shell scripts (keeping only start.sh)
git rm diagnose-enhance.sh diagnose-ports.sh fix-*.sh make-*.sh run-*.sh setup*.sh test-*.sh debug-*.sh quick-*.sh restart-*.sh verify-*.sh complete-*.sh create-*.sh force-*.sh show-*.sh stop-*.sh

# Remove all Python files in root
git rm *.py

# Remove all other documentation files
git rm ALL_ISSUES_FIXED.md API_RECOVERY.md BACKEND_COMPARISON.md COMPLETE_*.md COPY_THIS_COMMAND.txt FIX_*.md FINAL_*.md INSTRUCTIONS.sh ONE_COMMAND_FIX.md README_PERMISSION_FIX.md RESTART_SERVER_NOW.sh RUN_NOW.py SCRIPT_*.md SETUP_GUIDE.md SIMPLIFIED_*.md SOLUTION.md SOUND_*.md STATE_*.md VIDEO_*.md VOICEOVER_*.md WHICH_BACKEND.md frontend-*.txt x.sh *.bat *.patch

# Clean backend-node directory
cd backend-node
git rm test-*.js test-*.sh debug-*.js check-*.js server-minimal.js server.js.backup server.js.audio-backup install.sh server-with-ffmpeg.sh *.html
cd ..

# Remove testing and temp directories
git rm -r testing/ temp/

# Now commit everything
git commit -m "Major cleanup: Remove test files, Python backend, and all redundant files"

# Push to GitHub
git push

# Clean up local cleanup scripts
rm comprehensive-cleanup.sh nuclear-cleanup.sh
```

## Or use the automated script:

```bash
chmod +x comprehensive-cleanup.sh
./comprehensive-cleanup.sh
```

This will remove:
- ❌ ALL test files (HTML, JS, Python, Shell)
- ❌ The entire `backend/` directory (Python version)
- ❌ ALL development documentation (except README, LICENSE, QUICKSTART)
- ❌ ALL shell scripts (except start.sh)
- ❌ ALL Python files
- ❌ The `testing/` directory
- ❌ The `temp/` directory
- ❌ ALL cleanup and debug scripts

Your repo will only have:
- ✅ README.md
- ✅ QUICKSTART.md
- ✅ LICENSE
- ✅ start.sh
- ✅ .gitignore
- ✅ frontend/ (React app)
- ✅ backend-node/ (Node.js API)
