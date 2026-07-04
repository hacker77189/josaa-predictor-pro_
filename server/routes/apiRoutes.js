const express = require('express');
const mongoose = require('mongoose');
const router = express.Router();
const { College, Cutoff } = require('../models');

// GET /api/predict
router.get('/predict', async (req, res) => {
  try {
    const {
      rank, category, gender, quota, systemType = 'NIT+',
      instituteTypes, isOldNit, nirfRankingMax, stateFilter,
      branchTypes, branches, isHighPlacement,
      feeMax, packageMin, locationTypes,
      sortBy = 'chance', limit = 500, page = 1
    } = req.query;

    if (!rank || !category || !gender || !quota) {
      return res.status(400).json({ error: 'Rank, category, gender, and quota are required' });
    }

    const userRank = parseInt(rank);
    // User requested: "+-10% of the rank input"
    // To ensure we get enough results especially for very high ranks, we add a minimum buffer of 1000.
    const minRank = Math.min(userRank * 0.9, Math.max(1, userRank - 1000));
    const maxRank = Math.max(userRank * 1.1, userRank + 1000);

    // Build the Cutoff Match Pipeline
    const cutoffMatch = {
      category,
      gender,
      closingRank: { $gte: minRank, $lte: maxRank } 
    };

    // Quota only applies to NIT+ system (HS/OS), IITs usually have 'AI' quota
    if (systemType === 'NIT+') {
      cutoffMatch.quota = quota;
    } else if (systemType === 'IIT') {
      cutoffMatch.quota = 'AI'; // Most IITs use All India quota
    }

    if (branchTypes) cutoffMatch.branchType = { $in: branchTypes.split(',') };
    if (branches) cutoffMatch.branchName = { $in: branches.split(',') };
    if (isHighPlacement === 'true') cutoffMatch.isHighPlacement = true;

    // Build the College Match Pipeline
    const collegeMatch = {};

    if (systemType === 'IIT') {
      collegeMatch['collegeDetails.type'] = 'IIT';
    } else {
      // NIT+ system
      if (instituteTypes) {
        collegeMatch['collegeDetails.type'] = { $in: instituteTypes.split(',') };
      } else {
        collegeMatch['collegeDetails.type'] = { $in: ['NIT', 'IIIT', 'GFTI'] };
      }
    }

    if (isOldNit === 'true') collegeMatch['collegeDetails.isOldNit'] = true;
    if (nirfRankingMax) collegeMatch['collegeDetails.nirfRanking'] = { $lte: parseInt(nirfRankingMax) };
    if (stateFilter) collegeMatch['collegeDetails.state'] = { $in: stateFilter.split(',') };
    if (feeMax) collegeMatch['collegeDetails.tuitionFee'] = { $lte: parseInt(feeMax) };
    if (packageMin) collegeMatch['collegeDetails.averagePackage'] = { $gte: parseInt(packageMin) };
    if (locationTypes) collegeMatch['collegeDetails.locationType'] = { $in: locationTypes.split(',') };

    // Define Sorting
    let sortObj = {};
    switch (sortBy) {
      case 'highestPackage': sortObj = { 'collegeDetails.highestPackage': -1 }; break;
      case 'averagePackage': sortObj = { 'collegeDetails.averagePackage': -1 }; break;
      case 'nirfRanking': sortObj = { 'collegeDetails.nirfRanking': 1 }; break;
      case 'lowestFees': sortObj = { 'collegeDetails.tuitionFee': 1 }; break;
      case 'closestMatch': sortObj = { rankDifference: 1 }; break;
      case 'collegeThenBranch': 
        sortObj = { 'collegeDetails.nirfRanking': 1, 'closingRank': 1 }; // Group by top colleges first
        break;
      case 'chance': sortObj = { safetyScore: -1, 'collegeDetails.nirfRanking': 1 }; break;
      default: sortObj = { safetyScore: -1 };
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const pipeline = [
      { $match: cutoffMatch },
      // Join with College
      {
        $lookup: {
          from: 'colleges',
          localField: 'collegeId',
          foreignField: '_id',
          as: 'collegeDetails'
        }
      },
      { $unwind: '$collegeDetails' },
      { $match: collegeMatch },
      // Add dynamic fields (Chance, Difference)
      {
        $addFields: {
          rankDifference: { $subtract: ['$closingRank', userRank] },
          chanceType: {
            $switch: {
              branches: [
                { case: { $lt: [userRank, { $multiply: ['$closingRank', 0.8] }] }, then: 'Safe' },
                { case: { $lte: [userRank, '$closingRank'] }, then: 'Moderate' },
                { case: { $lte: [userRank, maxRank] }, then: 'Risky' }
              ],
              default: 'No Chance'
            }
          },
          safetyScore: {
            $subtract: ['$closingRank', userRank]
          }
        }
      },
      // Filter out 'No Chance'
      { $match: { chanceType: { $ne: 'No Chance' } } },
      { $sort: sortObj },
      { $skip: skip },
      { $limit: parseInt(limit) }
    ];

    const results = await Cutoff.aggregate(pipeline);

    res.json({
      success: true,
      count: results.length,
      data: results
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server error', detail: error.message });
  }
});

// GET /api/health
router.get('/health', (req, res) => {
  res.json({
    success: true,
    mongoState: mongoose.connection.readyState,
    mongoStateLabel: ['disconnected', 'connected', 'connecting', 'disconnecting'][mongoose.connection.readyState] || 'unknown'
  });
});

// GET /api/filters (To populate dropdowns on frontend)
router.get('/filters', async (req, res) => {
  try {
    const states = await College.distinct('state');
    // For branches, we want a unique array sorted alphabetically
    const rawBranches = await Cutoff.distinct('branchName');
    const branches = rawBranches.sort();
    
    // Fetch unique college names for search box
    const colleges = await College.find({}, 'name _id').sort({ nirfRanking: 1 });
    
    res.json({ states, branches, colleges });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server error', detail: error.message });
  }
});

// GET /api/colleges (List all colleges)
router.get('/colleges', async (req, res) => {
  try {
    const colleges = await College.find({}).sort({ nirfRanking: 1 });
    res.json(colleges);
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

// GET /api/colleges/:id
router.get('/colleges/:id', async (req, res) => {
  try {
    const college = await College.findById(req.params.id);
    if (!college) return res.status(404).json({ error: 'College not found' });
    
    const cutoffs = await Cutoff.find({ collegeId: req.params.id }).sort({ closingRank: 1 });
    
    res.json({ college, cutoffs });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
