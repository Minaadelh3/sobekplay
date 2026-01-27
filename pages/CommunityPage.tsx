
import React from 'react';
import { motion } from 'framer-motion';

const CommunityPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-nearblack pt-32 pb-24 flex flex-col items-center justify-center text-center px-6 relative overflow-hidden">
      {/* Abstract Background */}
      <div className="absolute inset-0 z-0 opacity-30">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-accent-green/20 rounded-full blur-[100px]" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-accent-gold/10 rounded-full blur-[100px]" />
      </div>

      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.6 }}
        className="relative z-10 max-w-2xl bg-charcoal/30 border border-white/10 p-12 rounded-[2rem] backdrop-blur-2xl shadow-2xl"
      >
        <div className="w-24 h-24 bg-gradient-to-br from-accent-green to-emerald-900 rounded-2xl flex items-center justify-center mx-auto mb-8 shadow-lg rotate-3 transform hover:rotate-6 transition-transform">
          <svg className="w-12 h-12 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" /></svg>
        </div>

        <div className="space-y-6" dir="rtl">
          <h2 className="text-3xl md:text-4xl text-white font-black leading-tight">
            أهلًا بيك في الـ <span className="text-accent-green">Tribe</span> 🌴
          </h2>

          <div className="h-px w-full bg-gradient-to-r from-transparent via-white/20 to-transparent" />

          <p className="text-xl text-white/80 leading-relaxed font-medium">
            مجتمع Sobek مش لأي حد.<br />
            ده المكان اللي هنتجمع فيه، نرتب خروجاتنا، ونشير صورنا.
          </p>

          <div className="bg-white/5 rounded-2xl p-6 border border-white/5">
            <p className="text-lg text-white leading-relaxed">
              لو حجزت الرحلة، أكيد وصلك لينك <br />
              <span className="text-accent-green font-bold">WhatsApp Group</span> 📱
            </p>
            <p className="text-sm text-white/50 mt-2">
              (لو موصلش، كلمنا فورًا وتأكد من حجزك)
            </p>
          </div>

          <div className="bg-white/5 rounded-2xl p-6 border border-white/5 mt-6 relative overflow-hidden group hover:border-accent-gold/30 transition-colors cursor-pointer" onClick={() => window.open('https://photos.app.goo.gl/ZwC5xnvfy2H4pPia8', '_blank')}>
            <div className="absolute inset-0 bg-gradient-to-r from-accent-gold/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
            <div className="relative flex items-center justify-between gap-4">
              <div className="text-right">
                <p className="text-lg text-white font-bold leading-tight">
                  صور الرحلة 📸
                </p>
                <p className="text-sm text-white/60 mt-1">
                  دوس هنا وارفع صورك أو اتفرج
                </p>
              </div>
              <div className="w-10 h-10 rounded-full bg-accent-gold/20 flex items-center justify-center text-accent-gold">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
              </div>
            </div>
          </div>

          <p className="text-2xl text-accent-gold font-bold leading-relaxed pt-2 rotate-1 inline-block transform">
            لسه ما حجزتش؟ فاتك نص عمرك! 😜
          </p>
        </div>
      </motion.div>
    </div>
  );
};

export default CommunityPage;
