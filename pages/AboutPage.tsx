
import React from 'react';
import { motion } from 'framer-motion';

const AboutPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-nearblack pt-32 pb-24 overflow-hidden">
      <div className="max-w-4xl mx-auto px-6 relative">
        <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-20"
        >
            <h1 className="text-5xl md:text-7xl font-black mb-8 tracking-tighter">Sobek Play</h1>
            <div className="h-1 w-24 bg-accent-green mx-auto mb-12 rounded-full" />
            <p className="text-xl md:text-2xl text-main-text font-medium leading-relaxed italic">
                "Where ancient legends meet modern cinema. A tribute to the Nile, the Nuba, and the timeless magic of Egyptian storytelling."
            </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 mb-24">
            <div className="space-y-6">
                <h2 className="text-2xl font-black text-accent-gold uppercase tracking-wider">Our Vision</h2>
                <p className="text-muted leading-relaxed">
                    Sobek Play was born out of a desire to create a premium streaming space that celebrates identity. From the banks of Aswan to the screens of the world, we bring together the best of international cinema and authentic local tales.
                </p>
            </div>
            <div className="space-y-6">
                <h2 className="text-2xl font-black text-accent-gold uppercase tracking-wider">The Experience</h2>
                <p className="text-muted leading-relaxed">
                    Built for the cinematic purist. Our platform features auto-categorization based on visual intensity, impact, and tone, ensuring every session is perfectly curated to your mood.
                </p>
            </div>
        </div>

        <div className="bg-charcoal/50 border border-white/5 rounded-3xl p-12 text-center shadow-inner relative group">
            <div className="absolute inset-0 bg-accent-green/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-3xl pointer-events-none" />
            <h2 className="text-3xl font-black mb-6">Want to Join the Trip?</h2>
            <p className="text-muted mb-10 max-w-lg mx-auto">
                Our journey is more than just digital. Join our physical expeditions to the heart of Upper Egypt. 
            </p>
            <div className="space-y-2">
                <p className="text-xs uppercase tracking-[0.3em] font-bold text-muted/60">Subscription & Info</p>
                <p className="text-3xl font-black text-white">+20 10 20707076</p>
            </div>
        </div>
      </div>
    </div>
  );
};

export default AboutPage;
