import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { ArrowRight, BarChart3, Target, ShieldCheck } from 'lucide-react';

const Home = () => {
  return (
    <div className="flex flex-col items-center justify-center min-h-[calc(100vh-80px)] overflow-hidden">
      <motion.div 
        initial={{ opacity: 0, y: 30 }} 
        animate={{ opacity: 1, y: 0 }} 
        transition={{ duration: 0.8, ease: "easeOut" }}
        className="text-center max-w-4xl mx-auto px-4"
      >
        <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight mb-6">
          Predict your future with <br className="hidden md:block"/>
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary-400 to-accent-400">
            Absolute Precision
          </span>
        </h1>
        <p className="text-xl text-slate-400 mb-10 max-w-2xl mx-auto">
          JoSAA Predictor Pro uses advanced algorithms and historical cutoff data to accurately predict your chances of securing a seat in top NITs, IIITs, and GFTIs.
        </p>
        
        <div className="flex flex-col sm:flex-row justify-center gap-4">
          <Link to="/predictor" className="px-8 py-4 rounded-full bg-primary-600 hover:bg-primary-500 text-white font-bold text-lg transition-all shadow-[0_0_20px_rgba(59,130,246,0.4)] flex items-center justify-center gap-2">
            Start Predicting <ArrowRight className="w-5 h-5" />
          </Link>
        </div>
      </motion.div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 w-full max-w-6xl mx-auto px-4 mt-24">
        <FeatureCard 
          icon={<BarChart3 className="w-8 h-8 text-primary-400" />}
          title="Advanced Data Analytics"
          desc="We analyze years of historical JoSAA closing ranks to give you the most accurate safety margins."
          delay={0.2}
        />
        <FeatureCard 
          icon={<Target className="w-8 h-8 text-accent-400" />}
          title="Laser-Focused Filters"
          desc="Filter by core/circuital branches, NIRF rankings, and placement packages to find your exact match."
          delay={0.4}
        />
        <FeatureCard 
          icon={<ShieldCheck className="w-8 h-8 text-emerald-400" />}
          title="Dynamic Probabilities"
          desc="Our engine calculates a live Safe/Moderate/Risky percentage to help you build the perfect preference list."
          delay={0.6}
        />
      </div>
    </div>
  );
};

const FeatureCard = ({ icon, title, desc, delay }) => (
  <motion.div 
    initial={{ opacity: 0, y: 30 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.6, delay }}
    className="bg-dark-800/50 backdrop-blur-sm border border-white/10 p-8 rounded-2xl hover:bg-dark-800/80 transition-colors"
  >
    <div className="bg-white/5 w-16 h-16 rounded-xl flex items-center justify-center mb-6">
      {icon}
    </div>
    <h3 className="text-xl font-bold mb-3">{title}</h3>
    <p className="text-slate-400 leading-relaxed">{desc}</p>
  </motion.div>
);

export default Home;
