
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { supabase } from '../supabaseClient';
import BrandLogo from '../components/BrandLogo';

const LoginPage: React.FC = () => {
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      if (isSignUp) {
        const { error } = await supabase.auth.signUp({ email, password });
        if (error) throw error;
        alert('Check your email for the confirmation link!');
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        navigate('/');
      }
    } catch (err: any) {
      setError(err.message || 'An error occurred during authentication');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-nearblack relative flex items-center justify-center px-4 overflow-hidden">
      {/* Immersive Background */}
      <div className="absolute inset-0 z-0">
        <img 
          src="https://images.unsplash.com/photo-1503177119275-0b344701075d?q=80&w=2000&auto=format&fit=crop" 
          className="w-full h-full object-cover opacity-20 blur-sm"
          alt="Egyptian Backdrop"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-nearblack via-nearblack/40 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-b from-nearblack via-transparent to-nearblack" />
      </div>

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative z-10 w-full max-w-md"
      >
        <div className="bg-charcoal/80 backdrop-blur-2xl border border-white/10 p-8 md:p-12 rounded-[40px] shadow-2xl">
          <div className="text-center mb-10">
            <BrandLogo className="h-12 mx-auto mb-6" />
            <h1 className="text-3xl font-black text-white tracking-tight">
              {isSignUp ? 'Join the Tribe' : 'Welcome Back'}
            </h1>
            <p className="text-muted mt-2">
              {isSignUp ? 'Create your Sobek account' : 'Sign in to start watching'}
            </p>
          </div>

          <form onSubmit={handleAuth} className="space-y-6">
            <div>
              <label className="block text-xs font-black text-accent-gold uppercase tracking-[0.2em] mb-2 pl-1">Email Address</label>
              <input 
                type="email" 
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 text-white focus:outline-none focus:border-accent-green transition-all"
                placeholder="nina@sobek.com"
              />
            </div>

            <div>
              <label className="block text-xs font-black text-accent-gold uppercase tracking-[0.2em] mb-2 pl-1">Password</label>
              <input 
                type="password" 
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 text-white focus:outline-none focus:border-accent-green transition-all"
                placeholder="••••••••"
              />
            </div>

            {error && (
              <motion.p 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-red-400 text-sm font-bold text-center"
              >
                {error}
              </motion.p>
            )}

            <button 
              type="submit"
              disabled={loading}
              className="w-full bg-white text-black py-4 rounded-2xl font-black text-lg hover:bg-accent-gold hover:text-black transition-all shadow-xl shadow-white/5 active:scale-95 disabled:opacity-50"
            >
              {loading ? (
                <div className="flex items-center justify-center gap-2">
                  <div className="w-5 h-5 border-2 border-black border-t-transparent rounded-full animate-spin"></div>
                  <span>Processing...</span>
                </div>
              ) : (
                isSignUp ? 'Create Account' : 'Sign In'
              )}
            </button>
          </form>

          <div className="mt-10 text-center border-t border-white/5 pt-8">
            <p className="text-muted">
              {isSignUp ? 'Already have an account?' : "Don't have an account?"}
              <button 
                onClick={() => setIsSignUp(!isSignUp)}
                className="ml-2 text-white font-black hover:text-accent-gold transition-colors"
              >
                {isSignUp ? 'Sign In' : 'Join Now'}
              </button>
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default LoginPage;
