const User = require('../models/User');
const jwt = require('jsonwebtoken');
const { Cutoff } = require('../models');

const signToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
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

exports.register = async (req, res, next) => {
  try {
    const { name, email, password } = req.body;
    const user = await User.create({ name, email, password });
    sendTokenResponse(user, 201, res);
  } catch (error) {
    next(error);
  }
};

exports.login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email }).select('+password');
    if (!user) return res.status(401).json({ success: false, error: 'Invalid credentials' });

    const isMatch = await user.matchPassword(password);
    if (!isMatch) return res.status(401).json({ success: false, error: 'Invalid credentials' });

    sendTokenResponse(user, 200, res);
  } catch (error) {
    next(error);
  }
};

exports.getMe = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id);
    res.status(200).json({
      success: true,
      user: { id: user._id, name: user.name, email: user.email, bookmarks: user.bookmarks }
    });
  } catch (error) {
    next(error);
  }
};

exports.toggleBookmark = async (req, res, next) => {
  try {
    const cutoffId = req.params.id;
    const user = await User.findById(req.user.id);

    const cutoff = await Cutoff.findById(cutoffId);
    if (!cutoff) return res.status(404).json({ success: false, error: 'Cutoff seat not found' });

    const isBookmarked = user.bookmarks.includes(cutoffId);

    if (isBookmarked) {
      user.bookmarks = user.bookmarks.filter(id => id.toString() !== cutoffId);
    } else {
      user.bookmarks.push(cutoffId);
    }

    await user.save();
    res.status(200).json({ success: true, bookmarks: user.bookmarks });
  } catch (error) {
    next(error);
  }
};

exports.getMyBookmarks = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id).populate({
      path: 'bookmarks',
      populate: { path: 'collegeId' }
    });

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
    next(error);
  }
};
