
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { MerchItem } from '../types';
import ImageWithFallback from '../components/ImageWithFallback';

const ShopPage: React.FC = () => {
  const [merch, setMerch] = useState<MerchItem[]>([]);
  const [error, setError] = useState<boolean>(false);

  useEffect(() => {
    // Simulated fetching from merch.json
    const fetchMerch = async () => {
        try {
            const response = await fetch('/src/data/merch.json');
            if (!response.ok) throw new Error("Failed to load");
            const data = await response.json();
            setMerch(data);
        } catch (e) {
            setError(true);
            // Fallback for demo if fetch fails
            setMerch([
                { id: "m1", name: "Sobek Gold Logo Cap", price: "450 EGP", image: "/public/assets/merch/merch_cap.png" },
                { id: "m2", name: "Nile Green Hoodie", price: "1,200 EGP", image: "/public/assets/merch/merch_hoodie.png" },
                { id: "m3", name: "Sobek Play Desk Set", price: "850 EGP", image: "/public/assets/merch/merch_desk.png" },
                { id: "m4", name: "Sobek Live T-Shirt", price: "350 EGP", image: "/public/assets/merch/merch_tshirt.png" }
            ]);
        }
    };
    fetchMerch();
  }, []);

  return (
    <div className="min-h-screen bg-nearblack pt-32 pb-24">
      <div className="max-w-7xl mx-auto px-6">
        <header className="mb-12 border-b border-white/5 pb-8 flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div>
            <h1 className="text-4xl md:text-6xl font-black mb-2 tracking-tight">Sobek Merch</h1>
            <p className="text-muted text-lg">Official gear for the modern explorer</p>
          </div>
          <div className="bg-accent-gold/10 border border-accent-gold/20 p-4 rounded-xl">
             <p className="text-[10px] text-accent-gold uppercase tracking-[0.2em] font-bold mb-1">Orders & Inquiries</p>
             <p className="text-lg font-black text-white">+20 10 20707076</p>
          </div>
        </header>

        {error && (
            <div className="mb-8 p-4 rounded-lg bg-orange-500/10 border border-orange-500/20 flex items-center space-x-3 text-orange-200">
                <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
                <span className="text-sm font-medium">Unable to connect to the live store. Showing offline catalog.</span>
            </div>
        )}

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
