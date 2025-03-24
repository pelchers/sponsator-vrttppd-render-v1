import multer from 'multer';
import path from 'path';
import fs from 'fs';

// Ensure directories exist
const uploadsDir = path.join(__dirname, '../../uploads');
const profilesDir = path.join(uploadsDir, 'profiles');
const projectsDir = path.join(uploadsDir, 'projects');
const articlesDir = path.join(uploadsDir, 'articles');

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

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    // Determine the destination based on the route
    const url = req.originalUrl;
    let destination = uploadsDir;
    
    if (url.includes('/users/') || url.includes('/profile/')) {
      destination = profilesDir;
    } else if (url.includes('/projects/') || url.includes('/project/')) {
      destination = projectsDir;
    } else if (url.includes('/articles/')) {
      destination = articlesDir;
    }
    
    console.log('File upload destination:', {
      url: req.originalUrl,
      destination,
      file: file.originalname
    });
    
    cb(null, destination);
  },
  filename: function (req, file, cb) {
    // Create a unique filename with appropriate prefix
    const url = req.originalUrl;
    let prefix = 'file';
    
    if (url.includes('/users/') || url.includes('/profile/')) {
      prefix = 'profile';
    } else if (url.includes('/projects/') || url.includes('/project/')) {
      prefix = 'project';
    } else if (url.includes('/articles/')) {
      prefix = 'article';
    }
    
    const uniqueSuffix = `${prefix}-${Date.now()}-${Math.round(Math.random() * 1E9)}`;
    const filename = `${uniqueSuffix}${path.extname(file.originalname)}`;
    
    console.log('Generated filename:', filename);
    
    cb(null, filename);
  }
});

export const upload = multer({ 
  storage: storage,
  limits: {
    fileSize: 10 * 1024 * 1024 // 10MB limit for articles
  }
}); 