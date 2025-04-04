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

// Add this function to specifically fix the ProfileEditForm.tsx file
function fixProfileEditFormImports() {
  const filePath = path.join(__dirname, 'src', 'components', 'input', 'forms', 'ProfileEditForm.tsx');
  if (fs.existsSync(filePath)) {
    console.log("Fixing imports in ProfileEditForm.tsx...");
    let content = fs.readFileSync(filePath, 'utf8');
    
    // Replace Layout import with lowercase
    content = content.replace(
      /import Layout from ['"]@\/components\/layout\/Layout['"]/g,
      "import Layout from '@/components/layout/layout'"
    );
    
    // Also replace any other uppercase imports
    content = content.replace(
      /import Layout from ['"]\.\.\/\.\.\/\.\.\/components\/layout\/Layout['"]/g,
      "import Layout from '../../../components/layout/layout'"
    );
    
    fs.writeFileSync(filePath, content);
    console.log("Fixed imports in ProfileEditForm.tsx");
  }
}

// Call this function after processing all files
fixProfileEditFormImports();

// Add this function to fix Layout imports in all files
function fixLayoutImportsInAllFiles() {
  console.log("Fixing Layout imports in all files...");
  
  function processDirectory(dir) {
    const files = fs.readdirSync(dir, { withFileTypes: true });
    
    for (const file of files) {
      const fullPath = path.join(dir, file.name);
      
      if (file.isDirectory()) {
        processDirectory(fullPath);
      } else if (file.name.endsWith('.tsx') || file.name.endsWith('.ts')) {
        let content = fs.readFileSync(fullPath, 'utf8');
        let modified = false;
        
        // Fix Layout imports
        if (content.includes('layout/Layout')) {
          content = content.replace(
            /from ['"](@\/components\/layout\/Layout|\.\.\/\.\.\/\.\.\/components\/layout\/Layout)['"]/g,
            (match) => match.replace('Layout', 'layout')
          );
          modified = true;
        }
        
        if (modified) {
          fs.writeFileSync(fullPath, content);
          console.log(`Fixed Layout imports in: ${fullPath}`);
        }
      }
    }
  }
  
  processDirectory(path.join(__dirname, 'src'));
}

// Call this function after processing all files
fixLayoutImportsInAllFiles();

// Create a symlink for Layout.tsx
function createLayoutSymlink() {
  const layoutDir = path.join(__dirname, 'src', 'components', 'layout');
  const layoutFile = path.join(layoutDir, 'layout.tsx');
  const layoutUpperFile = path.join(layoutDir, 'Layout.tsx');
  
  if (fs.existsSync(layoutFile) && !fs.existsSync(layoutUpperFile)) {
    console.log("Creating symlink for Layout.tsx...");
    fs.copyFileSync(layoutFile, layoutUpperFile);
    console.log("Created symlink for Layout.tsx");
  }
}

// Call this function after processing all files
createLayoutSymlink();

console.log("Prebuild process completed successfully!"); 