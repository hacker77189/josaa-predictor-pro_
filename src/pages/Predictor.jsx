import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Star } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import { motion } from 'framer-motion';

const Predictor = () => {
  const [systemType, setSystemType] = useState('NIT+'); // 'NIT+' or 'IIT'
  const [userRank, setUserRank] = useState('');
  const [category, setCategory] = useState('OPEN');
  const [gender, setGender] = useState('Gender-Neutral');
  const [quota, setQuota] = useState('OS');
  
  // Filters
  const [instTypes, setInstTypes] = useState([]);
  const [isOldNit, setIsOldNit] = useState(false);
  const [branchTypes, setBranchTypes] = useState([]);
  const [branchCodes, setBranchCodes] = useState([]);
  const [minPackage, setMinPackage] = useState(0);
  const [maxFee, setMaxFee] = useState(300000);
  const [locationTypes, setLocationTypes] = useState([]);
  const [sortBy, setSortBy] = useState('chance');

  const [allBranches, setAllBranches] = useState([]);
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const { user, setUser } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    // Fetch unique branches from backend
    api.get('/filters').then(res => {
      setAllBranches(res.data.branches || []);
    }).catch(console.error);
  }, []);

  const handleCheckboxChange = (setter, value) => {
    setter(prev => prev.includes(value) ? prev.filter(item => item !== value) : [...prev, value]);
  };

  const fetchPredictions = async () => {
    if (!userRank) return;
    
    setLoading(true);
    setError(null);

    try {
      const params = {
        rank: userRank,
        category,
        gender,
        quota: systemType === 'IIT' ? 'AI' : quota,
        systemType,
        instituteTypes: instTypes.join(','),
        isOldNit,
        branchTypes: branchTypes.join(','),
        branches: branchCodes.join(','),
        packageMin: minPackage,
        feeMax: maxFee,
        locationTypes: locationTypes.join(','),
        sortBy,
        limit: 500
      };

      const response = await api.get('/predict', { params });
      setResults(response.data.data);
    } catch (err) {
      console.error(err);
      setError('Failed to fetch predictions. Make sure the backend server is running.');
    } finally {
      setLoading(false);
    }
  };

  // Debounce the fetch when filters change
  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      fetchPredictions();
    }, 500);
    return () => clearTimeout(delayDebounceFn);
  }, [userRank, category, gender, quota, systemType, instTypes, isOldNit, branchTypes, branchCodes, minPackage, maxFee, locationTypes, sortBy]);

  const toggleBookmark = async (cutoffId) => {
    if (!user) {
      navigate('/auth');
      return;
    }
    try {
      const res = await api.post(`/users/bookmark/${cutoffId}`);
      setUser({ ...user, bookmarks: res.data.bookmarks });
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="flex flex-col md:flex-row gap-6">
      {/* Sidebar Filters */}
      <aside className="w-full md:w-80 flex-shrink-0 bg-dark-800/80 backdrop-blur border border-white/10 rounded-xl p-6 h-[calc(100vh-100px)] sticky top-24 overflow-y-auto custom-scrollbar">
        
        {/* System Toggle (IIT vs NIT+) */}
        <div className="flex bg-black/40 p-1 rounded-lg mb-6 relative">
          <motion.div 
            className="absolute top-1 bottom-1 w-[calc(50%-4px)] bg-primary-600 rounded-md shadow-lg"
            animate={{ left: systemType === 'NIT+' ? '4px' : '50%' }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
          />
          <button 
            onClick={() => setSystemType('NIT+')}
            className={`flex-1 py-2 text-sm font-bold z-10 transition-colors ${systemType === 'NIT+' ? 'text-white' : 'text-slate-400 hover:text-white'}`}
          >
            JEE Main (NIT+)
          </button>
          <button 
            onClick={() => setSystemType('IIT')}
            className={`flex-1 py-2 text-sm font-bold z-10 transition-colors ${systemType === 'IIT' ? 'text-white' : 'text-slate-400 hover:text-white'}`}
          >
            JEE Adv (IITs)
          </button>
        </div>

        <div className="flex justify-between items-center mb-6 border-t border-white/10 pt-6">
          <h3 className="text-xl font-bold">Filters</h3>
          <button className="text-primary-500 text-sm hover:underline" onClick={() => {
            setInstTypes([]); setIsOldNit(false); setBranchTypes([]); setBranchCodes([]);
            setMinPackage(0); setMaxFee(300000); setLocationTypes([]);
          }}>Clear All</button>
        </div>

        {/* Profile */}
        <div className="bg-primary-900/20 border border-primary-500/20 rounded-lg p-4 mb-6">
          <h4 className="text-primary-500 font-semibold mb-3">Your Profile</h4>
          <div className="space-y-3">
            <div>
              <label className="text-xs text-slate-400">Rank ({systemType === 'IIT' ? 'JEE Advanced' : 'JEE Main'})</label>
              <input type="number" className="w-full bg-black/20 border border-white/10 rounded p-2 text-sm outline-none focus:border-primary-500 mt-1" value={userRank} onChange={(e) => setUserRank(e.target.value)} placeholder="Enter Rank" />
              <p className="text-[10px] text-primary-400 mt-1 italic">* Showing ±10% cutoff margin</p>
            </div>
            <div>
              <label className="text-xs text-slate-400">Category</label>
              <select className="w-full bg-black/20 border border-white/10 rounded p-2 text-sm outline-none mt-1" value={category} onChange={(e) => setCategory(e.target.value)}>
                {['OPEN', 'OBC-NCL', 'EWS', 'SC', 'ST', 'OPEN (PwD)'].map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            <div>
              <label className="text-xs text-slate-400">Gender</label>
              <select className="w-full bg-black/20 border border-white/10 rounded p-2 text-sm outline-none mt-1" value={gender} onChange={(e) => setGender(e.target.value)}>
                <option value="Gender-Neutral">Gender-Neutral</option>
                <option value="Female-only (including Supernumerary)">Female-only</option>
              </select>
            </div>
            {systemType === 'NIT+' && (
              <div>
                <label className="text-xs text-slate-400">Quota</label>
                <select className="w-full bg-black/20 border border-white/10 rounded p-2 text-sm outline-none mt-1" value={quota} onChange={(e) => setQuota(e.target.value)}>
                  <option value="OS">Other State (OS)</option>
                  <option value="HS">Home State (HS)</option>
                </select>
              </div>
            )}
          </div>
        </div>

        {/* Inst Filters (Only for NIT+) */}
        {systemType === 'NIT+' && (
          <div className="mb-6">
            <h4 className="font-semibold mb-3 text-sm border-b border-white/10 pb-2">Institute</h4>
            <div className="space-y-2 text-sm text-slate-300">
              {['NIT', 'IIIT', 'GFTI'].map(t => (
                <label key={t} className="flex items-center gap-2 cursor-pointer hover:text-white">
                  <input type="checkbox" checked={instTypes.includes(t)} onChange={() => handleCheckboxChange(setInstTypes, t)} className="accent-primary-500" /> {t}s
                </label>
              ))}
              <label className="flex items-center gap-2 cursor-pointer mt-3 hover:text-white">
                <input type="checkbox" checked={isOldNit} onChange={() => setIsOldNit(!isOldNit)} className="accent-primary-500" /> Top/Old NITs Only
              </label>
            </div>
          </div>
        )}

        {/* Branch Filters */}
        <div className="mb-6">
          <h4 className="font-semibold mb-3 text-sm border-b border-white/10 pb-2">Branch</h4>
          <div className="space-y-2 text-sm text-slate-300">
            {['Circuital', 'Core'].map(t => (
              <label key={t} className="flex items-center gap-2 cursor-pointer hover:text-white">
                <input type="checkbox" checked={branchTypes.includes(t)} onChange={() => handleCheckboxChange(setBranchTypes, t)} className="accent-primary-500" /> {t} Branches
              </label>
            ))}
            <div className="h-px bg-white/10 my-3"></div>
            <div className="max-h-48 overflow-y-auto custom-scrollbar pr-2 space-y-2">
              {allBranches.length === 0 ? <span className="text-xs text-slate-500">Loading branches...</span> : 
                allBranches.map(b => (
                  <label key={b} className="flex items-start gap-2 cursor-pointer hover:text-white" title={b}>
                    <input type="checkbox" checked={branchCodes.includes(b)} onChange={() => handleCheckboxChange(setBranchCodes, b)} className="accent-primary-500 mt-1" /> 
                    <span className="leading-tight">{b.substring(0, 35)}{b.length > 35 ? '...' : ''}</span>
                  </label>
              ))}
            </div>
          </div>
        </div>

      </aside>

      {/* Main Content */}
      <section className="flex-1 pb-12">
        <div className="bg-dark-800/80 backdrop-blur border border-white/10 rounded-xl p-4 mb-6 flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="w-full md:w-1/2">
             <input type="text" placeholder="Filter results visually..." className="w-full bg-black/20 border border-white/10 rounded-full px-4 py-2 text-sm outline-none" disabled />
          </div>
          <div className="flex items-center gap-3 w-full md:w-auto">
            <span className="text-sm text-slate-400">Sort By:</span>
            <select value={sortBy} onChange={e => setSortBy(e.target.value)} className="bg-black/20 border border-white/10 rounded p-2 text-sm outline-none focus:border-primary-500 text-white">
              <option value="chance">Highest Chance</option>
              <option value="collegeThenBranch">Top Colleges & Branches</option>
              <option value="closestMatch">Closest Rank Match</option>
              <option value="nirfRanking">NIRF Ranking</option>
              <option value="highestPackage">Highest Package</option>
            </select>
          </div>
        </div>

        <div className="mb-4 text-slate-300 text-sm">
          Found <span className="text-white font-bold">{results.length}</span> matching seats for {systemType}
        </div>

        {loading ? (
          <div className="text-center py-20 text-slate-400 flex flex-col items-center">
             <div className="w-8 h-8 border-4 border-primary-500 border-t-transparent rounded-full animate-spin mb-4"></div>
             Analyzing JoSAA Cutoffs...
          </div>
        ) : error ? (
          <div className="text-center py-20 text-red-400">{error}</div>
        ) : results.length === 0 ? (
          <div className="text-center py-20 bg-dark-800/40 border border-white/5 rounded-xl border-dashed text-slate-400">
            <h3 className="text-lg text-white mb-2">No matching seats found</h3>
            <p>Try entering a valid rank or relaxing your branch filters.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
            {results.map((entry, idx) => {
              const college = entry.collegeDetails;
              
              let chanceClass = 'text-red-500';
              if (entry.chanceType === 'Safe') chanceClass = 'text-emerald-500';
              else if (entry.chanceType === 'Moderate') chanceClass = 'text-amber-500';

              const isBookmarked = user?.bookmarks?.includes(entry._id);

              return (
                <div key={entry._id} className="bg-dark-800/60 backdrop-blur border border-white/10 rounded-xl p-5 hover:bg-dark-800 hover:border-primary-500/50 transition-all shadow-lg group relative">
                  <button 
                    onClick={() => toggleBookmark(entry._id)}
                    className="absolute top-4 right-4 p-1.5 rounded-full bg-dark-900 border border-white/10 hover:border-primary-500 transition-colors z-10"
                    title={isBookmarked ? "Remove Bookmark" : "Save Bookmark"}
                  >
                    <Star className={`w-4 h-4 ${isBookmarked ? 'fill-amber-400 text-amber-400' : 'text-slate-400 group-hover:text-amber-400'}`} />
                  </button>

                  <div className="flex justify-between items-start mb-3 pr-10">
                    <div>
                      <h3 className="text-lg font-bold text-white">{college.name}</h3>
                      <div className="flex items-center gap-2 text-xs text-slate-400 mt-1">
                        <span className="bg-white/10 px-1.5 py-0.5 rounded text-[10px] uppercase text-white font-medium">{college.type}</span>
                        <span>NIRF: {college.nirfRanking || 'N/A'}</span>
                      </div>
                    </div>
                    <div className="flex flex-col items-end">
                      <span className={`text-lg font-bold ${chanceClass}`}>{entry.chanceType}</span>
                    </div>
                  </div>

                  <div className="text-sm font-medium text-slate-200 mb-4 flex items-center gap-2">
                    <span className="leading-tight">{entry.branchName}</span>
                  </div>

                  <div className="grid grid-cols-2 gap-3 bg-black/20 p-3 rounded-lg mb-4 text-sm border border-white/5">
                     <div>
                      <span className="block text-[10px] uppercase text-slate-400 mb-0.5">Quota</span>
                      <span className="font-semibold text-slate-200">{entry.quota}</span>
                    </div>
                    <div>
                      <span className="block text-[10px] uppercase text-slate-400 mb-0.5">Seat Type</span>
                      <span className="font-semibold text-slate-200">{entry.category} ({entry.gender.split('-')[0]})</span>
                    </div>
                  </div>

                  <div className="flex justify-between items-center pt-3 border-t border-white/10">
                    <div>
                      <span className="block text-[10px] uppercase text-slate-400 mb-0.5">Closing Rank</span>
                      <span className="font-bold text-primary-400 text-lg">{entry.closingRank}</span>
                    </div>
                    <Link to={`/college/${college._id}`} className="text-sm font-semibold bg-primary-600/20 text-primary-400 hover:bg-primary-600 hover:text-white px-3 py-1.5 rounded-lg transition-colors">View Details &rarr;</Link>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>
    </div>
  );
};

export default Predictor;
