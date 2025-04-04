import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'
import fs from 'fs'

// Custom plugin to handle case-insensitive imports
const caseInsensitiveImports = () => {
  return {
    name: 'vite-plugin-case-insensitive-imports',
    resolveId(source: string, importer: string | undefined) {
      if (!importer || !source.startsWith('.')) return null;
      
      const importerDir = path.dirname(importer);
      const potentialPath = path.resolve(importerDir, source);
      
      // Try to find the file with the exact case
      if (fs.existsSync(potentialPath)) return null;
      
      // If not found, try to find it case-insensitively
      const dir = path.dirname(potentialPath);
      if (!fs.existsSync(dir)) return null;
      
      const basename = path.basename(potentialPath);
      const files = fs.readdirSync(dir);
      
      // Try to find a file that matches case-insensitively
      const matchingFile = files.find(file => file.toLowerCase() === basename.toLowerCase());
      if (matchingFile) {
        return path.join(dir, matchingFile);
      }
      
      // Try with extensions
      const extensions = ['.tsx', '.ts', '.jsx', '.js'];
      for (const ext of extensions) {
        const basenameWithoutExt = basename.replace(/\.[^/.]+$/, '');
        const basenameWithExt = `${basenameWithoutExt}${ext}`;
        const matchingFileWithExt = files.find(file => file.toLowerCase() === basenameWithExt.toLowerCase());
        if (matchingFileWithExt) {
          return path.join(dir, matchingFileWithExt);
        }
      }
      
      return null;
    }
  };
};

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    caseInsensitiveImports()
  ],
  server: {
    port: 5373
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src')
    }
  }
})
