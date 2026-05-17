const mongoose = require('mongoose');

const CollegeSchema = new mongoose.Schema({
  name: { type: String, required: true, index: true },
  type: { type: String, enum: ['NIT', 'IIIT', 'GFTI', 'IIT'], required: true },
  state: { type: String, required: true },
  nirfRanking: { type: Number },
  isOldNit: { type: Boolean, default: false },
  
  // Placement Filters
  averagePackage: { type: Number }, // in LPA
  highestPackage: { type: Number }, // in LPA
  placementPercentage: { type: Number },
  
  // College Life Filters
  hostelRating: { type: Number, min: 1, max: 5 },
  campusSize: { type: Number }, // in acres
  locationType: { type: String, enum: ['Metro', 'Urban', 'Rural'] },
  codingCultureRating: { type: Number, min: 1, max: 5 },
  
  // Fee Filters
  tuitionFee: { type: Number }, // per semester
  hostelFee: { type: Number } // per semester
});

const CutoffSchema = new mongoose.Schema({
  collegeId: { type: mongoose.Schema.Types.ObjectId, ref: 'College', required: true },
  
  // Branch Info (Denormalized for fast filtering)
  branchName: { type: String, required: true, index: true },
  branchType: { type: String, enum: ['Core', 'Circuital', 'Other'] },
  isHighPlacement: { type: Boolean, default: false },
  popularityScore: { type: Number, default: 5 },
  
  // Cutoff Info
  year: { type: Number, required: true },
  round: { type: Number, required: true },
  category: { type: String, required: true, index: true },
  gender: { type: String, required: true, index: true },
  quota: { type: String, required: true, index: true },
  
  openingRank: { type: Number, required: true },
  closingRank: { type: Number, required: true, index: true }
});

// Index for the primary prediction query
CutoffSchema.index({ category: 1, gender: 1, quota: 1, closingRank: 1 });

module.exports = {
  College: mongoose.model('College', CollegeSchema),
  Cutoff: mongoose.model('Cutoff', CutoffSchema)
};
