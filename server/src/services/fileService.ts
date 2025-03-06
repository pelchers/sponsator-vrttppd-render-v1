import path from 'path';
import { v4 as uuidv4 } from 'uuid';
import fs from 'fs';

// For local development, we'll store files in a local uploads directory
const UPLOAD_DIR = path.join(__dirname, '../../uploads');

export async function uploadFile(file: Express.Multer.File): Promise<string> {
  try {
    const filename = `${uuidv4()}-${file.originalname}`;
    const filepath = path.join(UPLOAD_DIR, filename);
    
    // Create uploads directory if it doesn't exist
    await fs.promises.mkdir(UPLOAD_DIR, { recursive: true });
    
    // Write file to disk
    await fs.promises.writeFile(filepath, file.buffer);
    
    // Return the public URL (in this case, just the path)
    return `/uploads/${filename}`;
  } catch (error) {
    console.error('Error uploading file:', error);
    throw new Error('Failed to upload file');
  }
}

export async function deleteFile(filepath: string): Promise<void> {
  try {
    // Remove the leading /uploads/ from the path
    const filename = filepath.replace('/uploads/', '');
    const fullPath = path.join(UPLOAD_DIR, filename);
    
    // Check if file exists before attempting to delete
    if (fs.existsSync(fullPath)) {
      await fs.promises.unlink(fullPath);
    }
  } catch (error) {
    console.error('Error deleting file:', error);
    throw new Error('Failed to delete file');
  }
} 