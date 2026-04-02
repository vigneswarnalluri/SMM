# 🧩 PROJECT 1: Smart Media Manager (Image & Face System)

This backend system handles image management with automated processing.

## Tech Stack
- **Node.js** + **Express**
- **SQLite (Knex)**: For image and face data.
- **Sharp**: For thumbnail generation.
- **Face-api.js**: For facial detection and embedding extraction.

## API Documentation

### 1. Upload Image
`POST /api/media/upload`  
- **Accepts:** `multipart/form-data` (field name `image`)
- **Action:** Saves original file, records in DB, and triggers async thumbnail generation.
- **Response:**
  ```json
  {
    "id": 1,
    "url": "/uploads/unique-filename.jpg",
    "status": "uploaded"
  }
  ```

### 2. Generate Thumbnail (Background Job)
`POST /api/media/thumbnail`  
- **Accepts:** `{ "mediaId": 1 }`
- **Action:** Starts Sharp process to generate a 256x256 thumbnail.
- **Response:** `{ "message": "Thumbnail generation started", "status": "processing" }`

### 3. Detect Faces
`POST /api/media/detect-faces`  
- **Accepts:** `{ "mediaId": 1 }`
- **Action:** Runs face-detection models on the image and extracts 128-d embeddings.
- **Response:**
  ```json
  {
    "mediaId": 1,
    "faces": [
      { "id": 1, "embedding": [0.5, 0.2, ...] }
    ]
  }
  ```

### 4. Get Similar Faces
`GET /api/faces/similar?faceId=1`  
- **Action:** Compares the embedding of `faceId` against all other faces in the system using Euclidean distance. Returns matches with distance < 0.6.
- **Response:** List of similar faces sorted by similarity.

### 5. Fetch Media (Pagination)
`GET /api/media?limit=10&offset=0`  
- **Action:** Provides an ordered gallery of images with statuses and thumbnail paths.

---

## Face-Recognition & ML Environment
Given the restricted environment in this instance, real face detection is **Mocked** by default to prevent dependency crashes. 

**To enable real recognition:**
1. Download models: `ssd_mobilenetv1`, `face_landmark_68`, and `face_recognition` weights.
2. Place them in the `models/` directory.
3. Restart the server.

The system will automatically switch to real detection once these files are present.
