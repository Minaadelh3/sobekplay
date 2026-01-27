
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { supabase } from "../supabaseClient";
import BrandLogo from "../components/BrandLogo";

export default function Login() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const navigate = useNavigate();

  const handleClose = () => {
    const confirmExit = window.confirm(
      "Are you sure you want to leave sign in?"
    );
    if (confirmExit) {
      navigate("/");
    }
  };

  const handleMagicLink = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!email || loading) return;

    setLoading(true);

    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: {
        emailRedirectTo: window.location.origin,
      },
    });

    setLoading(false);

    if (error) {
      alert(error.message);
    } else {
      setSent(true);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-nearblack relative overflow-hidden px-4">
      {/* Immersive Background */}
      <div className="absolute inset-0 z-0">
        <img 
          src="https://images.unsplash.com/photo-1503177119275-0b344701075d?q=80&w=2000&auto=format&fit=crop" 
          className="w-full h-full object-cover opacity-30 blur-md scale-110"
          alt="Egyptian Backdrop"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-nearblack via-nearblack/60 to-transparent" />
      </div>

      {/* Close Button */}
      <button 
        onClick={handleClose}
        className="absolute top-8 right-8 z-50 p-3 bg-white/5 hover:bg-white/10 rounded-full text-white/50 hover:text-white transition-all backdrop-blur-md border border-white/10 group"
      >
        <svg className="w-6 h-6 transition-transform group-hover:rotate-90" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>

      <motion.div 
        initial={{ opacity: 0, y: 30, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        className="w-full max-w-md rounded-[40px] bg-charcoal/80 backdrop-blur-3xl border border-white/10 p-10 text-center space-y-8 z-10 shadow-[0_20px_50px_rgba(0,0,0,0.5)]"
      >
        <div className="space-y-4">
          <BrandLogo className="h-14 mx-auto mb-6" />
          <h1 className="text-4xl font-black text-white tracking-tighter uppercase italic">The Nile Awaits</h1>
          <p className="text-muted text-lg font-medium">
            Enter your email to claim your place in the tribe.
          </p>
        </div>

        {!sent ? (
          <form onSubmit={handleMagicLink} className="space-y-6">
            <div className="text-left">
              <label className="block text-[10px] font-black text-accent-gold uppercase tracking-[0.3em] mb-3 ml-1">Digital Identity (Email)</label>
              <input
                type="email"
                placeholder="name@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-6 py-5 rounded-2xl bg-nearblack border border-white/10 text-white placeholder-white/20 focus:outline-none focus:border-accent-green focus:ring-4 focus:ring-accent-green/10 transition-all text-lg"
                required
              />
            </div>

            <button
              type="submit"
              disabled={!email || loading}
              className="w-full py-5 rounded-2xl bg-white text-black font-black text-xl hover:bg-accent-gold hover:text-black transition-all shadow-[0_10px_30px_rgba(255,255,255,0.1)] active:scale-[0.98] disabled:opacity-50 group"
            >
              {loading ? (
                <div className="flex items-center justify-center gap-3">
                  <div className="w-5 h-5 border-2 border-black border-t-transparent rounded-full animate-spin"></div>
                  <span>Summoning Link...</span>
                </div>
              ) : (
                <span className="flex items-center justify-center gap-2">
                  Join the Tribe
                  <svg className="w-5 h-5 transition-transform group-hover:translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                  </svg>
                </span>
              )}
            </button>
          </form>
        ) : (
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="p-8 bg-accent-green/10 border border-accent-green/30 rounded-3xl"
          >
            <div className="w-20 h-20 bg-accent-green/20 rounded-full flex items-center justify-center mx-auto mb-6">
               <svg className="w-10 h-10 text-accent-green" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
               </svg>
            </div>
            <p className="text-white font-black text-2xl mb-3">Check Your Portal</p>
            <p className="text-muted text-base leading-relaxed">
              We've sent a magic link to <span className="text-white font-bold">{email}</span>. One click and you're in.
            </p>
            <button 
              onClick={() => setSent(false)}
              className="mt-8 text-accent-gold text-sm font-black uppercase tracking-widest hover:underline"
            >
              Try another email
            </button>
          </motion.div>
        )}

        <div className="pt-6 border-t border-white/5">
          <p className="text-[10px] text-muted uppercase tracking-[0.25em] font-black">
            Secure • Passwordless • Instant Access
          </p>
        </div>
      </motion.div>
    </div>
  );
}
