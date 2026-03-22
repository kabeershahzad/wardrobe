const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const { getGridFSBucket } = require('../config/db');

// Stream image from GridFS by ID
router.get('/:id', async (req, res) => {
  try {
    const bucket = getGridFSBucket();
    const fileId = new mongoose.Types.ObjectId(req.params.id);

    // Check file exists
    const files = await bucket.find({ _id: fileId }).toArray();
    if (!files || files.length === 0) {
      return res.status(404).json({ error: 'Image not found' });
    }

    const file = files[0];
    res.set('Content-Type', file.contentType || 'image/jpeg');
    res.set('Cache-Control', 'public, max-age=31536000');

    const downloadStream = bucket.openDownloadStream(fileId);
    downloadStream.pipe(res);
    downloadStream.on('error', () => res.status(404).json({ error: 'Image not found' }));
  } catch (err) {
    res.status(400).json({ error: 'Invalid image ID' });
  }
});

module.exports = router;
