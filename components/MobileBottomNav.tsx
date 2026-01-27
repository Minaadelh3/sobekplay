import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { supabase } from '../supabaseClient';

const MobileBottomNav: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => setUser(data.user));
    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });
    return () => listener.subscription.unsubscribe();
  }, []);

  const isWatchPage = location.pathname.startsWith('/watch/');
  if (isWatchPage) return null;

  const navItems = [
    {
      name: 'Home',
      path: '/',
      icon: (active: boolean) => (
        <svg className={`w-6 h-6 transition-colors ${active ? 'text-white' : 'text-zinc-500'}`} viewBox="0 0 24 24" fill={active ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth={active ? 0 : 2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
        </svg>
      )
    },
    {
      name: 'Search',
      path: '#',
      action: () => alert('Search Coming Soon'),
      icon: (active: boolean) => (
        <svg className={`w-6 h-6 transition-colors ${active ? 'text-white' : 'text-zinc-500'}`} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
      )
    },
    {
      name: 'My List',
      path: '/my-list',
      icon: (active: boolean) => (
        <svg className={`w-6 h-6 transition-colors ${active ? 'text-white' : 'text-zinc-500'}`} viewBox="0 0 24 24" fill={active ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth={active ? 0 : 2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
        </svg>
      )
    },
    {
      name: user ? 'Profile' : 'Login',
      path: user ? '#' : '/login',
      action: user ? () => { if (window.confirm('Log out?')) { supabase.auth.signOut(); navigate('/'); } } : undefined,
      icon: (active: boolean) => (
        <svg className={`w-6 h-6 transition-colors ${active ? 'text-white' : 'text-zinc-500'}`} viewBox="0 0 24 24" fill={active ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth={active ? 0 : 2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
        </svg>
      )
    },
  ];

  return (
    <div className="fixed bottom-0 left-0 right-0 z-[100] bg-black/95 backdrop-blur-lg border-t border-white/10 md:hidden pb-safe-area">
      <div className="flex justify-around items-center h-16">
        {navItems.map((item) => {
          const isActive = location.pathname === item.path;

          return (
            <button
              key={item.name}
              onClick={() => item.action ? item.action() : navigate(item.path)}
              className="flex flex-col items-center justify-center w-full h-full space-y-1 active:scale-95 transition-transform"
            >
              <div className="relative">
                {item.icon(isActive)}
              </div>
              <span className={`text-[10px] font-medium tracking-wide transition-colors ${isActive ? 'text-white' : 'text-zinc-500'}`}>
                {item.name}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default MobileBottomNav;