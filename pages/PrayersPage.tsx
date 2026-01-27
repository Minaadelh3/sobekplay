
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const PrayersPage: React.FC = () => {
  const [openSection, setOpenSection] = useState<number | null>(0);

  const toggleSection = (idx: number) => {
    setOpenSection(openSection === idx ? null : idx);
  };

  const prayers = [
    {
      id: 1,
      title: "صلاة باكر",
      subtitle: "The Morning Prayer",
      icon: "🌅",
      content: (
        <div className="space-y-8 text-right" dir="rtl">
          <div>
            <h3 className="text-xl font-bold text-accent-gold mb-3">صلاة الشكر</h3>
            <p className="text-lg leading-loose text-white/90">
              فلنشكر صانع الخيرات الرحوم الله، أبا ربنا وإلهنا ومخلصنا يسوع المسيح، لأنه سترنا وأعاننا، وحفظنا، وقبلنا إليه وأشفق علينا وعضدنا، وأتى بنا إلى هذه الساعة. هو أيضا فلنسأله أن يحفظنا في هذا اليوم المقدس وكل أيام حياتنا بكل سلام. الضابط الكل الرب إلهنا.
            </p>
          </div>
          <div>
            <h3 className="text-xl font-bold text-accent-gold mb-3">الصلاة الربانية</h3>
            <p className="text-lg leading-loose text-white/90">
              أبانا الذي في السموات. ليتقدس اسمك. ليأت ملكوتك. لتكن مشيئتك. كما في السماء كذلك على الأرض. خبزنا الذي للغد أعطنا اليوم. وأغفر لنا ذنوبنا كما نغفر نحن أيضا للمذنبين إلينا. ولا تدخلنا في تجربة. لكن نجنا من الشرير. بالمسيح يسوع ربنا لأن لك الملك والقوة والمجد إلى الأبد. آمين.
            </p>
          </div>
          <div>
            <h3 className="text-xl font-bold text-accent-gold mb-3">طلبة ختامية</h3>
            <p className="text-lg leading-loose text-white/90">
              يا رب، في هذا الصباح، استمع لصوت دعائي. املأ قلبي بسلامك، وقدني في كل خطوة اليوم بروحك القدوس. آمين.
            </p>
          </div>
        </div>
      )
    },
    {
      id: 2,
      title: "صلاة أثناء اليوم",
      subtitle: "Midday Prayer for Guidance",
      icon: "☀️",
      content: (
        <div className="space-y-8 text-right" dir="rtl">
          <div>
            <h3 className="text-xl font-bold text-accent-gold mb-3">المزمور الثالث والعشرون</h3>
            <p className="text-lg leading-loose text-white/90">
              الرب يرعاني فلا يعوزني شئ. في مراع خضر يسكنني، إلى ماء الراحة يوردني. يرد نفسي. يهدني إلى سبل البر من أجل اسمه. إن سلكت في وسط ظلال الموت فلا أخاف شرا، لأنك أنت معي. عصاك وعكازك هما يعزيانني.
            </p>
          </div>
          <div>
            <h3 className="text-xl font-bold text-accent-gold mb-3">طلبة</h3>
            <p className="text-lg leading-loose text-white/90">
              يا رب، في منتصف هذا اليوم، جدد قوتي. امنحني حكمة في قراراتي، وصبرًا في تعاملاتي، واجعلني نورًا لمن حولي. لا تتركني وحدي، بل كن أنت قائدي ومعيني في كل أمر. آمين.
            </p>
          </div>
        </div>
      )
    },
    {
      id: 3,
      title: "صلاة الغروب",
      subtitle: "Evening Prayer",
      icon: "🌇",
      content: (
        <div className="space-y-8 text-right" dir="rtl">
          <div>
            <h3 className="text-xl font-bold text-accent-gold mb-3">المزمور المائة والسادس عشر</h3>
            <p className="text-lg leading-loose text-white/90">
              سبحوا الربَّ يا جميع الأمم ولتباركه كافة الشعوب. لأن رحمته قد ثبتت علينا وحق الرب يدوم إلى الأبد هلليلويا.
            </p>
            <p className="text-lg leading-loose text-white/90 mt-4">
              اعترفوا للرب لأنه صالح وأن إلى الأبد رحمته. ليقل بيت إسرائيل إنه صالح وإن إلى الأبد رحمته.
            </p>
          </div>
          <div>
            <h3 className="text-xl font-bold text-accent-gold mb-3">شكر المساء</h3>
            <p className="text-lg leading-loose text-white/90">
              نشكرك يا رب لأنك أعنتنا لنعبر هذا اليوم بسلام، وأتيت بنا إلى المساء. اغفر لنا ما أخطأنا به إليك في القول أو الفعل أو الفكر، وامنحنا ليلة هادئة بغير خطية. آمين.
            </p>
          </div>
        </div>
      )
    },
    {
      id: 4,
      title: "صلاة النوم",
      subtitle: "Night Prayer for Rest",
      icon: "🌙",
      content: (
        <div className="space-y-8 text-right" dir="rtl">
          <div>
            <h3 className="text-xl font-bold text-accent-gold mb-3">تسبحة سمعان الشيخ</h3>
            <p className="text-lg leading-loose text-white/90">
              الآن يا سيدي تطلق عبدك بسلام حسب قولك، لأن عيني قد أبصرتا خلاصك الذي أعددته قدام جميع الشعوب. نورا تجلى للأمم، ومجدا لشعبك إسرائيل.
            </p>
          </div>
          <div>
            <h3 className="text-xl font-bold text-accent-gold mb-3">طلبة التوبة</h3>
            <p className="text-lg leading-loose text-white/90">
              هوذا أنا عتيد أن أقف أمام الديان العادل، مرعوبا ومرتعبا من كثرة ذنوبي. لكن توبي يا نفسي مادمتِ في الأرض ساكنة... اللهم ارحمني وخلصني.
            </p>
          </div>
          <div>
            <h3 className="text-xl font-bold text-accent-gold mb-3">التحليل</h3>
            <p className="text-lg leading-loose text-white/90">
              تفضل يا رب أن تحفظنا في هذه الليلة بغير خطية. لتكن رحمتك علينا يا رب كمثل اتكالنا عليك. اسمعنا يا الله مخلصنا يا رجاء أقطار الأرض كلها.
            </p>
          </div>
        </div>
      )
    }
  ];

  return (
    <div className="min-h-screen bg-[#090b10] pt-24 pb-32 text-white selection:bg-accent-gold/40 flex flex-col items-center">

      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="text-center mb-12 px-4"
      >
        <span className="text-accent-gold text-xs font-bold tracking-[0.3em] uppercase mb-4 block">Sacred Moments</span>
        <h1 className="text-4xl md:text-5xl font-black text-white mb-4 tracking-tight">El Agpyea – Daily Prayers</h1>
        <p className="text-white/50 text-lg font-serif italic max-w-xl mx-auto">
          A spiritual journey from sunrise to sunset.
        </p>
      </motion.div>

      <div className="w-full max-w-3xl px-4 space-y-4">
        {prayers.map((prayer, index) => (
          <div key={prayer.id} className="w-full">
            <motion.button
              onClick={() => toggleSection(index)}
              className={`w-full flex items-center justify-between p-6 rounded-2xl border transition-all duration-300 group ${openSection === index
                  ? 'bg-charcoal border-accent-gold/50 shadow-[0_0_30px_rgba(255,215,0,0.1)]'
                  : 'bg-charcoal/40 border-white/5 hover:bg-charcoal/60'
                }`}
            >
              <div className="flex items-center gap-4 md:gap-6 w-full">
                <span className={`text-3xl filter drop-shadow-lg transition-transform duration-300 ${openSection === index ? 'scale-125' : 'group-hover:scale-110'}`}>
                  {prayer.icon}
                </span>
                <div className="text-left flex-1">
                  <h2 className={`text-xl font-bold transition-colors ${openSection === index ? 'text-white' : 'text-white/80'}`}>
                    {prayer.title}
                  </h2>
                  <p className="text-white/40 text-sm">{prayer.subtitle}</p>
                </div>
                <div className={`w-8 h-8 rounded-full border border-white/10 flex items-center justify-center transition-all duration-300 ${openSection === index ? 'bg-accent-gold border-accent-gold rotate-180' : 'bg-transparent'}`}>
                  <svg className={`w-4 h-4 ${openSection === index ? 'text-black' : 'text-white/50'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
                </div>
              </div>
            </motion.button>

            <AnimatePresence>
              {openSection === index && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.4, ease: [0.04, 0.62, 0.23, 0.98] }}
                  className="overflow-hidden"
                >
                  <div className="p-8 md:p-10 bg-white/5 border-x border-b border-white/5 rounded-b-2xl -mt-2 relative">
                    <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />
                    {prayer.content}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        ))}
      </div>

      <footer className="mt-24 text-white/30 text-sm font-mono tracking-widest uppercase">
        Pray without ceasing
      </footer>

    </div>
  );
};

export default PrayersPage;