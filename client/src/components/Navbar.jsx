import React, { useState, useEffect, useRef } from 'react';
import { Search, Map, LogOut, User as UserIcon } from 'lucide-react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';

const Navbar = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  
  const [search, setSearch] = useState('');
  const [colleges, setColleges] = useState([]);
  const [isFocused, setIsFocused] = useState(false);
  const searchRef = useRef(null);

  useEffect(() => {
    // Fetch unique colleges for search autocomplete
    api.get('/filters').then(res => {
      setColleges(res.data.colleges || []);
    }).catch(console.error);
  }, []);

  // Handle outside click
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (searchRef.current && !searchRef.current.contains(event.target)) {
        setIsFocused(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const navLinkClass = (path) => 
    `transition-colors ${location.pathname === path ? 'text-white font-semibold' : 'text-slate-400 hover:text-white'}`;

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const filteredColleges = search.length > 0 ? colleges.filter(c => c.name.toLowerCase().includes(search.toLowerCase())).slice(0, 8) : [];

  return (
    <nav className="fixed top-0 w-full h-16 bg-dark-900/80 backdrop-blur-lg border-b border-white/10 z-50">
      <div className="max-w-[1400px] mx-auto px-6 h-full flex justify-between items-center">
        <Link to="/" className="text-xl font-bold flex items-center gap-2">
          <Map className="text-primary-500" />
          <span>JoSAA Predictor <span className="text-primary-500">Pro</span></span>
        </Link>
        
        <div className="hidden md:flex gap-8 items-center text-sm">
          <Link to="/" className={navLinkClass('/')}>Home</Link>
          <Link to="/predictor" className={navLinkClass('/predictor')}>Predictor</Link>
          <Link to="/compare" className={navLinkClass('/compare')}>Compare</Link>
          {user && (
            <Link to="/bookmarks" className={`${navLinkClass('/bookmarks')} flex items-center gap-1`}>
              Bookmarks 
              {user?.bookmarks?.length > 0 && (
                <span className="bg-primary-500 text-white text-[10px] px-1.5 py-0.5 rounded-full">
                  {user.bookmarks.length}
                </span>
              )}
            </Link>
          )}
        </div>

        <div className="flex items-center gap-4">
          {/* Global Search */}
          <div className="relative hidden lg:block" ref={searchRef}>
            <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
            <input 
              type="text" 
              placeholder="Search colleges..." 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              onFocus={() => setIsFocused(true)}
              className="bg-white/5 border border-white/10 rounded-full py-1.5 pl-9 pr-4 text-sm focus:border-primary-500 outline-none w-48 transition-all focus:w-72 focus:bg-dark-800"
            />
            
            {/* Autocomplete Dropdown */}
            {isFocused && search.length > 0 && (
              <div className="absolute top-10 right-0 w-80 bg-dark-800 border border-white/10 rounded-xl shadow-2xl overflow-hidden py-2 mt-2">
                {filteredColleges.length > 0 ? (
                  filteredColleges.map(c => (
                    <div 
                      key={c._id}
                      onClick={() => {
                        setIsFocused(false);
                        setSearch('');
                        navigate(`/college/${c._id}`);
                      }}
                      className="px-4 py-2 hover:bg-white/5 cursor-pointer text-sm text-slate-200 transition-colors line-clamp-1"
                    >
                      {c.name}
                    </div>
                  ))
                ) : (
                  <div className="px-4 py-2 text-sm text-slate-400">No colleges found</div>
                )}
              </div>
            )}
          </div>
          
          {user ? (
            <div className="flex items-center gap-4 ml-2">
              <div className="flex items-center gap-2 text-sm text-slate-300 bg-white/5 px-3 py-1.5 rounded-full border border-white/5">
                <UserIcon className="w-4 h-4 text-primary-400" />
                <span className="font-medium">{user.name.split(' ')[0]}</span>
              </div>
              <button 
                onClick={handleLogout}
                className="text-slate-400 hover:text-red-400 transition-colors"
                title="Logout"
              >
                <LogOut className="w-5 h-5" />
              </button>
            </div>
          ) : (
            <Link to="/auth" className="bg-gradient-to-r from-primary-600 to-accent-600 text-white px-5 py-1.5 rounded-lg text-sm font-semibold hover:shadow-[0_0_15px_rgba(59,130,246,0.5)] transition-shadow">
              Sign In
            </Link>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
