
import React, { useEffect } from 'react';
import { motion } from 'framer-motion';

const Program: React.FC = () => {
  // Ensure page starts at the top when opened
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const schedule = [
    {
      id: "day1",
      title: "اليوم الاول | الثلاثاء 10 فبراير 2026 (اليوم الاول)",
      items: [
        { time: "12:00 AM", text: "الوصول اسوان واستلام الغرف (12 صباحاً)" },
        { time: "", text: "راحة خفيفة" },
        { time: "", text: "زيارة السد العالى + معبد فيلة" },
        { time: "", text: "دخول المعبد" },
        { time: "", text: "بالمراكب" },
        { time: "", text: "فسحة نيلية لزيارة جزيرة هيسا تنجار" },
        { time: "", text: "بوابة ايزيس واوزوريس" },
        { time: "", text: "وجبة الغذاء على جزيرة الاحلام" },
        { time: "", text: "وجبة نوبية (هيسا)" },
        { time: "", text: "معبد فيلة (الصوت والضوء)" },
        { time: "", text: "دخول الصوت والضوء بمعبد فيلة" },
        { time: "", text: "العودة للفندق" },
        { time: "", text: "العشاء (كل واحد مع نفسه)" },
        { time: "", text: "الاقامة (3 ليلة * 950 جنيه)" }
      ]
    },
    {
      id: "day2",
      title: "اليوم الثانى | الاربعاء 11 فبراير 2026 (اليوم الثانى)",
      items: [
        { time: "", text: "الاستيقاظ (يوم الروقان)" },
        { time: "8:00 AM", text: "الافطار بالفندق ثم التحرك" },
        { time: "10:00 AM", text: "بداية الجولة النيلية" },
        { time: "", text: "ساعة بالاتوبيس وساعة ونص الدير وساعة عودة للمرسى" },
        { time: "", text: "نص ساعة للجزيرة فى النيل وساعتين فى الجزيرة" },
        { time: "", text: "جزيرة النباتات + الالفنتين + مقياس النيل" },
        { time: "", text: "فيلا محمد طريح (الاغاخان) + فيلا محمد منير" },
        { time: "", text: "+ زيارة بيت فيلم مافيا ومشروب الجبنة على الفحم" },
        { time: "", text: "مشروب الجبنة على الفحم" },
        { time: "", text: "ومنها الى القرية النوبية غرب سهيل والتماسيح والصور" },
        { time: "", text: "الاستمتاع بالبيت النوبى مع الفطير المشلتت" },
        { time: "", text: "وجبة الفطير في البيت النوبي" },
        { time: "", text: "والزفة النوبى والصور" },
        { time: "", text: "فرقة الزفة النوبي" },
        { time: "", text: "العودة للفندق" }
      ]
    },
    {
      id: "day3",
      title: "اليوم الثالث | الخميس 12 فبراير 2026 (اليوم الثالث)",
      items: [
        { time: "3:00 AM", text: "الاستعداد لرحلة ابو سمبل (التحرك 3 فجراً)" },
        { time: "", text: "معبد ابو سمبل" },
        { time: "", text: "الافطار بالاتوبيس" },
        { time: "", text: "زيارة معبد ابو سمبل" },
        { time: "", text: "معبد كلابشة" },
        { time: "", text: "زيارة معبد كلابشة اثناء العودة من ابو سمبل" },
        { time: "", text: "العودة لأسوان" },
        { time: "", text: "راحة بالفندق حوالى 3 ساعات" },
        { time: "", text: "وجبة الغذاء بمطعم الدوكة على النيل" },
        { time: "", text: "مطعم الدوكة والفيو الرائع" },
        { time: "", text: "جولة حرة سوق اسوان" }
      ]
    },
    {
      id: "day4",
      title: "يوم العودة | الجمعة 13 فبراير 2026 (اليوم الرابع)",
      items: [
        { time: "6:00 AM", text: "الاستيقاظ والنزول بالحقائب بالاستقبال" },
        { time: "9:00 AM", text: "الافطار بالفندق" },
        { time: "12:00 PM", text: "زيارة متحف النوبة" },
        { time: "", text: "دير الانبا هدرا" },
        { time: "", text: "زيارة دير الانبا هدرا + ركوب الجمل" },
        { time: "", text: "وجبة الغذاء بمطعم عمورى" },
        { time: "", text: "وجبة الغذاء" },
        { time: "", text: "العودة للقاهرة" },
        { time: "", text: "التوجه لمحطة قطار اسوان والركوب للقاهرة" }
      ]
    }
  ];

  return (
    <div className="min-h-screen bg-nearblack pt-32 pb-24">
      <div className="max-w-4xl mx-auto px-4 md:px-6">
        <header className="mb-12 text-center">
            <h1 className="text-4xl md:text-5xl font-black mb-4 text-white" dir="rtl">برنامج الرحلة</h1>
            <div className="h-1 w-24 bg-accent-gold mx-auto rounded-full" />
        </header>

        <div className="space-y-12" dir="rtl">
          {schedule.map((day, index) => (
            <motion.div
              key={day.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="bg-charcoal border border-white/5 rounded-2xl overflow-hidden shadow-2xl"
            >
              {/* Day Header */}
              <div className="bg-white/5 border-b border-white/5 p-6 flex flex-col items-center justify-center">
                <h2 className="text-xl md:text-2xl font-black text-accent-gold text-center leading-relaxed">
                  {day.title}
                </h2>
              </div>

              {/* Activities List */}
              <div className="divide-y divide-white/5">
                {day.items.map((item, i) => (
                  <div 
                    key={i} 
                    className="flex flex-col sm:flex-row sm:items-start p-5 hover:bg-white/5 transition-colors group"
                  >
                    {/* Time Column */}
                    <div className="sm:w-32 shrink-0 mb-2 sm:mb-0 sm:ml-6 flex items-center sm:justify-end">
                      {item.time ? (
                        <span className="inline-block bg-accent-green/20 text-accent-green px-3 py-1.5 rounded-lg text-sm font-bold border border-accent-green/20">
                          {item.time}
                        </span>
                      ) : (
                        <span className="hidden sm:block w-2 h-2 rounded-full bg-white/10 group-hover:bg-accent-gold transition-colors mt-2" />
                      )}
                    </div>

                    {/* Activity Text */}
                    <div className="flex-1">
                      <p className={`text-lg text-white/90 leading-relaxed font-medium ${!item.time ? 'text-white/70' : ''}`}>
                        {item.text}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          ))}
        </div>
        
        {/* Footer Note */}
        <div className="mt-16 text-center">
            <p className="text-muted text-sm">
                نتمنى لكم رحلة سعيدة مليئة بالذكريات
            </p>
        </div>
      </div>
    </div>
  );
};

export default Program;
