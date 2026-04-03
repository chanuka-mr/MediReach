const cloudinary = require('cloudinary').v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Check if Cloudinary credentials are available
const hasCloudinaryCreds = process.env.CLOUDINARY_CLOUD_NAME && 
                          process.env.CLOUDINARY_API_KEY && 
                          process.env.CLOUDINARY_API_SECRET &&
                          process.env.CLOUDINARY_CLOUD_NAME !== 'your_cloud_name';

if (hasCloudinaryCreds) {
    console.log('Cloudinary credentials found, using Cloudinary for image uploads');
    cloudinary.config({
        cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
        api_key: process.env.CLOUDINARY_API_KEY,
        api_secret: process.env.CLOUDINARY_API_SECRET,
    });
} else {
    console.log('Cloudinary credentials not found or invalid, using local storage fallback');
}

// Ensure uploads directory exists for local storage
const uploadsDir = path.join(__dirname, '..', 'uploads');
if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir, { recursive: true });
}

// Configure storage based on available credentials
let upload;

if (hasCloudinaryCreds) {
    // Use Cloudinary storage
    const storage = new CloudinaryStorage({
        cloudinary: cloudinary,
        params: {
            folder: 'MediReach-Prescriptions',
        },
    });
    upload = multer({ storage: storage });
} else {
    // Use local storage as fallback
    const storage = multer.diskStorage({
        destination: function (req, file, cb) {
            cb(null, uploadsDir);
        },
        filename: function (req, file, cb) {
            const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
            cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
        }
    });
    
    upload = multer({ 
        storage: storage,
        fileFilter: function (req, file, cb) {
            // Accept images and PDFs only
            if (file.mimetype.startsWith('image/') || file.mimetype === 'application/pdf') {
                cb(null, true);
            } else {
                cb(new Error('Only image and PDF files are allowed!'), false);
            }
        },
        limits: {
            fileSize: 5 * 1024 * 1024 // 5MB limit
        }
    });
}

module.exports = upload;
