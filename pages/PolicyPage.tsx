
import React from 'react';
import { motion } from 'framer-motion';

const PolicyPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-nearblack pt-32 pb-24 px-6">
      <div className="max-w-4xl mx-auto">
        <header className="mb-16 text-center">
          <h1 className="text-4xl md:text-6xl font-black mb-4 text-white tracking-tight">قواعدنا وحكايتنا</h1>
          <p className="text-xl text-muted">عشان رحلتنا تبقى أحلى، محتاجين نكون سوا على قلب واحد</p>
        </header>

        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-charcoal border border-white/5 rounded-3xl p-8 md:p-12 shadow-2xl"
        >
          <h2 className="text-3xl font-black text-accent-gold mb-12 text-center border-b border-white/5 pb-6">سياسة الرحلة</h2>
          
          <div className="space-y-10" dir="rtl">
            <div className="flex items-start gap-6">
              <div className="bg-accent-green/20 p-4 rounded-xl shrink-0 mt-1">
                <svg className="w-8 h-8 text-accent-green" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" /></svg>
              </div>
              <div>
                <h3 className="text-2xl font-bold text-white mb-3">احنا كلنا عيلة واحدة</h3>
                <p className="text-muted text-lg leading-relaxed">أهم حاجة في رحلتنا إننا كلنا واحد. بنخاف على بعض، بنساعد بعض، ومحدش فينا غريب. البيت بيتك والناس ناسك.</p>
              </div>
            </div>

            <div className="flex items-start gap-6">
              <div className="bg-accent-green/20 p-4 rounded-xl shrink-0 mt-1">
                <svg className="w-8 h-8 text-accent-green" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
              </div>
              <div>
                <h3 className="text-2xl font-bold text-white mb-3">انبسط بكل لحظة</h3>
                <p className="text-muted text-lg leading-relaxed">سيب هموم الدنيا ورا ضهرك. إحنا جايين هنا عشان نفصل، نضحك من قلبنا، ونخلق ذكريات متتنسيش.</p>
              </div>
            </div>

            <div className="flex items-start gap-6">
              <div className="bg-accent-green/20 p-4 rounded-xl shrink-0 mt-1">
                <svg className="w-8 h-8 text-accent-green" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
              </div>
              <div>
                <h3 className="text-2xl font-bold text-white mb-3">احترم الوقت.. تكسب المتعة</h3>
                <p className="text-muted text-lg leading-relaxed">عشان منضيعش دقيقة من الفرحة، المواعيد عندنا مقدسة. التزامك بالوقت بيخلينا نستمتع بالبرنامج كامل من غير استعجال.</p>
              </div>
            </div>

             <div className="flex items-start gap-6">
              <div className="bg-accent-green/20 p-4 rounded-xl shrink-0 mt-1">
                <svg className="w-8 h-8 text-accent-green" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" /></svg>
              </div>
              <div>
                <h3 className="text-2xl font-bold text-white mb-3">اصنع ذكريات وصحاب</h3>
                <p className="text-muted text-lg leading-relaxed">الرحلة مش بس أماكن، الرحلة صحبة. دي فرصتك تتعرف على شخصيات جميلة وتعمل صداقات تعيش معاك العمر كله.</p>
              </div>
            </div>
            
             <div className="flex items-start gap-6">
              <div className="bg-accent-green/20 p-4 rounded-xl shrink-0 mt-1">
                <svg className="w-8 h-8 text-accent-green" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
              </div>
              <div>
                <h3 className="text-2xl font-bold text-white mb-3">الطاقة الإيجابية.. عدوى مطلوبة</h3>
                <p className="text-muted text-lg leading-relaxed">خليك مصدر بهجة للي حواليك. الكلمة الحلوة والضحكة الصافية هما وقود رحلتنا.</p>
              </div>
            </div>

          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default PolicyPage;
