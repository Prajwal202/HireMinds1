const multer = require('multer');
const path = require('path');
const crypto = require('crypto');

// Set storage engine
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    if (file.mimetype.startsWith('image/')) {
      cb(null, 'public/uploads/profile-images/');
    } else if (file.mimetype.includes('application/pdf') || 
               file.mimetype.includes('application/msword') || 
               file.mimetype.includes('application/vnd.openxmlformats-officedocument')) {
      cb(null, 'public/uploads/resumes/');
    } else {
      cb(new Error('Invalid file type'), null);
    }
  },
  filename: function (req, file, cb) {
    // Generate unique filename
    const uniqueSuffix = crypto.randomBytes(16).toString('hex');
    cb(null, uniqueSuffix + path.extname(file.originalname));
  }
});

// File filter
const fileFilter = (req, file, cb) => {
  // Allowed images
  const allowedImages = /jpeg|jpg|png|gif|webp/;
  // Allowed documents
  const allowedDocs = /pdf|doc|docx/;
  
  const extname = allowedImages.test(path.extname(file.originalname).toLowerCase()) ||
                  allowedDocs.test(path.extname(file.originalname).toLowerCase());
  
  const mimetype = allowedImages.test(file.mimetype) || 
                   allowedDocs.test(file.mimetype) ||
                   file.mimetype.includes('application/pdf') ||
                   file.mimetype.includes('application/msword') ||
                   file.mimetype.includes('application/vnd.openxmlformats-officedocument');

  if (mimetype && extname) {
    return cb(null, true);
  } else {
    cb(new Error('Invalid file type. Only images (JPEG, PNG, GIF, WebP) and documents (PDF, DOC, DOCX) are allowed.'));
  }
};

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB limit
  },
  fileFilter: fileFilter
});

module.exports = upload;
