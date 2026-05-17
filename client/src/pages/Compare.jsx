import React, { useState, useEffect, useRef } from 'react';
import { getCollege, getAllColleges } from '../services/api';
import { Search, X, CheckCircle, BarChart3, BookOpen, MapPin, Plus, Trophy } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer, Legend } from 'recharts';
import { motion } from 'framer-motion';

const Compare = () => {
  const [colleges, setColleges] = useState([]);
  const [search, setSearch] = useState('');
  const [selectedColleges, setSelectedColleges] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isFocused, setIsFocused] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    const fetchColleges = async () => {
      try {
        const res = await getAllColleges();
        setColleges(res);
      } catch (err) {
        console.error(err);
      }
    };
    fetchColleges();
  }, []);

  // Handle outside click to close dropdown
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsFocused(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleAdd = async (collegeId) => {
    if (selectedColleges.length >= 3) return;
    if (selectedColleges.find(c => c._id === collegeId)) return;
    
    setLoading(true);
    try {
      const data = await getCollege(collegeId);
      setSelectedColleges([...selectedColleges, data.college]);
      setSearch('');
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleRemove = (id) => {
    setSelectedColleges(selectedColleges.filter(c => c._id !== id));
  };

  const filteredColleges = colleges.filter(c => c.name.toLowerCase().includes(search.toLowerCase()));

  // Determine "Winners" for highlighting
  const getWinner = (field, type = 'max') => {
    if (selectedColleges.length < 2) return null;
    let winnerId = null;
    let bestVal = type === 'max' ? -Infinity : Infinity;

    selectedColleges.forEach(c => {
      const val = c[field] || (type === 'min' ? Infinity : 0);
      if (type === 'max' && val > bestVal) { bestVal = val; winnerId = c._id; }
      if (type === 'min' && val < bestVal) { bestVal = val; winnerId = c._id; }
    });
    return winnerId;
  };

  const winAvgPkg = getWinner('averagePackage', 'max');
  const winHighestPkg = getWinner('highestPackage', 'max');
  const winFee = getWinner('tuitionFee', 'min');
  const winCoding = getWinner('codingCultureRating', 'max');
  const winNirf = getWinner('nirfRanking', 'min');

  // Chart Data preparation
  const chartData = selectedColleges.map(c => ({
    name: c.name.replace('National Institute of Technology', 'NIT').replace('Indian Institute of Information Technology', 'IIIT'),
    'Avg Package': c.averagePackage || 0,
    'Highest Package': c.highestPackage || 0,
    'Tuition Fee (Lakhs)': (c.tuitionFee || 0) / 100000,
  }));

  return (
    <div className="max-w-6xl mx-auto pb-12">
      <div className="text-center mb-10">
        <h1 className="text-4xl font-extrabold mb-4 tracking-tight">Compare <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary-400 to-accent-400">Colleges</span></h1>
        <p className="text-slate-400 text-lg">Add up to 3 colleges to compare their placements, fees, and campus life side-by-side.</p>
      </div>

      {/* Search Bar */}
      <div className="flex justify-center mb-10 relative z-50">
        <div className="relative w-full max-w-2xl" ref={dropdownRef}>
          <Search className="absolute left-4 top-3.5 w-5 h-5 text-slate-400" />
          <input 
            type="text" 
            placeholder={selectedColleges.length >= 3 ? "Maximum 3 colleges reached" : "Search or select a college..."}
            value={search}
            onFocus={() => setIsFocused(true)}
            onChange={(e) => {
              setSearch(e.target.value);
              setIsFocused(true);
            }}
            className="w-full bg-dark-800/80 backdrop-blur border border-white/20 rounded-full pl-12 pr-4 py-3 outline-none focus:border-primary-500 shadow-xl transition-all"
            disabled={selectedColleges.length >= 3}
          />
          {isFocused && !loading && (
            <div className="absolute top-14 left-0 w-full bg-dark-800 border border-white/10 rounded-2xl shadow-2xl overflow-hidden max-h-72 overflow-y-auto">
              {filteredColleges.map(c => (
                <div 
                  key={c._id} 
                  onClick={() => {
                    handleAdd(c._id);
                    setIsFocused(false);
                  }}
                  className="p-4 hover:bg-white/5 cursor-pointer flex justify-between items-center border-b border-white/5 last:border-0 transition-colors"
                >
                  <div>
                    <div className="font-semibold text-white">{c.name}</div>
                    <div className="text-xs text-slate-400 mt-1">{c.type} • {c.state}</div>
                  </div>
                  {selectedColleges.find(s => s._id === c._id) ? (
                    <CheckCircle className="w-5 h-5 text-emerald-400"/>
                  ) : (
                    <Plus className="w-5 h-5 text-slate-400 hover:text-white" />
                  )}
                </div>
              ))}
              {filteredColleges.length === 0 && <div className="p-6 text-center text-slate-400">No colleges found matching "{search}"</div>}
            </div>
          )}
        </div>
      </div>

      {/* Empty States / Selection Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
        {[0, 1, 2].map(index => {
          const college = selectedColleges[index];
          return college ? (
            <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} key={college._id} className="bg-gradient-to-b from-dark-800 to-dark-900 border border-primary-500/30 rounded-2xl p-6 relative group shadow-lg">
              <button onClick={() => handleRemove(college._id)} className="absolute top-4 right-4 text-slate-400 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-opacity bg-dark-800 rounded-full p-1 border border-white/10"><X className="w-4 h-4"/></button>
              <div className="w-12 h-12 rounded-xl bg-primary-500/20 text-primary-400 flex items-center justify-center mb-4 font-bold text-xl">{college.name.charAt(0)}</div>
              <h3 className="font-bold text-lg mb-1 leading-tight text-white">{college.name}</h3>
              <p className="text-sm text-slate-400 mb-4">{college.state}</p>
              <div className="flex gap-2">
                <span className="bg-white/5 px-2 py-1 rounded text-xs border border-white/5">{college.type}</span>
                <span className="bg-white/5 px-2 py-1 rounded text-xs border border-white/5">NIRF: {college.nirfRanking}</span>
              </div>
            </motion.div>
          ) : (
            <div key={`empty-${index}`} className="border-2 border-dashed border-white/10 rounded-2xl p-6 flex flex-col items-center justify-center h-48 text-slate-500 bg-dark-800/20">
              <Plus className="w-8 h-8 mb-2 opacity-50" />
              <p>Add College {index + 1}</p>
            </div>
          );
        })}
      </div>

      {/* Visual Charts */}
      {selectedColleges.length > 1 && (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
          <div className="bg-dark-800/50 border border-white/10 rounded-2xl p-6">
            <h3 className="text-lg font-bold mb-6 text-center text-white">Average Package Comparison (LPA)</h3>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData} margin={{ top: 5, right: 10, left: -20, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#334155" vertical={false} />
                  <XAxis dataKey="name" stroke="#94a3b8" tick={{fontSize: 12}} />
                  <YAxis stroke="#94a3b8" />
                  <RechartsTooltip contentStyle={{ backgroundColor: '#1e293b', borderColor: '#334155', borderRadius: '8px' }} cursor={{fill: 'rgba(255,255,255,0.05)'}} />
                  <Bar dataKey="Avg Package" fill="#3b82f6" radius={[4, 4, 0, 0]} maxBarSize={60} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
          <div className="bg-dark-800/50 border border-white/10 rounded-2xl p-6">
            <h3 className="text-lg font-bold mb-6 text-center text-white">Tuition Fee Comparison (Lakhs)</h3>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData} margin={{ top: 5, right: 10, left: -20, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#334155" vertical={false} />
                  <XAxis dataKey="name" stroke="#94a3b8" tick={{fontSize: 12}} />
                  <YAxis stroke="#94a3b8" />
                  <RechartsTooltip contentStyle={{ backgroundColor: '#1e293b', borderColor: '#334155', borderRadius: '8px' }} cursor={{fill: 'rgba(255,255,255,0.05)'}} />
                  <Bar dataKey="Tuition Fee (Lakhs)" fill="#f59e0b" radius={[4, 4, 0, 0]} maxBarSize={60} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </motion.div>
      )}

      {/* Comparison Matrix Table */}
      {selectedColleges.length > 0 && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="overflow-x-auto bg-dark-800/80 backdrop-blur border border-white/10 rounded-2xl shadow-xl">
          <table className="w-full text-left border-collapse">
            <tbody className="text-sm">
              <tr className="bg-black/20 border-b border-white/10">
                <td className="p-5 font-bold text-white uppercase tracking-wider text-xs w-1/4">Location & Ranking</td>
                {selectedColleges.map(c => <td key={c._id} className="p-5 w-1/4"></td>)}
              </tr>
              <tr className="hover:bg-white/5 border-b border-white/5">
                <td className="p-5 text-slate-400 font-medium flex items-center gap-2"><MapPin className="w-4 h-4"/> Location</td>
                {selectedColleges.map(c => <td key={c._id} className="p-5 text-white">{c.state}</td>)}
              </tr>
              <tr className="hover:bg-white/5 border-b border-white/10">
                <td className="p-5 text-slate-400 font-medium flex items-center gap-2"><Trophy className="w-4 h-4"/> NIRF Ranking</td>
                {selectedColleges.map(c => (
                  <td key={c._id} className={`p-5 font-semibold ${c._id === winNirf ? 'text-emerald-400' : 'text-white'}`}>
                    {c.nirfRanking || 'N/A'} {c._id === winNirf && <span className="text-[10px] bg-emerald-500/20 text-emerald-400 px-2 py-1 rounded ml-2 uppercase">Best</span>}
                  </td>
                ))}
              </tr>

              <tr className="bg-black/20 border-b border-white/10">
                <td className="p-5 font-bold text-white uppercase tracking-wider text-xs" colSpan={4}>Placements & ROI</td>
              </tr>
              <tr className="hover:bg-white/5 border-b border-white/5">
                <td className="p-5 text-slate-400 font-medium flex items-center gap-2"><BarChart3 className="w-4 h-4"/> Average Package</td>
                {selectedColleges.map(c => (
                  <td key={c._id} className={`p-5 font-bold ${c._id === winAvgPkg ? 'text-emerald-400 text-lg' : 'text-white'}`}>
                    {c.averagePackage} LPA {c._id === winAvgPkg && <span className="text-[10px] bg-emerald-500/20 text-emerald-400 px-2 py-1 rounded ml-2 uppercase font-normal">Highest</span>}
                  </td>
                ))}
              </tr>
              <tr className="hover:bg-white/5 border-b border-white/5">
                <td className="p-5 text-slate-400 font-medium flex items-center gap-2"><BarChart3 className="w-4 h-4"/> Highest Package</td>
                {selectedColleges.map(c => (
                  <td key={c._id} className={`p-5 font-semibold ${c._id === winHighestPkg ? 'text-emerald-400' : 'text-slate-200'}`}>
                    {c.highestPackage} LPA
                  </td>
                ))}
              </tr>
              <tr className="hover:bg-white/5 border-b border-white/10">
                <td className="p-5 text-slate-400 font-medium flex items-center gap-2"><BookOpen className="w-4 h-4"/> Tuition Fee / Sem</td>
                {selectedColleges.map(c => (
                  <td key={c._id} className={`p-5 font-semibold ${c._id === winFee ? 'text-emerald-400' : 'text-slate-200'}`}>
                    ₹{(c.tuitionFee||0).toLocaleString('en-IN')} {c._id === winFee && <span className="text-[10px] bg-emerald-500/20 text-emerald-400 px-2 py-1 rounded ml-2 uppercase font-normal">Lowest</span>}
                  </td>
                ))}
              </tr>

              <tr className="bg-black/20 border-b border-white/10">
                <td className="p-5 font-bold text-white uppercase tracking-wider text-xs" colSpan={4}>Campus Life</td>
              </tr>
              <tr className="hover:bg-white/5 border-b border-white/5">
                <td className="p-5 text-slate-400 font-medium">Coding Culture (1-5)</td>
                {selectedColleges.map(c => (
                  <td key={c._id} className={`p-5 font-bold ${c._id === winCoding ? 'text-amber-400 text-lg' : 'text-amber-400/80'}`}>
                    ⭐ {c.codingCultureRating} {c._id === winCoding && <span className="text-[10px] bg-amber-500/20 text-amber-400 px-2 py-1 rounded ml-2 uppercase font-normal text-xs">Best</span>}
                  </td>
                ))}
              </tr>
              <tr className="hover:bg-white/5">
                <td className="p-5 text-slate-400 font-medium">Hostel Rating (1-5)</td>
                {selectedColleges.map(c => <td key={c._id} className="p-5 text-white">{c.hostelRating}</td>)}
              </tr>
            </tbody>
          </table>
        </motion.div>
      )}
    </div>
  );
};

export default Compare;
