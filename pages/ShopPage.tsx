
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { MerchItem } from '../types';
import { merchItems } from '../data/merch';
import ImageWithFallback from '../components/ImageWithFallback';

const ShopPage: React.FC = () => {
  const [merch, setMerch] = useState<MerchItem[]>([]);

  useEffect(() => {
    // Load data from local TS file to ensure availability in production
    setMerch(merchItems);
  }, []);

  return (
    <div className="min-h-screen bg-nearblack pt-32 pb-24">
      <div className="max-w-7xl mx-auto px-6">
        <header className="mb-12 border-b border-white/5 pb-8 flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div>
            <h1 className="text-4xl md:text-6xl font-black mb-2 tracking-tight">Sobek Merch</h1>
            <p className="text-muted text-lg">Official gear for the modern explorer</p>
          </div>
        </header>

        {merch.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {merch.map((item) => (
              <motion.div 
                key={item.id}
                whileHover={{ y: -10 }}
                className="bg-charcoal rounded-2xl overflow-hidden border border-white/5 group shadow-xl"
              >
                <div className="aspect-square bg-white/5 overflow-hidden">
                    <ImageWithFallback
                      src={item.image} 
                      alt={item.name} 
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" 
                    />
                </div>
                <div className="p-6">
                    <h3 className="text-xl font-bold mb-2">{item.name}</h3>
                    <p className="text-accent-green font-bold text-lg mb-4">{item.price}</p>
                    <button className="w-full bg-accent-green py-3 rounded-lg font-bold hover:bg-opacity-80 transition-all">Add to Cart</button>
                </div>
              </motion.div>
            ))}
          </div>
        ) : (
          <div className="py-32 text-center">
            <div className="w-20 h-20 bg-white/5 rounded-full flex items-center justify-center mx-auto mb-6">
                <svg className="w-10 h-10 text-muted" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 118 0m-4 7v2a4 4 0 01-4 4H6a4 4 0 01-4-4V6a4 4 0 014-4h10a4 4 0 014 4v4M7 7h10" /></svg>
            </div>
            <h2 className="text-2xl font-bold text-muted mb-4">The shop is currently resting...</h2>
            <p className="text-muted/60">New merchandise arriving soon. Stay tuned!</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ShopPage;
