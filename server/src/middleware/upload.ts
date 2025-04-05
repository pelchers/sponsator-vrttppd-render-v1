import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { v2 as cloudinary } from 'cloudinary';
import { CloudinaryStorage } from 'multer-storage-cloudinary';

// Get the uploads directory path based on environment
const getUploadsDir = () => {
  return process.env.NODE_ENV === 'production'
    ? '/opt/render/project/src/server/uploads'
    : path.join(__dirname, '../../uploads');
};

// Ensure directories exist
const uploadsDir = getUploadsDir();
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
  ? multer.diskStorage({
      destination: (req, file, cb) => {
        // Production storage logic using Render Disk
        let uploadPath = getUploadsDir();
        
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
        
        // Ensure the directory exists
        if (!fs.existsSync(uploadPath)) {
          fs.mkdirSync(uploadPath, { recursive: true });
        }
        
        cb(null, uploadPath);
      },
      filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
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

// Add file size and type limits
export const upload = multer({ 
  storage,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB file size limit
  },
  fileFilter: (req, file, cb) => {
    // Accept images only
    if (!file.originalname.match(/\.(jpg|jpeg|png|gif|PNG|JPG|JPEG|GIF)$/i)) {
      return cb(new Error('Only image files are allowed!'), false);
    }
    cb(null, true);
  }
});

// Add a diagnostic function to check disk access
export const checkDiskAccess = () => {
  const uploadsDir = getUploadsDir();
  console.log('Checking disk permissions for:', uploadsDir);
  try {
    fs.accessSync(uploadsDir, fs.constants.W_OK);
    console.log('✅ Disk is writable');
    return true;
  } catch (err) {
    console.error('❌ Disk is not writable:', err);
    return false;
  }
}; 