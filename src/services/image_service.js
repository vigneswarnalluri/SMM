const multer = require('multer');
const sharp = require('sharp');
const path = require('path');

const storage = multer.diskStorage({
  destination: 'uploads/',
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname));
  }
});

const upload = multer({ storage });

async function generateThumbnail(input, output) {
  try {
    await sharp(input).resize(256, 256).toFile(output);
    return true;
  } catch (err) {
    return false;
  }
}

module.exports = { upload, generateThumbnail };
