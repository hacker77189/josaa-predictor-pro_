const express = require('express');
const { register, login, getMe, toggleBookmark, getMyBookmarks } = require('../controllers/authController');
const { protect } = require('../middleware/auth');
const { validateRegister, validateLogin } = require('../middleware/validate');

const router = express.Router();

router.post('/register', validateRegister, register);
router.post('/login', validateLogin, login);
router.get('/me', protect, getMe);
router.post('/bookmark/:id', protect, toggleBookmark);
router.get('/bookmarks', protect, getMyBookmarks);

module.exports = router;
