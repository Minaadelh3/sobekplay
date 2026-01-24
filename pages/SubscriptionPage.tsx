
import React from 'react';
import { motion } from 'framer-motion';

const SubscriptionPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-nearblack pt-32 pb-24 px-6 flex flex-col items-center text-center">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-3xl w-full"
      >
        <h1 className="text-4xl md:text-6xl font-black mb-6 tracking-tight text-white">
          إشترك في الرحلة
        </h1>
        <p className="text-xl md:text-2xl text-accent-gold font-bold mb-12">
          متفوتش الفرصة.. العدد محدود والرحلة دي مبتتكررش كتير!
        </p>

        <div className="bg-charcoal border border-white/5 rounded-3xl p-8 md:p-12 shadow-2xl mb-12 relative overflow-hidden group hover:border-accent-green/30 transition-colors duration-500">
            <div className="absolute top-0 right-0 w-32 h-32 bg-accent-green/10 rounded-full -mr-16 -mt-16 group-hover:scale-150 transition-transform duration-700" />
            
            <div className="relative z-10 space-y-8">
                <div>
                    <h2 className="text-lg text-muted mb-4">جاهز للمغامرة؟ كلمنا دلوقتي واحجز مكانك</h2>
                    <a 
                        href="tel:+201020707076"
                        className="inline-flex items-center space-x-3 bg-accent-green text-white px-8 py-5 rounded-full font-bold text-xl md:text-2xl hover:scale-105 transition-transform shadow-xl shadow-accent-green/20 hover:bg-opacity-90"
                    >
                        <svg className="w-8 h-8 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" /></svg>
                        <span>Call to Subscribe</span>
                    </a>
                </div>

                <div className="border-t border-white/10 pt-8">
                    <p className="text-sm text-muted uppercase tracking-widest mb-1">Trip Leader</p>
                    <h3 className="text-3xl font-black text-white">Mina Hany Aziz</h3>
                </div>
            </div>
        </div>

        <div className="text-right" dir="rtl">
            <h3 className="text-2xl font-bold text-white mb-6 pr-2 border-r-4 border-accent-green">أسئلة تهمك</h3>
            
            <div className="space-y-4">
                <div className="bg-white/5 p-6 rounded-2xl border border-white/5 hover:bg-white/10 transition-colors">
                    <h4 className="font-bold text-accent-gold mb-2 text-lg">ممكن أدفع عن طريق الفيزا؟</h4>
                    <p className="text-main-text leading-relaxed">أيوة طبعاً، الدفع بالفيزا متاح. ولما تتصل بمينا هيوضحلك كل طرق الدفع التانية المتاحة عشان تختار الأسهل ليك.</p>
                </div>
                 <div className="bg-white/5 p-6 rounded-2xl border border-white/5 hover:bg-white/10 transition-colors">
                    <h4 className="font-bold text-accent-gold mb-2 text-lg">إيه نظام الحجز؟</h4>
                    <p className="text-main-text leading-relaxed">الحجز بالأسبقية، عشان كدة بنقولك متستناش كتير وكلمنا عشان تضمن مكانك وسطنا.</p>
                </div>
            </div>
        </div>

      </motion.div>
    </div>
  );
};

export default SubscriptionPage;
