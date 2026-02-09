import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import BrandLogo from './BrandLogo';
import { useAuth } from '../context/AuthContext';
import { useNotification } from '../context/NotificationContext';
import { getAvatarUrl } from '../lib/getAvatarUrl';

import { calculateLevelFromXP } from '../lib/gamification';
import { subscribeToScores } from '../services/scoring/scoreEngine';

interface NavbarProps {
  onSearchOpen: () => void;
}

const Navbar: React.FC<NavbarProps> = ({ onSearchOpen }) => {
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);
  const location = useLocation();
  const { user, logout, selectedTeam, isAdmin, roleLoading } = useAuth();
  const { unreadCount } = useNotification();

  // Unified Scoring State
  const [liveUserScore, setLiveUserScore] = useState(user?.xp || 0);
  const [liveTeamScore, setLiveTeamScore] = useState(selectedTeam?.points || 0);

  useEffect(() => {
    if (!user?.id) return;
    return subscribeToScores(user.id, (u, t) => {
      setLiveUserScore(u);
      setLiveTeamScore(t);
    });
  }, [user?.id]);

  // Close dropdowns on route change
  useEffect(() => {
    setActiveDropdown(null);
  }, [location.pathname]);

  const handleBackdropClick = () => {
    setActiveDropdown(null);
  };

  const navLinks = [
    { name: '🏠 Home', path: '/app/home' },
    { name: '📰 News', path: '/app/news' },
    { name: '🏅 Rankings', path: '/app/rankings' },
    { name: '🎮 Games', path: '/app/games' },
    { name: '🧭 Program', path: '/app/program' },
    { name: '🔔 Reminders', path: '/app/reminders' },
    { name: '🕯️ Prayer', path: '/app/prayers' },
    { name: '🎶 El-She3ar', path: '/app/she3ar-al-re7la' },
    { name: '🎈 Kids', path: '/app/kids' },
    { name: '🔑 Rooms', path: '/app/rooms' },
    { name: '💬 Community', path: '/app/community' },
    { name: 'ℹ️ City Info', path: '/app/informations' },
    { name: '🗣️ شات الفريق', path: '/app/team-chat' },
    { name: '🏆 الإنجازات', path: '/app/achievements' },
  ];

  const isLinkActive = (path: string) => location.pathname === path;

  // Mobile Menu State
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    if (isMobileMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isMobileMenuOpen]);

  const allNavItems = [...navLinks];

  // Helper to get consistent avatar
  const avatarUrl = user && selectedTeam ? getAvatarUrl({
    ...user,
    teamId: selectedTeam.id,
    // explicit overrides if needed, but getAvatarUrl handles user.profile priority
  }) : '';

  // Calculate User Level/Rank
  const userLevel = user ? calculateLevelFromXP(user.xp || 0) : null;

  return (
    <>
      <AnimatePresence>
        {activeDropdown && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={handleBackdropClick}
            className="fixed inset-0 z-[90] bg-black/60 backdrop-blur-sm cursor-pointer"
          />
        )}
      </AnimatePresence>

      <nav className="fixed top-0 left-0 right-0 z-[100] bg-nearblack/95 backdrop-blur-xl border-b border-white/5 shadow-2xl h-[calc(4rem+env(safe-area-inset-top))] md:h-[calc(5rem+env(safe-area-inset-top))] pt-[env(safe-area-inset-top)] transition-all duration-300 pointer-events-auto touch-pan-y">
        <div className="max-w-[1920px] mx-auto px-4 md:px-12 h-16 md:h-20 flex items-center justify-between gap-4">

          {/* Logo */}
          <Link to="/app/home" onClick={() => { setActiveDropdown(null); setIsMobileMenuOpen(false); }} className="flex-shrink-0 z-[102] relative flex items-center gap-2">
            <BrandLogo className="h-6 md:h-8 w-auto text-accent-gold hover:text-white transition-colors" />
          </Link>

          {/* Mobile Burger Trigger */}
          <div className="md:hidden z-[102] flex items-center gap-2">
            {/* Mobile Alerts Icon */}
            <Link
              to="/app/notifications"
              className="relative text-white/80 p-3 hover:bg-white/5 rounded-full transition-colors"
              aria-label="Notifications"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" /></svg>
              {unreadCount > 0 && (
                <span className="absolute top-2 right-2 flex h-4 w-4 items-center justify-center rounded-full bg-red-600 text-[9px] font-bold text-white ring-2 ring-nearblack">
                  {unreadCount > 9 ? '9+' : unreadCount}
                </span>
              )}
            </Link>

            <button
              onClick={onSearchOpen}
              className="text-white/80 p-3 hover:bg-white/5 rounded-full transition-colors"
              aria-label="Search"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
            </button>

            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="text-white p-3 hover:bg-white/5 rounded-full transition-colors"
              aria-label="Menu"
            >
              <div className="space-y-1.5 w-6">
                <motion.span animate={{ rotate: isMobileMenuOpen ? 45 : 0, y: isMobileMenuOpen ? 8 : 0 }} className="block h-0.5 w-full bg-accent-gold transform origin-center transition-transform" />
                <motion.span animate={{ opacity: isMobileMenuOpen ? 0 : 1 }} className="block h-0.5 w-full bg-accent-gold transition-opacity" />
                <motion.span animate={{ rotate: isMobileMenuOpen ? -45 : 0, y: isMobileMenuOpen ? -8 : 0 }} className="block h-0.5 w-full bg-accent-gold transform origin-center transition-transform" />
              </div>
            </button>
          </div>

          {/* DESKTOP NAV */}
          <div className="hidden md:flex flex-1 overflow-x-auto mx-8 relative z-[101]">
            <div className="flex items-center space-x-8 min-w-max px-2">
              {navLinks.map((link) => (
                <Link
                  key={link.path}
                  to={link.path}
                  onClick={(e) => {
                    setActiveDropdown(null);
                    if (isLinkActive(link.path)) {
                      e.preventDefault();
                      window.dispatchEvent(new CustomEvent('tab-reset', { detail: { path: link.path } }));
                    }
                  }}
                  className={`text-base font-medium whitespace-nowrap transition-all duration-200 select-none ${isLinkActive(link.path)
                    ? 'text-white font-bold border-b-2 border-accent-green pb-1'
                    : 'text-white/60 hover:text-white'
                    }`}
                >
                  {link.name}
                </Link>
              ))}
            </div>
          </div>

          {/* Right Side Actions */}
          <div className="hidden md:flex flex-shrink-0 items-center gap-6 bg-nearblack/95 pl-2 z-[101] relative">
            {/* Notifications (Desktop) */}
            <Link
              to="/app/notifications"
              className="text-white/80 hover:text-white transition-transform hover:scale-110 p-2 relative group"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" /></svg>
              {/* Optional: Unread Indicator (Can be connected to state later) */}
              {/* <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full animate-pulse" /> */}
            </Link>

            <button
              onClick={onSearchOpen}
              className="text-white/80 hover:text-white transition-transform hover:scale-110 p-2"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </button>

            <div className="h-6 w-[1px] bg-white/20" />

            {user && selectedTeam && (
              <div className="relative">
                <button
                  onClick={(e) => { e.stopPropagation(); setActiveDropdown(activeDropdown === 'profile' ? null : 'profile'); }}
                  className="flex items-center gap-3 focus:outline-none text-right"
                >
                  <div className="hidden md:block">
                    {/* User Identity & Rank */}
                    <div className="text-xs font-bold uppercase tracking-wider flex items-center gap-2 justify-end mb-0.5">
                      {userLevel && (
                        <>
                          <span className={`${userLevel.color} drop-shadow-sm`}>{userLevel.title}</span>
                          <span className="text-gray-500">|</span>
                        </>
                      )}
                      <span className="text-gray-400">{user.name}</span>
                    </div>

                    {/* Team Identity & XP */}
                    <div className="text-sm font-black text-white flex items-center gap-3 justify-end">
                      {/* User XP */}
                      <div className="flex items-baseline gap-1">
                        <span className="text-accent-gold font-mono">{liveUserScore.toLocaleString()}</span>
                        <span className="text-[9px] text-gray-500 font-bold uppercase">XP</span>
                      </div>

                      <div className="w-[1px] h-3 bg-white/20" />

                      {/* Team Name */}
                      <div className="flex items-center gap-2">
                        {selectedTeam.name}
                        {/* Show Points if Scorable */}
                        {selectedTeam.isScorable !== false && (
                          <span className="bg-accent-gold/10 text-accent-gold px-1.5 py-0.5 rounded text-[9px] border border-accent-gold/20 flex items-center gap-1">
                            🏆 {liveTeamScore.toLocaleString()}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className={`w-10 h-10 rounded-lg bg-gradient-to-br ${selectedTeam.color} p-0.5 shadow-lg ring-2 ring-transparent transition-all hover:ring-white/20 overflow-hidden relative`}>
                    <img src={avatarUrl} alt={selectedTeam.name} className="w-full h-full object-cover" />
                    <div className="absolute bottom-0 right-0 bg-black/60 backdrop-blur-sm text-[8px] px-1 rounded-tl-md text-white font-bold border-l border-t border-white/10">
                      LVL {userLevel?.level || 1}
                    </div>
                  </div>
                </button>

                <AnimatePresence>
                  {activeDropdown === 'profile' && (
                    <motion.div
                      initial={{ opacity: 0, y: 10, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 10, scale: 0.95 }}
                      transition={{ duration: 0.2 }}
                      className="absolute right-0 mt-4 w-64 bg-nearblack border border-white/10 rounded-xl shadow-2xl py-2 overflow-hidden origin-top-right z-[110]"
                    >
                      <div className="absolute inset-0 bg-white/5 backdrop-blur-md -z-10" />

                      <div className="px-5 py-4 border-b border-white/5 bg-black/20">
                        <p className="text-xs text-gray-400">حساب العائلة</p>
                        <p className="text-sm font-bold text-white truncate">{user.name}</p>
                        <div className="mt-2 flex items-center gap-2 text-xs">
                          <span className={`font-bold ${userLevel?.color}`}>{userLevel?.title}</span>
                          <span className="text-gray-500">•</span>
                          <span className="text-white font-mono">{liveUserScore.toLocaleString()} XP</span>
                        </div>
                      </div>

                      <Link to="/app/settings" onClick={() => setActiveDropdown(null)} className="block px-5 py-3 text-sm text-gray-300 hover:bg-white/5 hover:text-white transition-colors flex items-center gap-2">
                        <span>⚙️</span> الإعدادات
                      </Link>

                      {/* Admin Link with Loading State */}
                      {roleLoading ? (
                        <div className="px-5 py-3 flex items-center gap-2">
                          <div className="w-4 h-4 rounded-full bg-white/10 animate-pulse" />
                          <div className="h-3 w-24 bg-white/10 rounded animate-pulse" />
                        </div>
                      ) : isAdmin ? (
                        <Link to="/admin" onClick={() => setActiveDropdown(null)} className="block px-5 py-3 text-sm text-accent-gold font-bold hover:bg-white/5 transition-colors">
                          لوحة التحكم (Admin) ⚡
                        </Link>
                      ) : (
                        <Link to="/app/my-list" onClick={() => setActiveDropdown(null)} className="block px-5 py-3 text-sm text-white/70 hover:bg-white/5 hover:text-white transition-colors">
                          قائمتي
                        </Link>
                      )}

                      <Link to="/profiles" onClick={() => setActiveDropdown(null)} className="block px-5 py-3 text-sm text-white/70 hover:bg-white/5 hover:text-white transition-colors">
                        تغيير الفريق 👥
                      </Link>

                      <div className="border-t border-white/5 mt-1 pt-1">
                        <button
                          onClick={() => logout()}
                          className="w-full text-right px-5 py-3 text-sm text-red-400 hover:bg-red-500/10 hover:text-red-300 transition-colors"
                        >
                          تسجيل الخروج
                        </button>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            )}
          </div>
        </div>
      </nav>

      <AnimatePresence>
        {isMobileMenuOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsMobileMenuOpen(false)}
              className="fixed inset-0 z-[90] bg-black/80 backdrop-blur-sm md:hidden"
            />
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="fixed right-0 top-0 bottom-0 w-[80%] max-w-sm bg-[#121212] z-[101] shadow-2xl border-l border-white/10 md:hidden flex flex-col pt-24 pb-8 overflow-y-auto"
            >
              <div className="flex-1 overflow-y-auto pt-8 pb-8">
                {user && selectedTeam && (
                  <div className="px-6 mb-8 border-b border-white/5 pb-6">
                    <div className="flex items-center gap-4 mb-6 p-4 bg-white/5 rounded-2xl border border-white/5">
                      <div className={`w-14 h-14 rounded-xl bg-gradient-to-br ${selectedTeam.color} p-0.5 overflow-hidden shadow-lg relative`}>
                        <img src={avatarUrl} alt={selectedTeam.name} className="w-full h-full object-cover rounded-lg" />
                        <div className="absolute bottom-0 right-0 bg-black/70 backdrop-blur-sm text-[9px] px-1.5 py-0.5 rounded-tl-lg text-white font-bold border-l border-t border-white/10">
                          LVL {userLevel?.level || 1}
                        </div>
                      </div>
                      <div className="flex-1">
                        <div className="text-gray-400 text-xs uppercase font-bold tracking-wider mb-1">{user.name}</div>

                        {/* Mobile User Rank & XP */}
                        <div className="flex items-center gap-2 mb-2">
                          <span className={`text-xs font-bold ${userLevel?.color}`}>{userLevel?.title}</span>
                          <span className="text-white/20">|</span>
                          <span className="text-accent-gold font-mono text-xs font-bold">{liveUserScore.toLocaleString()} XP</span>
                        </div>

                        <div className="text-white font-bold text-sm flex items-center gap-2 bg-black/20 p-2 rounded-lg border border-white/5">
                          {selectedTeam.name}
                          {selectedTeam.isScorable !== false && (
                            <span className="text-accent-gold text-xs bg-accent-gold/10 px-1.5 py-0.5 rounded border border-accent-gold/20 ml-auto">
                              🏆 {liveTeamScore.toLocaleString()}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3 mb-4">
                      <Link
                        to="/profiles"
                        onClick={() => setIsMobileMenuOpen(false)}
                        className="text-center py-3 text-sm font-bold text-white/80 bg-white/5 rounded-xl hover:bg-white/10 border border-white/5"
                      >
                        فرق 👥
                      </Link>
                      <Link
                        to="/app/settings"
                        onClick={() => setIsMobileMenuOpen(false)}
                        className="text-center py-3 text-sm font-bold text-white/80 bg-white/5 rounded-xl hover:bg-white/10 border border-white/5"
                      >
                        إعدادات ⚙️
                      </Link>
                    </div>

                    {roleLoading ? (
                      <div className="w-full bg-white/5 rounded-xl border border-white/5 p-3 flex items-center justify-center gap-2 mb-3">
                        <div className="w-4 h-4 rounded-full bg-white/10 animate-pulse" />
                        <div className="h-3 w-24 bg-white/10 rounded animate-pulse" />
                      </div>
                    ) : isAdmin && (
                      <Link
                        to="/admin"
                        onClick={() => setIsMobileMenuOpen(false)}
                        className="text-center py-3 text-sm font-bold text-accent-gold bg-accent-gold/10 rounded-xl hover:bg-accent-gold/20 border border-accent-gold/20 flex items-center justify-center gap-2 mb-3"
                      >
                        <span>⚡</span> لوحة التحكم
                      </Link>
                    )}

                    <button
                      onClick={logout}
                      className="w-full py-3 text-center text-red-400 font-bold bg-red-500/10 hover:bg-red-500/20 rounded-xl transition-colors text-sm border border-red-500/10"
                    >
                      تسجيل الخروج
                    </button>
                  </div>
                )}

                <div className="px-6">
                  <h3 className="text-xs font-bold text-white/40 uppercase tracking-widest mb-4">القائمة</h3>
                  <div className="space-y-2">
                    {allNavItems.map(item => (
                      <Link
                        key={item.path}
                        to={item.path}
                        onClick={() => setIsMobileMenuOpen(false)}
                        className={`flex items-center gap-3 py-3 px-4 rounded-xl transition-colors
                                              ${isLinkActive(item.path) ? 'bg-white/10 text-white font-bold' : 'text-white/60 hover:text-white hover:bg-white/5'}
                                          `}
                      >
                        <span>{item.name}</span>
                        {isLinkActive(item.path) && <span className="ml-auto text-accent-green">●</span>}
                      </Link>
                    ))}
                  </div>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
};

export default Navbar;