const User = require('../models/User');
const jwt = require('jsonwebtoken');
const { Cutoff } = require('../models');

const signToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET || 'josaasecret123', {
    expiresIn: '30d'
  });
};

const sendTokenResponse = (user, statusCode, res) => {
  const token = signToken(user._id);
  res.status(statusCode).json({
    success: true,
    token,
    user: { id: user._id, name: user.name, email: user.email, bookmarks: user.bookmarks }
  });
};

exports.register = async (req, res) => {
  try {
    const { name, email, password } = req.body;
    const user = await User.create({ name, email, password });
    sendTokenResponse(user, 201, res);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) return res.status(400).json({ error: 'Please provide an email and password' });

    const user = await User.findOne({ email }).select('+password');
    if (!user) return res.status(401).json({ error: 'Invalid credentials' });

    const isMatch = await user.matchPassword(password);
    if (!isMatch) return res.status(401).json({ error: 'Invalid credentials' });

    sendTokenResponse(user, 200, res);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

exports.getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    res.status(200).json({ success: true, data: user });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

exports.toggleBookmark = async (req, res) => {
  try {
    const cutoffId = req.params.id;
    const user = await User.findById(req.user.id);

    // Check if valid cutoff exists
    const cutoff = await Cutoff.findById(cutoffId);
    if (!cutoff) return res.status(404).json({ error: 'Cutoff seat not found' });

    const isBookmarked = user.bookmarks.includes(cutoffId);

    if (isBookmarked) {
      user.bookmarks = user.bookmarks.filter(id => id.toString() !== cutoffId);
    } else {
      user.bookmarks.push(cutoffId);
    }

    await user.save();
    res.status(200).json({ success: true, bookmarks: user.bookmarks });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getMyBookmarks = async (req, res) => {
  try {
    // Populate the bookmarks array
    const user = await User.findById(req.user.id).populate({
      path: 'bookmarks',
      populate: { path: 'collegeId' }
    });
    
    // Format them similarly to prediction results so the frontend can reuse the UI
    const formatted = user.bookmarks.map(cutoff => ({
      _id: cutoff._id,
      branchName: cutoff.branchName,
      quota: cutoff.quota,
      category: cutoff.category,
      gender: cutoff.gender,
      closingRank: cutoff.closingRank,
      openingRank: cutoff.openingRank,
      collegeDetails: cutoff.collegeId,
      chanceType: 'Bookmarked'
    }));

    res.status(200).json({ success: true, data: formatted });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
