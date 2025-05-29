#!/bin/bash

echo "🔍 Finding and cleaning personal information..."
echo "=============================================="
echo ""

# First, let's see what we're dealing with
echo "Files containing personal information:"
echo ""

# Find files with personal info (excluding this script and node_modules)
grep -r "\|" . \
  --exclude-dir=node_modules \
  --exclude-dir=.git \
  --exclude="clean-personal-info.sh" \
  --exclude="checklist.sh" \
  --exclude="sanitize-for-github.sh" \
  2>/dev/null | cut -d: -f1 | sort | uniq > files_with_personal_info.txt

# Count files
FILE_COUNT=$(wc -l < files_with_personal_info.txt)
echo "Found $FILE_COUNT files with personal information"
echo ""

# Show first 20 files
echo "First 20 files:"
head -20 files_with_personal_info.txt
echo ""

# Ask for confirmation
read -p "Do you want to remove personal information from these files? (y/n): " -n 1 -r
echo ""

if [[ $REPLY =~ ^[Yy]$ ]]; then
    echo ""
    echo "Cleaning files..."
    
    # Process each file
    while IFS= read -r file; do
        if [ -f "$file" ]; then
            # Use sed to replace personal info
            # For macOS, we need to use -i '' syntax
            sed -i '' 's///g' "$file" 2>/dev/null
            sed -i '' 's///g' "$file" 2>/dev/null
            sed -i '' 's/HCYT902NRF-//g' "$file" 2>/dev/null
            echo "✅ Cleaned: $file"
        fi
    done < files_with_personal_info.txt
    
    # Clean up temp file
    rm -f files_with_personal_info.txt
    
    echo ""
    echo "✅ Personal information removed!"
    echo ""
    echo "Running verification..."
    echo ""
    
    # Check again
    if grep -r "\|" . --exclude-dir=node_modules --exclude-dir=.git --exclude="clean-personal-info.sh" 2>/dev/null | grep -v "your_username\|yourusername"; then
        echo "⚠️  Some personal information may still remain in the files above"
    else
        echo "✅ No personal information found!"
    fi
else
    echo "Cancelled. No changes made."
    rm -f files_with_personal_info.txt
fi
