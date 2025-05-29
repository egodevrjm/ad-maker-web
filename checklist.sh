#!/bin/bash

echo "📋 Pre-GitHub Checklist"
echo "======================="
echo ""

# Check for sensitive files
echo "🔍 Checking for sensitive files..."
echo ""

# Check for .env files
if find . -name ".env" -not -path "*/node_modules/*" -not -path "*/.git/*" | grep -q .; then
    echo "⚠️  Found .env files:"
    find . -name ".env" -not -path "*/node_modules/*" -not -path "*/.git/*"
else
    echo "✅ No .env files found"
fi

# Check for API keys in files
echo ""
echo "🔍 Checking for potential API keys..."
if grep -r "AIzaSy\|sk_\|fal-ai\|b46becea" . --exclude-dir=node_modules --exclude-dir=.git --exclude="*.example" 2>/dev/null | grep -v "your_.*_api_key_here"; then
    echo "⚠️  Found potential API keys in files above!"
else
    echo "✅ No API keys found in code"
fi

# Check for personal information
echo ""
echo "🔍 Checking for personal information..."
if grep -r "\|" . --exclude-dir=node_modules --exclude-dir=.git --exclude="checklist.sh" 2>/dev/null; then
    echo "⚠️  Found personal information in files above!"
else
    echo "✅ No personal information found"
fi

# Check for large files
echo ""
echo "🔍 Checking for large files (>1MB)..."
if find . -type f -size +1M -not -path "*/node_modules/*" -not -path "*/.git/*" | grep -q .; then
    echo "⚠️  Found large files:"
    find . -type f -size +1M -not -path "*/node_modules/*" -not -path "*/.git/*" -exec ls -lh {} \;
else
    echo "✅ No large files found"
fi

# Check if .gitignore is present
echo ""
echo "🔍 Checking .gitignore..."
if [ -f ".gitignore" ]; then
    echo "✅ .gitignore exists"
    
    # Check if .env is in .gitignore
    if grep -q "^\.env$" .gitignore; then
        echo "✅ .env is in .gitignore"
    else
        echo "⚠️  .env is NOT in .gitignore!"
    fi
else
    echo "⚠️  No .gitignore file found!"
fi

# Check for .env.example files
echo ""
echo "🔍 Checking for .env.example files..."
if [ -f "backend-node/.env.example" ]; then
    echo "✅ backend-node/.env.example exists"
else
    echo "⚠️  backend-node/.env.example is missing!"
fi

# Summary
echo ""
echo "📊 Summary"
echo "=========="
echo ""
echo "Before pushing to GitHub:"
echo "1. Run './sanitize-for-github.sh' if you haven't already"
echo "2. Fix any ⚠️  warnings above"
echo "3. Review the README.md"
echo "4. Update repository URL in documentation"
echo "5. Consider adding a LICENSE file"
echo ""
echo "Ready to push:"
echo "  git init"
echo "  git add ."
echo "  git commit -m 'Initial commit'"
echo "  git branch -M main"
echo "  git remote add origin https://github.com/yourusername/your-repo.git"
echo "  git push -u origin main"
