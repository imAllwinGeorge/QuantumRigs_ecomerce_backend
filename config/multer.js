const multer = require('multer');
const path = require('path');
const fs = require('fs');

// // Function to ensure directory exists
// const ensureDirectoryExists = (directory) => {
//     if (!fs.existsSync(directory)) {
//         fs.mkdirSync(directory, { recursive: true });
//     }
// };

// // Create a storage engine with dynamic destination
// const storage = multer.diskStorage({
//     destination: (req, file, cb) => {
//         // Define directories dynamically based on route or logic
//         const routePath = req.baseUrl; // Base route of the request
//         let folderPath;

//         // if (routePath === '/user-profile') {
//         //     folderPath = './uploads/user-profile';
//         // } else if (routePath === '/product-images') {
//         //     folderPath = './uploads/product-images';
//         // } else {
//             folderPath = './uploads/general';
//         //}

//         // Ensure directory exists
//         ensureDirectoryExists(folderPath);

//         // Pass the folder path to multer
//         cb(null, folderPath);
//     },
//     filename: (req, file, cb) => {
//         // Define file naming convention (e.g., adding a timestamp to the original name)
//         const uniqueName = `${Date.now()}-${file.originalname}`;
//         cb(null, uniqueName);
//     }
// });

// // Initialize multer with the dynamic storage engine
// const upload = multer({ storage });




// Function to ensure a directory exists
const ensureDirectoryExists = (directory) => {
    if (!fs.existsSync(directory)) {
        fs.mkdirSync(directory, { recursive: true });
    }
};

// Create a storage engine
// const storage = multer.diskStorage({
//     destination: (req, file, cb) => {
//         const folderPath = path.resolve(__dirname, './uploads/images');

//         ensureDirectoryExists(folderPath);
//         cb(null, folderPath);
//     },
//     filename: (req, file, cb) => {
//         const uniqueName = `${Date.now()}-${file.originalname}`;
//         cb(null, uniqueName);
//     }
// });
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        const folderPath = './uploads/images';
        ensureDirectoryExists(folderPath);
        cb(null, folderPath);
    },
    filename: (req, file, cb) => {
        // Use the original file name and append a timestamp to it to avoid conflicts
        const uniqueName = `${Date.now()}-${file.originalname}.jpg`;
        cb(null, uniqueName);
    }
});


// Initialize multer with storage and file filters
const upload = multer({
    storage,
    limits: { fileSize: 5 * 1024 * 1024 }, // Limit file size to 5MB
    fileFilter: (req, file, cb) => {
        const allowedTypes = ['image/jpeg', 'image/png', 'image/jpg'];
        if (allowedTypes.includes(file.mimetype)) {
            cb(null, true);
        } else {
            cb(new Error('Invalid file type! Only JPEG, PNG, and JPG are allowed.'));
        }
    }
});

module.exports = {upload}