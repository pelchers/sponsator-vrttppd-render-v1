import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { v2 as cloudinary } from 'cloudinary';
import { CloudinaryStorage } from 'multer-storage-cloudinary';

// Ensure directories exist
const uploadsDir = path.join(__dirname, '../../uploads');
const profilesDir = path.join(uploadsDir, 'profiles');
const projectsDir = path.join(uploadsDir, 'projects');
const articlesDir = path.join(uploadsDir, 'articles');
const postsDir = path.join(uploadsDir, 'posts');

if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir);
}
if (!fs.existsSync(profilesDir)) {
  fs.mkdirSync(profilesDir);
}
if (!fs.existsSync(projectsDir)) {
  fs.mkdirSync(projectsDir);
}
if (!fs.existsSync(articlesDir)) {
  fs.mkdirSync(articlesDir, { recursive: true });
}
if (!fs.existsSync(postsDir)) {
  fs.mkdirSync(postsDir, { recursive: true });
}

// Configure Cloudinary (only in production)
if (process.env.NODE_ENV === 'production') {
  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
  });
}

// Create storage engine based on environment
const storage = process.env.NODE_ENV === 'production'
  ? new CloudinaryStorage({
      cloudinary: cloudinary,
      params: {
        folder: 'sponsator',
        allowed_formats: ['jpg', 'jpeg', 'png', 'gif'],
        transformation: [{ width: 1200, crop: 'limit' }]
      }
    })
  : multer.diskStorage({
      destination: (req, file, cb) => {
        // Local storage logic
        let uploadPath = path.join(__dirname, '../../uploads');
        
        // Determine subdirectory based on route
        if (req.originalUrl.includes('/profiles')) {
          uploadPath = path.join(uploadPath, 'profiles');
        } else if (req.originalUrl.includes('/projects')) {
          uploadPath = path.join(uploadPath, 'projects');
        } else if (req.originalUrl.includes('/articles')) {
          uploadPath = path.join(uploadPath, 'articles');
        } else if (req.originalUrl.includes('/posts')) {
          uploadPath = path.join(uploadPath, 'posts');
        }
        
        cb(null, uploadPath);
      },
      filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
      }
    });

export const upload = multer({ storage }); 