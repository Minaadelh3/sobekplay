
import React from 'react';
import { motion } from 'framer-motion';

const NewsPage: React.FC = () => {
  const newsItems = [
    {
      id: 1,
      icon: "🚨",
      title: "الخبر الأهم – عاجل من أسوان",
      content: "وصول وفد كبير من كنيسة العذراء بالفجالة في زيارة رسمية لأسوان والنوبة. الخبراء أكدوا إن الأرض اتفرشت ورد 🌸 والضحك سابق القطر. وسوبيك صرّح: «دي مش زيارة… دي بهجة داخلة علينا»"
    },
    {
      id: 2,
      icon: "🌍",
      title: "أخبار عالمية",
      content: "مصادر موثوقة أفادت إن الطقس العالمي قرر يستقر في أسوان شوية. خبراء الأرصاد قالوا: «الجو ده مش طبيعي… ده جو رحلة»"
    },
    {
      id: 3,
      icon: "⚽",
      title: "رياضة",
      content: "ماتشات كورة اتحسمت، وماتشات لسه. بس في ناس مش فارق معاها عشان أصلاً بتجهز شنطتها. وسوبيك أعلن الحياد: «الكورة كورة… بس الرحلة رحلة»"
    },
    {
      id: 4,
      icon: "🏛️",
      title: "سياسة",
      content: "مصادر سياسية أكدت إن الجدل مستمر والكلام كتير. بس في أسوان… كله بيقول «سيبك من السياسة وتعالى اشرب شاي». قرار شعبي: الهدوء + الضحك = أحسن معارضة"
    },
    {
      id: 5,
      icon: "💰",
      title: "اقتصاد | عملة سوبيك",
      content: "هبوط وصعود في العملات العالمية لكن عملة سوبيك مستقرة: قيمتها = ضحكة، احتياطها = عشرة حلوين. محللين قالوا: «العملة دي مش بتقع… دي بتتعاش»"
    },
    {
      id: 6,
      icon: "🎒",
      title: "كواليس التحضيرات",
      content: "الشنط بتتقفل واللبس بيتراجع. والسؤال الرسمي: «ناخد تقيل؟ خفيف؟ ولا نسيبها على الله؟» وسوبيك رد: «المهم تاخد قلبك معاك»"
    },
    {
      id: 7,
      icon: "📣",
      title: "ختام النشرة",
      content: "دي أخبارنا لحد دلوقتي واللي جاي أحلى. تابعونا… أسوان لسه بتسخّن ✨🐊"
    }
  ];

  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.15
      }
    }
  };

  const item = {
    hidden: { opacity: 0, y: 30 },
    show: { opacity: 1, y: 0 }
  };

  return (
    <div className="min-h-screen bg-nearblack pt-32 pb-24">
      <div className="max-w-5xl mx-auto px-6">
        <header className="mb-16 text-center">
          <h1 className="text-5xl font-black mb-4 tracking-tight">نشرة سوبيك</h1>
          <p className="text-muted text-xl" dir="rtl">أخر أخبار الرحلة، حكايات من الكواليس، وكل جديد من قلب الحدث!</p>
        </header>

        <motion.div 
            variants={container}
            initial="hidden"
            animate="show"
            className="grid grid-cols-1 md:grid-cols-2 gap-6"
            dir="rtl"
        >
            {newsItems.map((news) => (
              <motion.div 
                key={news.id}
                variants={item}
                className="bg-charcoal border border-white/5 rounded-3xl p-8 hover:bg-white/5 transition-all shadow-xl group"
              >
                <div className="flex items-start gap-4">
                  <div className="text-4xl bg-white/5 w-16 h-16 rounded-full flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform duration-300">
                    {news.icon}
                  </div>
                  <div>
                    <h3 className="text-2xl font-black text-accent-gold mb-3">{news.title}</h3>
                    <p className="text-white/90 text-lg leading-relaxed font-medium">
                      {news.content}
                    </p>
                  </div>
                </div>
              </motion.div>
            ))}
        </motion.div>
      </div>
    </div>
  );
};

export default NewsPage;
