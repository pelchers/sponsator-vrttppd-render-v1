const fs = require('fs');
const path = require('path');

// Function to recursively list files
function listFiles(dir, indent = '') {
  try {
    const files = fs.readdirSync(dir);
    files.forEach(file => {
      const filePath = path.join(dir, file);
      const stats = fs.statSync(filePath);
      if (stats.isDirectory()) {
        console.log(`${indent}📁 ${file}`);
        listFiles(filePath, indent + '  ');
      } else {
        console.log(`${indent}📄 ${file}`);
      }
    });
  } catch (error) {
    console.error(`Error reading directory ${dir}:`, error);
  }
}

// Create symlinks for problematic files
function createSymlinks() {
  const symlinks = [
    { dir: 'src/pages/home', from: 'Home.tsx', to: 'home.tsx' },
    { dir: 'src/pages/auth', from: 'Login.tsx', to: 'login.tsx' },
    { dir: 'src/components/layout', from: 'Layout.tsx', to: 'layout.tsx' }
  ];

  symlinks.forEach(({ dir, from, to }) => {
    try {
      // Create directory if it doesn't exist
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
        console.log(`Created directory: ${dir}`);
      }

      // Check if source file exists
      const sourcePath = path.join(dir, from);
      if (fs.existsSync(sourcePath)) {
        // Create symlink
        const targetPath = path.join(dir, to);
        if (!fs.existsSync(targetPath)) {
          fs.symlinkSync(from, targetPath);
          console.log(`Created symlink: ${targetPath} -> ${from}`);
        }
      } else {
        console.log(`Source file not found: ${sourcePath}`);
      }
    } catch (error) {
      console.error(`Error creating symlink for ${from}:`, error);
    }
  });
}

console.log('📁 Project Structure Before:');
listFiles('src');

console.log('\nCreating symlinks...');
createSymlinks();

console.log('\n📁 Project Structure After:');
listFiles('src'); 