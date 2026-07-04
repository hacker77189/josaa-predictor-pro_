const path = require('path');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const axios = require('axios');
const csv = require('csv-parser');
const { College, Cutoff, User } = require('../models');

dotenv.config({ path: path.join(__dirname, '../.env') });

const CSV_NIT_URL = 'https://raw.githubusercontent.com/Quantum-Codes/JoSAA_2024/main/exported_data/csv/josaa24.csv';
const CSV_IIT_URL = 'https://raw.githubusercontent.com/Quantum-Codes/JoSAA_2024/main/exported_data/csv/ORCR.csv';

const determineType = (name) => {
  const upper = name.toUpperCase();
  if (upper.includes('INDIAN INSTITUTE OF TECHNOLOGY') || upper.startsWith('IIT ')) return 'IIT';
  if (upper.includes('NATIONAL INSTITUTE OF TECHNOLOGY')) return 'NIT';
  if (upper.includes('INDIAN INSTITUTE OF INFORMATION TECHNOLOGY')) return 'IIIT';
  return 'GFTI';
};

const determineBranchType = (branchName) => {
  const circuitalKeywords = ['COMPUTER', 'ELECTRONICS', 'ELECTRICAL', 'INFORMATION TECHNOLOGY', 'ARTIFICIAL INTELLIGENCE', 'DATA SCIENCE', 'MATHEMATICS AND COMPUTING'];
  const upper = branchName.toUpperCase();
  for (let kw of circuitalKeywords) {
    if (upper.includes(kw)) return 'Circuital';
  }
  return 'Core';
};

const seedDatabase = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/josaa_pro');
    console.log('MongoDB Connected for Seeding');

    console.log('Clearing existing data...');
    await College.deleteMany({});
    await Cutoff.deleteMany({});
    
    // --------------------------------------------------
    // Fetch NIT+ Data (josaa24.csv)
    // --------------------------------------------------
    console.log('Downloading NIT/IIIT/GFTI CSV from GitHub...');
    const responseNit = await axios({ method: 'get', url: CSV_NIT_URL, responseType: 'stream' });

    const nitResults = await new Promise((resolve, reject) => {
      const results = [];
      responseNit.data
        .pipe(csv(['Institute', 'Academic Program Name', 'Quota', 'Seat Type', 'Gender', 'Opening Rank', 'Closing Rank']))
        .on('data', (data) => {
          if (data.Institute !== 'Institute') results.push(data);
        })
        .on('end', () => resolve(results))
        .on('error', reject);
    });
    console.log(`Parsed ${nitResults.length} NIT+ rows.`);

    // --------------------------------------------------
    // Fetch IIT Data (ORCR.csv)
    // --------------------------------------------------
    console.log('Downloading IIT CSV from GitHub...');
    const responseIit = await axios({ method: 'get', url: CSV_IIT_URL, responseType: 'stream' });

    const iitResults = await new Promise((resolve, reject) => {
      const results = [];
      responseIit.data
        // ORCR.csv lacks headers, structure: Institute,Program,Category,Gender,Opening Rank,Closing Rank
        .pipe(csv(['Institute', 'Academic Program Name', 'Seat Type', 'Gender', 'Opening Rank', 'Closing Rank']))
        .on('data', (data) => {
          // Add default 'AI' quota since IITs are All India
          data.Quota = 'AI';
          results.push(data);
        })
        .on('end', () => resolve(results))
        .on('error', reject);
    });
    console.log(`Parsed ${iitResults.length} IIT rows.`);

    // Combine all results
    const allResults = [...nitResults, ...iitResults];
    console.log(`Total rows to process: ${allResults.length}`);

    // 1. Extract Unique Colleges
    const uniqueCollegeNames = [...new Set(allResults.map(r => r.Institute))];
    console.log(`Found ${uniqueCollegeNames.length} unique colleges.`);

    const collegesToInsert = uniqueCollegeNames.map((name, index) => {
      const type = determineType(name);
      
      let nirfRanking = index + 1; 
      if (type === 'IIT') nirfRanking = Math.floor(Math.random() * 20) + 1;
      else if (type === 'NIT') nirfRanking = Math.floor(Math.random() * 30) + 10;
      else if (type === 'IIIT') nirfRanking = Math.floor(Math.random() * 50) + 40;
      
      let avgPkg = type === 'IIT' ? 20 + Math.random() * 15 : type === 'NIT' ? 12 + Math.random() * 8 : 10 + Math.random() * 10;

      return {
        name,
        type,
        state: 'Various', 
        nirfRanking,
        isOldNit: type === 'NIT' && name.includes('Surathkal') || name.includes('Trichy') || name.includes('Warangal'),
        averagePackage: parseFloat(avgPkg.toFixed(1)),
        highestPackage: parseFloat((avgPkg * 4).toFixed(1)),
        placementPercentage: Math.floor(80 + Math.random() * 20),
        hostelRating: parseFloat((3 + Math.random() * 2).toFixed(1)),
        codingCultureRating: parseFloat((3 + Math.random() * 2).toFixed(1)),
        tuitionFee: type === 'IIT' ? 100000 : 62500,
      };
    });

    const insertedColleges = await College.insertMany(collegesToInsert);
    console.log(`Inserted ${insertedColleges.length} colleges into MongoDB.`);

    const collegeMap = {};
    insertedColleges.forEach(c => collegeMap[c.name] = c._id);

    // 2. Map and Insert Cutoffs
    const cutoffBatchSize = 2000;
    let cutoffsToInsert = [];
    let insertedCount = 0;
    
    for (let i = 0; i < allResults.length; i++) {
      const row = allResults[i];
      let closingRank = parseFloat(row['Closing Rank']);
      let openingRank = parseFloat(row['Opening Rank']);
      
      // Some closing ranks might have 'P' appended or be invalid
      if (isNaN(closingRank) || closingRank <= 0) continue;

      cutoffsToInsert.push({
        collegeId: collegeMap[row.Institute],
        branchName: row['Academic Program Name'],
        branchType: determineBranchType(row['Academic Program Name']),
        category: row['Seat Type'] === 'OPEN' ? 'OPEN' : row['Seat Type'] === 'OPEN (PwD)' ? 'OPEN' : row['Seat Type'],
        gender: row.Gender,
        quota: row.Quota,
        openingRank: openingRank,
        closingRank: closingRank,
        year: 2024,
        round: 6,
        isHighPlacement: determineBranchType(row['Academic Program Name']) === 'Circuital'
      });

      if (cutoffsToInsert.length >= cutoffBatchSize || i === allResults.length - 1) {
        await Cutoff.insertMany(cutoffsToInsert);
        insertedCount += cutoffsToInsert.length;
        console.log(`Inserted chunk... Total inserted: ${insertedCount}`);
        cutoffsToInsert = [];
      }
    }

    console.log('Seeding completely finished! You can now use the predictor.');
    process.exit();
  } catch (error) {
    console.error('Seeder error:', error);
    process.exit(1);
  }
};

seedDatabase();
