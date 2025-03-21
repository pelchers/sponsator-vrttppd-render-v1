import fs from 'fs';
import path from 'path';

const uploadDirs = [
  'profiles',
  'projects',
  'posts',
  'articles'
];

export function ensureUploadDirs() {
  uploadDirs.forEach(dir => {
    const dirPath = path.join(__dirname, '../../uploads', dir);
    if (!fs.existsSync(dirPath)) {
      fs.mkdirSync(dirPath, { recursive: true });
    }
  });
} 