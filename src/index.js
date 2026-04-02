const express = require('express'); // Import the Express framework
const cors = require('cors'); // Import the CORS middleware to handle browser requests
const { db, initializeDb } = require('./db/db_connection'); // Import the database connection and setup function
const { upload, generateThumbnail } = require('./services/image_service'); // Import image upload and thumbnail generation services
const { detectFaces, computeSimilarity } = require('./services/face_service'); // Import face detection and similarity calculation services

const app = express(); // Create an Express application instance
app.use(cors()); // Configure the server to accept cross-origin requests
app.use(express.json()); // Configure the server to parse incoming JSON payloads
app.use('/uploads', express.static('uploads')); // Serve the 'uploads' directory as a static file path

app.post('/api/media/upload', upload.single('image'), async (req, res) => { // Define the image upload endpoint
  const filePath = req.file.path; // Get the path of the newly uploaded file
  const [id] = await db('media').insert({ file_path: filePath, status: 'uploaded' }); // Insert the new media record into the database
  
  res.json({ id, filePath }); // Return the generated ID and file path to the user
  
  const thumbPath = `thumbnails/thumb-${req.file.filename}`; // Define the target path for the generated thumbnail
  const success = await generateThumbnail(filePath, thumbPath); // Generate the 256x256 thumbnail
  if (success) { // If the thumbnail generation was successful
    await db('media').where({ id }).update({ thumbnail_path: thumbPath, status: 'processed' }); // Update the database record with the thumbnail path
  } // End of the if statement for successful thumbnail generation
}); // End of the upload endpoint definition

app.post('/api/media/detect-faces', async (req, res) => { // Define the face detection endpoint
  const { mediaId } = req.body; // Retrieve the target media ID from the request body
  const media = await db('media').where({ id: mediaId }).first(); // Fetch the image details from the 'media' table
  const faces = await detectFaces(media.file_path); // Run the facial detection service on the image file
  
  for (const f of faces) { // Iterate through all faces detected in the image
    await db('faces').insert({ media_id: mediaId, embedding: JSON.stringify(f.embedding) }); // Save each face and its embedding to the database
  } // End of the face iteration
  
  res.json({ message: 'Faces detected', faces }); // Return the results of the detection to the user
}); // End of the detect-faces endpoint definition

app.get('/api/faces/similar', async (req, res) => { // Define the endpoint to find faces with high similarity
  const { faceId } = req.query; // Retrieve the ID of the face to compare against
  const target = await db('faces').where({ id: faceId }).first(); // Fetch the reference face embedding data from the database
  const targetEmb = JSON.parse(target.embedding); // Parse the stored JSON embedding back into a numerical array
  
  const all = await db('faces').whereNot({ id: faceId }); // Retrieve all other faces in the system for comparison
  const matches = all.filter(f => { // Filter to find relevant matches across all available faces
    const dist = computeSimilarity(targetEmb, JSON.parse(f.embedding)); // Calculate the Euclidean distance between the target and each candidate face
    return dist < 0.6; // Keep matches that have a similarity distance of less than 0.6
  }); // End of the filter operation
  
  res.json(matches); // Return the list of similar media records to the user
}); // End of the similar-faces endpoint definition

app.get('/api/media', async (req, res) => { // Define the endpoint to list all media records
  const data = await db('media').select('*').orderBy('created_at', 'desc'); // Retrieve all images ordered by their upload time
  res.json(data); // Send the list of media items back to the user
}); // End of the list-media endpoint definition

initializeDb().then(() => { // Initialize the database tables before starting the server
  app.listen(3001, () => console.log('Server running on 3001')); // Start the server on port 3001 and log a success message
}); // End of the server initialization
