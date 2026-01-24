
import React from 'react';
import { motion } from 'framer-motion';

const CommunityPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-nearblack pt-32 pb-24 flex flex-col items-center justify-center text-center px-6">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="max-w-3xl bg-charcoal/30 border border-white/5 p-12 rounded-3xl backdrop-blur-md shadow-2xl"
        dir="rtl"
      >
        <div className="w-24 h-24 bg-accent-green/20 rounded-full flex items-center justify-center mx-auto mb-8">
            <svg className="w-12 h-12 text-accent-green" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" /></svg>
        </div>
        
        <div className="space-y-8">
             <p className="text-2xl md:text-3xl text-white font-bold leading-relaxed">
                أكيد إنت لسه ما حجزتش… صح؟ 😏
            </p>
            <p className="text-xl text-muted leading-relaxed">
                لو حجزت ودفعت خلاص،<br/>
                لينك WhatsApp Group بتاع الرحلة هيجيلك فورًا 📱👌
            </p>
            <p className="text-2xl text-accent-gold font-bold leading-relaxed pt-4">
                لسه؟<br/>
                احجز الأول… وارجع تاني 😄
            </p>
        </div>
      </motion.div>
    </div>
  );
};

export default CommunityPage;
