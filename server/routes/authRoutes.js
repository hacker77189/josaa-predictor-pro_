const express = require('express');
const { register, login, getMe, toggleBookmark, getMyBookmarks } = require('../controllers/authController');
const { protect } = require('../middleware/auth');

const router = express.Router();

router.post('/register', register);
router.post('/login', login);
router.get('/me', protect, getMe);
router.post('/bookmark/:id', protect, toggleBookmark);
router.get('/bookmarks', protect, getMyBookmarks);

module.exports = router;
