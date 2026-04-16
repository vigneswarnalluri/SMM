const express = require('express');
const cors = require('cors');
const fs = require('fs-extra');
const { db, initializeDb } = require('./db/db_connection');
const { upload, generateThumbnail } = require('./services/image_service');
const { detectFaces, computeSimilarity } = require('./services/face_service');

// Ensure required directories exist
fs.ensureDirSync('uploads');
fs.ensureDirSync('thumbnails');

const app = express();
app.use(cors());
app.use(express.json());
app.use('/uploads', express.static('uploads'));

app.post('/api/media/upload', upload.single('image'), async (req, res) => {
  const filePath = req.file.path;
  const [id] = await db('media').insert({ file_path: filePath, status: 'uploaded' });
  
  res.json({ id, filePath });
  
  const thumbPath = `thumbnails/thumb-${req.file.filename}`;
  const success = await generateThumbnail(filePath, thumbPath);
  if (success) {
    await db('media').where({ id }).update({ thumbnail_path: thumbPath, status: 'processed' });
  }
});

app.post('/api/media/detect-faces', async (req, res) => {
  const { mediaId } = req.body;
  const media = await db('media').where({ id: mediaId }).first();
  const faces = await detectFaces(media.file_path);
  
  for (const f of faces) {
    await db('faces').insert({ media_id: mediaId, embedding: JSON.stringify(f.embedding) });
  }
  
  res.json({ message: 'Faces detected', faces });
});

app.get('/api/faces/similar', async (req, res) => {
  const { faceId } = req.query;
  const target = await db('faces').where({ id: faceId }).first();
  const targetEmb = JSON.parse(target.embedding);
  
  const all = await db('faces').whereNot({ id: faceId });
  const matches = all.filter(f => {
    const dist = computeSimilarity(targetEmb, JSON.parse(f.embedding));
    return dist < 0.6;
  });
  
  res.json(matches);
});

app.get('/api/media', async (req, res) => {
  const data = await db('media').select('*').orderBy('created_at', 'desc');
  res.json(data);
});

initializeDb().then(() => {
  const port = process.env.PORT || 3001;
  app.listen(port, '0.0.0.0', () => {
    console.log(`Server running on port ${port}`);
  });
});
