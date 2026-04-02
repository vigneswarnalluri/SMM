const multer = require('multer'); // Import the Multer middleware for handling file uploads
const sharp = require('sharp'); // Import the Sharp image processing library
const path = require('path'); // Import the path module to manage file extensions and directory paths

const storage = multer.diskStorage({ // Define the storage configuration for Multer
  destination: 'uploads/', // Set the target directory for original image uploads
  filename: (req, file, cb) => { // Define the logic for naming the uploaded file
    cb(null, Date.now() + path.extname(file.originalname)); // Use the current timestamp and original extension for a unique filename
  } // Close the filename naming logic
}); // Close the storage configuration

const upload = multer({ storage }); // Create a Multer upload instance with the defined storage settings

async function generateThumbnail(input, output) { // Define an asynchronous function to create 256x256 thumbnails
  try { // Begin the error handling block for image processing
    await sharp(input).resize(256, 256).toFile(output); // Resize the input image and save it to the output file path
    return true; // Return true to indicate successful thumbnail generation
  } catch (err) { // Begin the error handling block if the process fails
    return false; // Return false to indicate unsuccessful thumbnail generation
  } // End of the error handling block
} // End of the generateThumbnail function

module.exports = { upload, generateThumbnail }; // Export the upload middleware and thumbnail function for use in the app
