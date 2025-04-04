import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

console.log("Starting prebuild process...");

// Function to create lowercase symlinks/copies
function createLowercaseVersions(dir, extension) {
  console.log(`Processing ${extension} files in ${dir}...`);
  
  const files = fs.readdirSync(dir, { withFileTypes: true });
  
  for (const file of files) {
    const fullPath = path.join(dir, file.name);
    
    if (file.isDirectory()) {
      // Recursively process subdirectories
      createLowercaseVersions(fullPath, extension);
    } else if (file.name.endsWith(extension)) {
      const baseName = file.name;
      const lowerBaseName = baseName.toLowerCase();
      
      // Only create a copy if the case differs
      if (baseName !== lowerBaseName) {
        console.log(`Creating lowercase version: ${dir}/${lowerBaseName} -> ${baseName}`);
        
        // Read the original file and write to lowercase filename
        const content = fs.readFileSync(fullPath, 'utf8');
        fs.writeFileSync(path.join(dir, lowerBaseName), content);
      }
    }
  }
}

// Process .tsx and .ts files
const srcDir = path.join(__dirname, 'src');
createLowercaseVersions(srcDir, '.tsx');
createLowercaseVersions(srcDir, '.ts');

console.log("Prebuild process completed successfully!"); 