import multer from 'multer';
import path from 'path';
import fs from 'fs';

// Ensure uploads directories exist
const uploadsDir = path.join(__dirname, '../../uploads');
const profilesDir = path.join(uploadsDir, 'profiles');

if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir);
}
if (!fs.existsSync(profilesDir)) {
  fs.mkdirSync(profilesDir);
}

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    // Store profile images in the profiles subdirectory
    cb(null, profilesDir);
  },
  filename: function (req, file, cb) {
    // Include 'profile-' prefix for clarity
    const uniqueSuffix = `profile-${Date.now()}-${Math.round(Math.random() * 1E9)}`;
    cb(null, `${uniqueSuffix}${path.extname(file.originalname)}`);
  }
});

export const upload = multer({ 
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB limit
  }
}); 