const express = require('express');
const router = express.Router();
const {
    performTryOn, generateVideo,
    getTryOnHistory, getTryOn, analyseTryOn,
} = require('../controllers/tryonController');
const { protect } = require('../middleware/auth');
const upload = require('../middleware/upload');

router.post('/', protect, upload.single('userImage'), performTryOn);
router.post('/video', protect, generateVideo);
router.post('/analyse', protect, analyseTryOn);
router.get('/history', protect, getTryOnHistory);
router.get('/:id', protect, getTryOn);

module.exports = router;