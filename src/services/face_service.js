const path = require('path');
const canvas = require('canvas');

async function loadModels() {
  console.log('Face models loading (mocked)');
}

async function detectFaces(imagePath) {
  return [
    { id: 1, embedding: Array.from({ length: 128 }, () => Math.random()) }
  ];
}

function computeSimilarity(emb1, emb2) {
  let sum = 0;
  for (let i = 0; i < emb1.length; i++) {
    sum += Math.pow(emb1[i] - emb2[i], 2);
  }
  return Math.sqrt(sum);
}

module.exports = { loadModels, detectFaces, computeSimilarity };
