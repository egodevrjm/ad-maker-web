#!/bin/bash

echo "📊 Personal Information Analysis"
echo "================================"
echo ""

# Quick analysis
echo "Files by type containing personal info:"
echo ""

# Check different file types
echo "JavaScript files (.js, .jsx):"
find . \( -name "*.js" -o -name "*.jsx" \) -not -path "*/node_modules/*" -exec grep -l "\|" {} \; 2>/dev/null | wc -l

echo ""
echo "Markdown files (.md):"
find . -name "*.md" -not -path "*/node_modules/*" -exec grep -l "\|" {} \; 2>/dev/null | wc -l

echo ""
echo "JSON files (.json):"
find . -name "*.json" -not -path "*/node_modules/*" -exec grep -l "\|" {} \; 2>/dev/null | wc -l

echo ""
echo "Shell scripts (.sh):"
find . -name "*.sh" -not -path "*/node_modules/*" -exec grep -l "\|" {} \; 2>/dev/null | wc -l

echo ""
echo "Python files (.py):"
find . -name "*.py" -not -path "*/node_modules/*" -exec grep -l "\|" {} \; 2>/dev/null | wc -l

echo ""
echo "Text files (.txt):"
find . -name "*.txt" -not -path "*/node_modules/*" -exec grep -l "\|" {} \; 2>/dev/null | wc -l

echo ""
echo "Sample occurrences:"
echo "==================="
grep -r "\|" . --exclude-dir=node_modules --exclude-dir=.git --exclude="analyze-personal.sh" 2>/dev/null | head -5

echo ""
echo "To clean all personal information, run:"
echo "  chmod +x deep-clean-personal.sh"
echo "  ./deep-clean-personal.sh"
