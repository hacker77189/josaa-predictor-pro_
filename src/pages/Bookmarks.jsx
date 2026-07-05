import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { Link } from 'react-router-dom';
import { Star, MapPin } from 'lucide-react';
import api from '../services/api';

const Bookmarks = () => {
  const { user, setUser } = useAuth();
  const [bookmarks, setBookmarks] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchBookmarks = async () => {
      try {
        const res = await api.get('/users/bookmarks');
        setBookmarks(res.data.data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchBookmarks();
  }, [user]);

  const toggleBookmark = async (cutoffId) => {
    try {
      const res = await api.post(`/users/bookmark/${cutoffId}`);
      setUser({ ...user, bookmarks: res.data.bookmarks });
      // Remove from local state to update UI instantly
      setBookmarks(bookmarks.filter(b => b._id !== cutoffId));
    } catch (err) {
      console.error(err);
    }
  };

  if (loading) return <div className="text-center py-24 text-slate-400">Loading your bookmarks...</div>;

  return (
    <div className="max-w-6xl mx-auto pb-12">
      <div className="mb-10">
        <h1 className="text-4xl font-extrabold mb-2 text-white">Your Saved <span className="text-primary-400">Seats</span></h1>
        <p className="text-slate-400">Manage your bookmarked cutoffs and colleges here.</p>
      </div>

      {bookmarks.length === 0 ? (
        <div className="text-center py-24 bg-dark-800/40 border border-white/5 rounded-2xl border-dashed">
          <Star className="w-12 h-12 text-slate-600 mx-auto mb-4" />
          <h3 className="text-xl text-white mb-2 font-bold">No bookmarks yet</h3>
          <p className="text-slate-400 mb-6 max-w-md mx-auto">You haven't saved any seats. Go to the Predictor, find your best matches, and click the star icon to save them here.</p>
          <Link to="/predictor" className="bg-primary-600 hover:bg-primary-500 text-white px-6 py-3 rounded-lg font-semibold transition-colors">Go to Predictor</Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {bookmarks.map((entry) => {
            const college = entry.collegeDetails;
            return (
              <div key={entry._id} className="bg-dark-800/60 backdrop-blur border border-primary-500/20 rounded-xl p-5 hover:bg-dark-800 hover:border-primary-500/50 transition-all shadow-lg relative group">
                <button 
                  onClick={() => toggleBookmark(entry._id)}
                  className="absolute top-4 right-4 p-1.5 rounded-full bg-dark-900 border border-white/10 hover:border-red-500 transition-colors z-10"
                  title="Remove Bookmark"
                >
                  <Star className="w-4 h-4 fill-amber-400 text-amber-400 group-hover:hidden" />
                  <XIcon className="w-4 h-4 text-red-500 hidden group-hover:block" />
                </button>

                <div className="mb-4 pr-8">
                  <h3 className="text-lg font-bold text-white mb-1 leading-tight">{college.name}</h3>
                  <div className="flex items-center gap-2 text-xs text-slate-400">
                    <span className="flex items-center gap-1"><MapPin className="w-3 h-3"/>{college.state}</span>
                    <span>•</span>
                    <span>NIRF: {college.nirfRanking || 'N/A'}</span>
                  </div>
                </div>

                <div className="bg-black/30 rounded-lg p-3 mb-4">
                  <div className="text-sm font-semibold text-primary-300 mb-2">{entry.branchName}</div>
                  <div className="flex gap-2 mb-2">
                    <span className="text-[10px] bg-white/10 px-2 py-0.5 rounded uppercase">{entry.category}</span>
                    <span className="text-[10px] bg-white/10 px-2 py-0.5 rounded uppercase">{entry.gender.split('-')[0]}</span>
                    <span className="text-[10px] bg-white/10 px-2 py-0.5 rounded uppercase">{entry.quota}</span>
                  </div>
                  <div className="flex justify-between items-end mt-3 pt-3 border-t border-white/10">
                    <div>
                      <span className="block text-[10px] text-slate-400 uppercase">Closing Rank</span>
                      <span className="text-lg font-bold text-white">{entry.closingRank}</span>
                    </div>
                    <Link to={`/college/${college._id}`} className="text-xs text-primary-400 hover:text-white transition-colors">
                      View College &rarr;
                    </Link>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

const XIcon = ({className}) => <svg className={className} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>;

export default Bookmarks;
