import React from 'react';
import { motion } from 'framer-motion';
import { ExternalLink, Image as ImageIcon } from 'lucide-react';

const CommunityPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-nearblack pt-32 pb-24 flex flex-col items-center justify-center text-center px-6 relative overflow-hidden">
      {/* Background Elements */}
      <div className="absolute inset-0 z-0">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-accent-green/10 rounded-full blur-[100px]" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-accent-gold/5 rounded-full blur-[100px]" />
      </div>

      <div className="relative z-10 w-full max-w-4xl mx-auto space-y-12">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center space-y-4"
        >
          <h1 className="text-4xl md:text-6xl font-black text-white leading-tight">
            مجتمع <span className="text-accent-green">Sobek</span> 🌴
          </h1>
          <p className="text-xl text-white/60 font-medium max-w-2xl mx-auto leading-relaxed" dir="rtl">
            المكان اللي بنتجمع فيه، بنشير صورنا، وبنظبط خروجاتنا الجاية.
            <br />
            ده مش مجرد جروب، دي <span className="text-accent-gold">عيلتك الثانية</span> في السفر.
          </p>
        </motion.div>

        {/* Cards Grid */}
        <div className="grid md:grid-cols-2 gap-6 w-full">
          {/* WhatsApp Card */}
          <motion.a
            href="https://chat.whatsapp.com/H44WJeJse9IE5yF4XM8IUW"
            target="_blank"
            rel="noopener noreferrer"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            className="group relative bg-[#25D366]/10 border border-[#25D366]/20 p-8 rounded-[2rem] hover:bg-[#25D366]/20 transition-all duration-300 flex flex-col items-center text-center cursor-pointer overflow-hidden backdrop-blur-sm"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-[#25D366]/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

            <div className="w-20 h-20 bg-[#25D366] rounded-2xl flex items-center justify-center mb-6 shadow-lg shadow-[#25D366]/20 group-hover:scale-110 transition-transform duration-300">
              <svg className="w-10 h-10 text-white" fill="currentColor" viewBox="0 0 24 24"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.232-.298.347-.497.105-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z" /></svg>
            </div>

            <h3 className="text-2xl font-bold text-white mb-2">جروب الواتس</h3>
            <p className="text-white/70 mb-6" dir="rtl">عشان ما يفوتكش أي تحديث، وكل الصور والذكريات، وتعرف هنتجمع امتى وفين!</p>

            <div className="flex items-center gap-2 text-[#25D366] font-bold group-hover:gap-3 transition-all">
              <span>انضم للشلة</span>
              <ExternalLink className="w-5 h-5" />
            </div>
          </motion.a>

          {/* Photos Card */}
          <motion.a
            href="https://photos.app.goo.gl/ZwC5xnvfy2H4pPia8"
            target="_blank"
            rel="noopener noreferrer"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 }}
            className="group relative bg-accent-gold/10 border border-accent-gold/20 p-8 rounded-[2rem] hover:bg-accent-gold/20 transition-all duration-300 flex flex-col items-center text-center cursor-pointer overflow-hidden backdrop-blur-sm"
          >
            <div className="absolute inset-0 bg-gradient-to-bl from-accent-gold/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

            <div className="w-20 h-20 bg-accent-gold rounded-2xl flex items-center justify-center mb-6 shadow-lg shadow-accent-gold/20 group-hover:scale-110 transition-transform duration-300">
              <ImageIcon className="w-10 h-10 text-white" />
            </div>

            <h3 className="text-2xl font-bold text-white mb-2">ألبوم الذكريات</h3>
            <p className="text-white/70 mb-6" dir="rtl">كل الصور اللي اتصورت في الرحلة هتلاقيها هنا. ارفع صورك واتفرج على صور الناس التانية.</p>

            <div className="flex items-center gap-2 text-accent-gold font-bold group-hover:gap-3 transition-all">
              <span>شوف الصور</span>
              <ExternalLink className="w-5 h-5" />
            </div>
          </motion.a>
        </div>

        {/* Footer Note */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="text-center"
        >
          <p className="inline-block px-6 py-3 rounded-full bg-white/5 border border-white/10 text-white/50 text-sm" dir="rtl">
            ⚠️ تأكد انك حاجز مكانك في الرحلة قبل ما تنضم للجروب
          </p>
        </motion.div>
      </div>
    </div>
  );
};

export default CommunityPage;
