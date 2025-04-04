import fs from 'fs';
import path from 'path';

// Function to recursively list files
function listFiles(dir: string, indent = '') {
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

// List files in the src directory
console.log('📁 Project Structure:');
listFiles('src'); 