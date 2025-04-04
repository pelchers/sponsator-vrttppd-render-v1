#!/bin/bash
echo "Starting build process..."

# Find all .tsx files and create lowercase symlinks
echo "Creating case-insensitive symlinks for .tsx files..."
find client/src -name "*.tsx" | while read file; do
  dir=$(dirname "$file")
  base=$(basename "$file")
  lower=$(echo "$base" | tr '[:upper:]' '[:lower:]')
  if [ "$base" != "$lower" ]; then
    echo "Creating symlink: $dir/$lower -> $base"
    ln -sf "$base" "$dir/$lower"
  fi
done

# Also handle .ts files
echo "Creating case-insensitive symlinks for .ts files..."
find client/src -name "*.ts" -not -name "*.d.ts" | while read file; do
  dir=$(dirname "$file")
  base=$(basename "$file")
  lower=$(echo "$base" | tr '[:upper:]' '[:lower:]')
  if [ "$base" != "$lower" ]; then
    echo "Creating symlink: $dir/$lower -> $base"
    ln -sf "$base" "$dir/$lower"
  fi
done

# Run the build
echo "Installing dependencies and building..."
cd client && npm install && npm run build