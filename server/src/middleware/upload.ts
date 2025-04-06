import multer from 'multer';
import path from 'path';
import fs from 'fs';

// Define environment-specific upload paths
const getUploadsDir = () => {
  if (process.env.NODE_ENV === 'production') {
    // Render Disk Storage path
    return '/opt/render/project/src/server/uploads';
  } else {
    // Local development path
    return path.join(__dirname, '../../uploads');
  }
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

// Create storage engine based on environment
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    // Get the base uploads directory
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
    
    // Ensure directory exists
    if (!fs.existsSync(uploadPath)) {
      fs.mkdirSync(uploadPath, { recursive: true });
    }
    
    cb(null, uploadPath);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

// Fallback to Cloudinary if specified in environment (not used by default)
let cloudinaryStorage = null;
if (process.env.USE_CLOUDINARY === 'true') {
  try {
    const cloudinary = require('cloudinary').v2;
    const { CloudinaryStorage } = require('multer-storage-cloudinary');
    
    cloudinary.config({
      cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
      api_key: process.env.CLOUDINARY_API_KEY,
      api_secret: process.env.CLOUDINARY_API_SECRET
    });
    
    cloudinaryStorage = new CloudinaryStorage({
      cloudinary: cloudinary,
      params: {
        folder: 'sponsator',
        allowed_formats: ['jpg', 'jpeg', 'png', 'gif'],
        transformation: [{ width: 1200, crop: 'limit' }]
      }
    });
    
    console.log('Cloudinary storage configured as fallback');
  } catch (error) {
    console.warn('Cloudinary configuration failed, using disk storage only:', error.message);
  }
}

// Use the appropriate storage
const activeStorage = process.env.USE_CLOUDINARY === 'true' && cloudinaryStorage 
  ? cloudinaryStorage 
  : storage;

export const upload = multer({ 
  storage: activeStorage,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
  },
  fileFilter: (req, file, cb) => {
    // Accept images and PDFs
    const filetypes = /jpeg|jpg|png|gif|pdf/;
    const mimetype = filetypes.test(file.mimetype);
    const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
    
    if (mimetype && extname) {
      return cb(null, true);
    }
    
    cb(new Error('Only image and PDF files are allowed'));
  }
});

// Export the function to get uploads directory for other uses
export { getUploadsDir };

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