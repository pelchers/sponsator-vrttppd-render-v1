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
  
  // Create a map of original filenames to lowercase versions
  const fileMap = {};
  
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
        
        // Add to map for import fixing
        fileMap[baseName.replace(extension, '')] = lowerBaseName.replace(extension, '');
      }
    }
  }
  
  return fileMap;
}

// Function to fix imports in a file
function fixImportsInFile(filePath, fileMap) {
  if (!fs.existsSync(filePath)) return;
  
  let content = fs.readFileSync(filePath, 'utf8');
  let modified = false;
  
  // Fix imports like: import X from './Path'
  for (const [original, lowercase] of Object.entries(fileMap)) {
    const regex = new RegExp(`from\\s+['"]\\.\\/([^'\"/]*/)*${original}['"]`, 'g');
    if (regex.test(content)) {
      content = content.replace(regex, (match) => {
        return match.replace(original, lowercase);
      });
      modified = true;
    }
  }
  
  if (modified) {
    console.log(`Fixed imports in: ${filePath}`);
    fs.writeFileSync(filePath, content);
  }
}

// Process .tsx and .ts files
const srcDir = path.join(__dirname, 'src');

// First create lowercase versions of all files
const tsxFileMap = createLowercaseVersions(srcDir, '.tsx');
const tsFileMap = createLowercaseVersions(srcDir, '.ts');

// Combine the maps
const fileMap = { ...tsxFileMap, ...tsFileMap };

// Now fix imports in router file specifically
console.log("Fixing imports in router file...");
fixImportsInFile(path.join(srcDir, 'router', 'index.tsx'), fileMap);

// Fix imports in all .tsx files
console.log("Fixing imports in all .tsx files...");
function processFilesForImportFixes(dir) {
  const files = fs.readdirSync(dir, { withFileTypes: true });
  
  for (const file of files) {
    const fullPath = path.join(dir, file.name);
    
    if (file.isDirectory()) {
      processFilesForImportFixes(fullPath);
    } else if (file.name.endsWith('.tsx') || file.name.endsWith('.ts')) {
      fixImportsInFile(fullPath, fileMap);
    }
  }
}

processFilesForImportFixes(srcDir);

console.log("Prebuild process completed successfully!"); 