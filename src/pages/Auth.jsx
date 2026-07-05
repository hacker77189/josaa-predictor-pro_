import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';

const Auth = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [fieldErrors, setFieldErrors] = useState({});
  const [loading, setLoading] = useState(false);

  const { login, register } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const from = location.state?.from || '/';

  const validate = () => {
    const errors = {};

    if (!isLogin) {
      if (!name || name.trim().length < 2 || name.trim().length > 50) {
        errors.name = 'Name must be between 2 and 50 characters';
      }
    }

    if (!email || !/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/.test(email)) {
      errors.email = 'Please provide a valid email address';
    }

    if (!password || password.length < 8) {
      errors.password = 'Password must be at least 8 characters';
    }

    if (!isLogin && password !== confirmPassword) {
      errors.confirmPassword = 'Passwords do not match';
    }

    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!validate()) return;

    setLoading(true);
    try {
      if (isLogin) {
        await login(email, password);
      } else {
        await register(name, email, password);
      }
      navigate(from, { replace: true });
    } catch (err) {
      const data = err.response?.data;
      if (data?.errors && Array.isArray(data.errors)) {
        const errs = {};
        data.errors.forEach(e => { errs[e.field] = e.message; });
        setFieldErrors(errs);
      } else {
        setError(data?.error || 'Authentication failed');
      }
    } finally {
      setLoading(false);
    }
  };

  const switchMode = () => {
    setIsLogin(!isLogin);
    setError('');
    setFieldErrors({});
    setConfirmPassword('');
  };

  return (
    <div className="flex items-center justify-center min-h-[calc(100vh-100px)]">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-dark-800/80 backdrop-blur-xl border border-white/10 p-8 rounded-2xl shadow-2xl w-full max-w-md"
      >
        <h2 className="text-3xl font-extrabold text-white mb-6 text-center">
          {isLogin ? 'Welcome Back' : 'Create Account'}
        </h2>
        
        {error && <div className="bg-red-500/20 text-red-400 border border-red-500/30 p-3 rounded-lg mb-4 text-sm text-center">{error}</div>}

        <form onSubmit={handleSubmit} className="space-y-4">
          {!isLogin && (
            <div>
              <label className="block text-sm font-medium text-slate-400 mb-1">Name</label>
              <input 
                type="text" 
                value={name} 
                onChange={e => { setName(e.target.value); setFieldErrors(p => ({...p, name: undefined})); }}
                className={`w-full bg-black/30 border ${fieldErrors.name ? 'border-red-500' : 'border-white/10'} rounded-lg p-3 text-white focus:border-primary-500 outline-none transition-colors`}
                placeholder="John Doe"
              />
              {fieldErrors.name && <p className="text-red-400 text-xs mt-1">{fieldErrors.name}</p>}
            </div>
          )}
          <div>
            <label className="block text-sm font-medium text-slate-400 mb-1">Email</label>
            <input 
              type="email" 
              value={email} 
              onChange={e => { setEmail(e.target.value); setFieldErrors(p => ({...p, email: undefined})); }}
              className={`w-full bg-black/30 border ${fieldErrors.email ? 'border-red-500' : 'border-white/10'} rounded-lg p-3 text-white focus:border-primary-500 outline-none transition-colors`}
              placeholder="you@example.com"
            />
            {fieldErrors.email && <p className="text-red-400 text-xs mt-1">{fieldErrors.email}</p>}
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-400 mb-1">Password</label>
            <input 
              type="password" 
              value={password} 
              onChange={e => { setPassword(e.target.value); setFieldErrors(p => ({...p, password: undefined})); }}
              className={`w-full bg-black/30 border ${fieldErrors.password ? 'border-red-500' : 'border-white/10'} rounded-lg p-3 text-white focus:border-primary-500 outline-none transition-colors`}
              placeholder="••••••••"
            />
            {fieldErrors.password && <p className="text-red-400 text-xs mt-1">{fieldErrors.password}</p>}
          </div>
          {!isLogin && (
            <div>
              <label className="block text-sm font-medium text-slate-400 mb-1">Confirm Password</label>
              <input 
                type="password" 
                value={confirmPassword} 
                onChange={e => { setConfirmPassword(e.target.value); setFieldErrors(p => ({...p, confirmPassword: undefined})); }}
                className={`w-full bg-black/30 border ${fieldErrors.confirmPassword ? 'border-red-500' : 'border-white/10'} rounded-lg p-3 text-white focus:border-primary-500 outline-none transition-colors`}
                placeholder="••••••••"
              />
              {fieldErrors.confirmPassword && <p className="text-red-400 text-xs mt-1">{fieldErrors.confirmPassword}</p>}
            </div>
          )}
          
          <button 
            type="submit" 
            disabled={loading}
            className="w-full bg-gradient-to-r from-primary-600 to-accent-600 hover:from-primary-500 hover:to-accent-500 text-white font-bold py-3 rounded-lg mt-4 transition-all shadow-[0_0_15px_rgba(59,130,246,0.3)] disabled:opacity-50"
          >
            {loading ? 'Processing...' : (isLogin ? 'Sign In' : 'Sign Up')}
          </button>
        </form>

        <div className="mt-6 text-center text-sm text-slate-400">
          {isLogin ? "Don't have an account? " : "Already have an account? "}
          <button 
            type="button"
            onClick={switchMode} 
            className="text-primary-400 hover:text-white font-semibold transition-colors"
          >
            {isLogin ? 'Sign up' : 'Sign in'}
          </button>
        </div>
      </motion.div>
    </div>
  );
};

export default Auth;
