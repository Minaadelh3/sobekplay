
import React from 'react';
import { motion } from 'framer-motion';

const AboutPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-nearblack pt-32 pb-24 px-6 flex justify-center">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-3xl w-full text-center"
        dir="rtl"
      >
        {/* Header / Intro */}
        <div className="mb-12">
           <h1 className="text-5xl font-black text-accent-gold mb-6 tracking-tight">Spark</h1>
           <p className="text-xl md:text-2xl text-white font-medium leading-relaxed">
             Spark هي خدمة من كنيسة العذراء بالفجالة ✨<br/>
             مجتمع بنكبر فيه سوا، ونتقابل، ونتكلم، ونصلّي، ونضحك كمان.
           </p>
        </div>

        {/* Meeting Info Card */}
        <div className="bg-charcoal border border-white/5 rounded-3xl p-8 mb-12 shadow-2xl relative overflow-hidden group">
           <div className="absolute top-0 right-0 w-32 h-32 bg-accent-gold/10 rounded-full -mr-16 -mt-16" />

           <h2 className="text-2xl font-bold text-accent-green mb-6">ميعادنا</h2>
           <p className="text-xl text-white leading-relaxed mb-8">
             اجتماعنا الأسبوعي بيكون<br/>
             <span className="font-bold text-accent-gold">يوم التلات</span><br/>
             الساعة 7:30 مساءً<br/>
             في كنيسة العذراء – الفجالة
           </p>

           <a
             href="https://maps.app.goo.gl/by95cKsFJaVsHrkt7"
             target="_blank"
             rel="noopener noreferrer"
             className="inline-flex items-center gap-2 bg-white/10 hover:bg-white/20 text-white px-6 py-3 rounded-full transition-colors border border-white/10"
           >
             <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
             مكان الكنيسة (Google Maps)
           </a>
        </div>

        {/* Activities */}
        <div className="mb-16">
           <h2 className="text-2xl font-bold text-white mb-8">بنعمل إيه؟</h2>
           <div className="bg-charcoal/50 border border-white/5 rounded-3xl p-8 text-lg text-white/90 leading-loose">
              <p className="mb-6 font-medium">عندنا فِقَر مختلفة ومش مملة، زي:</p>
              <ul className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-right px-4">
                 <li className="flex items-center gap-3"><span className="text-accent-green">•</span> Podcasts</li>
                 <li className="flex items-center gap-3"><span className="text-accent-green">•</span> Talks</li>
                 <li className="flex items-center gap-3"><span className="text-accent-green">•</span> Prayer meetings</li>
                 <li className="flex items-center gap-3"><span className="text-accent-green">•</span> Workshops</li>
                 <li className="flex items-center gap-3"><span className="text-accent-green">•</span> Trips</li>
                 <li className="flex items-center gap-3"><span className="text-accent-green">•</span> أكل لذيذ كل مرة 😄</li>
                 <li className="flex items-center gap-3"><span className="text-accent-green">•</span> Monthly Holy Mass</li>
              </ul>
              <p className="mt-8 font-medium text-muted">وغيرها حاجات هتعجبك.</p>
           </div>
        </div>

        {/* Closing */}
        <div className="text-xl md:text-2xl font-bold text-accent-gold border-t border-white/10 pt-12">
           Spark مش مجرد اجتماع…<br/>
           دي مساحة تلاقي فيها نفسك والناس شبهك.
        </div>

      </motion.div>
    </div>
  );
};

export default AboutPage;
