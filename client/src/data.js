export const generateAdvancedMockData = () => {
  const data = [];
  
  const COLLEGES = [
    { name: "NIT Trichy", type: "NIT", state: "Tamil Nadu", nirf: 9, isOld: true, avgPkg: 12.5, highestPkg: 52, placementPercent: 95, fee: 62500, hostelFee: 25000, campusSize: 800, hostelRating: 4.2, codingCulture: 4.8, locationType: 'Urban' },
    { name: "NIT Surathkal", type: "NIT", state: "Karnataka", nirf: 12, isOld: true, avgPkg: 13.0, highestPkg: 54, placementPercent: 96, fee: 62500, hostelFee: 28000, campusSize: 295, hostelRating: 4.5, codingCulture: 4.9, locationType: 'Metro' },
    { name: "NIT Warangal", type: "NIT", state: "Telangana", nirf: 21, isOld: true, avgPkg: 11.5, highestPkg: 51, placementPercent: 94, fee: 62500, hostelFee: 26000, campusSize: 248, hostelRating: 4.0, codingCulture: 4.7, locationType: 'Urban' },
    { name: "MNNIT Allahabad", type: "NIT", state: "Uttar Pradesh", nirf: 49, isOld: true, avgPkg: 14.0, highestPkg: 55, placementPercent: 97, fee: 62500, hostelFee: 24000, campusSize: 222, hostelRating: 3.8, codingCulture: 4.9, locationType: 'Urban' },
    { name: "NIT Rourkela", type: "NIT", state: "Odisha", nirf: 16, isOld: true, avgPkg: 10.5, highestPkg: 45, placementPercent: 90, fee: 62500, hostelFee: 22000, campusSize: 647, hostelRating: 4.1, codingCulture: 4.5, locationType: 'Urban' },
    { name: "IIIT Hyderabad", type: "IIIT", state: "Telangana", nirf: 55, isOld: false, avgPkg: 23.0, highestPkg: 75, placementPercent: 100, fee: 150000, hostelFee: 35000, campusSize: 66, hostelRating: 4.6, codingCulture: 5.0, locationType: 'Metro' },
    { name: "IIIT Allahabad", type: "IIIT", state: "Uttar Pradesh", nirf: 89, isOld: false, avgPkg: 18.0, highestPkg: 60, placementPercent: 98, fee: 85000, hostelFee: 30000, campusSize: 100, hostelRating: 4.3, codingCulture: 4.9, locationType: 'Urban' }
  ];

  const BRANCHES = [
    { name: 'Computer Science and Engineering', code: 'CSE', type: 'Circuital', isCore: false, popScore: 100 },
    { name: 'Artificial Intelligence and Data Science', code: 'AI', type: 'Circuital', isCore: false, popScore: 95 },
    { name: 'Information Technology', code: 'IT', type: 'Circuital', isCore: false, popScore: 90 },
    { name: 'Electronics and Communication Engineering', code: 'ECE', type: 'Circuital', isCore: false, popScore: 85 },
    { name: 'Electrical and Electronics Engineering', code: 'EEE', type: 'Circuital', isCore: true, popScore: 75 },
    { name: 'Mechanical Engineering', code: 'ME', type: 'Core', isCore: true, popScore: 65 },
    { name: 'Civil Engineering', code: 'CE', type: 'Core', isCore: true, popScore: 50 },
    { name: 'Chemical Engineering', code: 'CHEM', type: 'Core', isCore: true, popScore: 45 }
  ];

  const CATEGORIES = ['OPEN', 'EWS', 'OBC-NCL', 'SC', 'ST'];
  const GENDERS = ['Gender-Neutral', 'Female-only (including Supernumerary)'];
  const QUOTAS = ['HS', 'OS'];

  COLLEGES.forEach(college => {
    BRANCHES.forEach(branch => {
      CATEGORIES.forEach(category => {
        GENDERS.forEach(gender => {
          QUOTAS.forEach(quota => {
            if (college.type === 'IIIT' && quota === 'HS') return;

            let baseRank = 2000;
            if (college.type === 'IIIT') baseRank -= 500;
            if (branch.code === 'CSE') baseRank -= 1000;
            if (branch.code === 'AI') baseRank -= 800;
            if (branch.type === 'Core') baseRank += 5000;
            if (branch.code === 'CE') baseRank += 10000;

            if (quota === 'HS') baseRank = Math.floor(baseRank * 1.3);
            if (gender === 'Female-only (including Supernumerary)') baseRank = Math.floor(baseRank * 1.5);
            
            const catMultipliers = { 'OPEN': 1, 'EWS': 0.15, 'OBC-NCL': 0.3, 'SC': 0.05, 'ST': 0.02 };
            let finalRank = Math.floor(baseRank * catMultipliers[category]);

            if (finalRank < 50) finalRank = Math.floor(Math.random() * 200) + 50;

            let pkgMultiplier = 1;
            if (branch.code === 'CSE' || branch.code === 'AI') pkgMultiplier = 1.4;
            if (branch.type === 'Core') pkgMultiplier = 0.7;

            data.push({
              institute: college.name,
              instituteType: college.type,
              state: college.state,
              nirf: college.nirf,
              isOldNit: college.isOld,
              avgPkg: parseFloat((college.avgPkg * pkgMultiplier).toFixed(1)),
              highestPkg: college.highestPkg,
              placementPercent: Math.min(100, Math.floor(college.placementPercent * (pkgMultiplier > 1 ? 1.05 : 0.95))),
              fee: college.fee,
              hostelFee: college.hostelFee,
              campusSize: college.campusSize,
              hostelRating: college.hostelRating,
              codingCulture: college.codingCulture,
              locationType: college.locationType,
              branch: branch.name,
              branchCode: branch.code,
              branchType: branch.type,
              isCore: branch.isCore,
              popScore: branch.popScore,
              category: category,
              gender: gender,
              quota: quota,
              openingRank: Math.floor(finalRank * 0.7),
              closingRank: finalRank
            });
          });
        });
      });
    });
  });

  return data;
};

export const JOSAA_DATA = generateAdvancedMockData();
