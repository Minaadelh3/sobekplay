
import React, { useEffect } from 'react';
import { motion } from 'framer-motion';

const Program: React.FC = () => {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const episodes = [
    {
      id: "ep1",
      title: "Episode 1: The Arrival",
      date: "Tuesday, Feb 10",
      description: "الوصول لأرض السحر. البداية الحقيقية للحكاية.",
      image: "https://images.unsplash.com/photo-1540398604928-8687a38c2692?q=80&w=2072&auto=format&fit=crop", // Aswan/Philae vibe
      scenes: [
        { time: "12:00 PM", title: "Check-in at Hotel", desc: "استلام الغرف وبداية التسكين" },
        { time: "Afternoon", title: "The High Dam & Philae", desc: "زيارة السد العالي ومعبد فيلة العظيم" },
        { time: "Sunset", title: "Heissa Island Adventure", desc: "فسحة نيلية وجولة في جزيرة هيسا" },
        { time: "Evening", title: "Nubian Dinner", desc: "عشاء نوبي أصلي في قلب النيل" },
        { time: "Night", title: "Sound & Light", desc: "سهرة الصوت والضوء الأسطورية في المعبد" }
      ]
    },
    {
      id: "ep2",
      title: "Episode 2: River Chronicles",
      date: "Wednesday, Feb 11",
      description: "يوم في حب النيل. روقان، طبيعة، وأسرار النوبة.",
      image: "https://images.unsplash.com/photo-1628522307525-455648a7350c?q=80&w=2069&auto=format&fit=crop", // Nile/Felucca vibe
      scenes: [
        { time: "10:00 AM", title: "Nile Cruise Begins", desc: "جولة نيلية، جزيرة النباتات، ومحمية سالوجا وغزال" },
        { time: "Noon", title: "Nubian House Visit", desc: "ضيافة في بيت نوبي (شاي، جبنة، وفطير)" },
        { time: "Afternoon", title: "Barbar Village", desc: "شاطئ بربر والسباحة في النيل" },
        { time: "Evening", title: "Shopping Tour", desc: "سوق أسوان السياحي وشراء الهدايا" }
      ]
    },
    {
      id: "ep3",
      title: "Episode 3: Temple of the Sun",
      date: "Thursday, Feb 12",
      description: "مغامرة الفجر. الطريق إلى أبو سمبل ومواجهة التاريخ.",
      image: "https://images.unsplash.com/photo-1539650116455-8efdbcc64771?q=80&w=1974&auto=format&fit=crop", // Abu Simbel vibe
      scenes: [
        { time: "03:00 AM", title: "The Dawn Move", desc: "التحرك فجرًا لزيارة معبد أبو سمبل (اختياري)" },
        { time: "Morning", title: "Abu Simbel Temple", desc: "مشاهدة تعامد الشمس وزيارة المعبد العملاق" },
        { time: "Afternoon", title: "Relaxation", desc: "عودة للفندق ووقت حر للراحة" },
        { time: "Evening", title: "Farewell Gathering", desc: "سهرة ختامية وتجميع الصور والذكريات" }
      ]
    },
    {
      id: "ep4",
      title: "Episode 4: The Departure",
      date: "Friday, Feb 13",
      description: "الوداع... ولكنها ليست النهاية.",
      image: "https://images.unsplash.com/photo-1572252009286-268acec5ca0a?q=80&w=2070&auto=format&fit=crop", // Nubian Museum/Texture
      scenes: [
        { time: "09:00 AM", title: "Breakfast & Checkout", desc: "آخر فطار وبدء إجراءات المغادرة" },
        { time: "Morning", title: "Nubian Museum", desc: "زيارة متحف النوبة (كنوز الحضارة)" },
        { time: "Afternoon", title: "Final Goodbye", desc: "التوجه للمطار/المحطة والعودة للديار" }
      ]
    }
  ];

  const [expandedEpisode, setExpandedEpisode] = React.useState<string | null>(null);

  return (
    <div className="min-h-screen bg-nearblack pt-24 pb-24">
      {/* Hero Section */}
      <div className="relative h-[50vh] flex flex-col items-center justify-center text-center px-4 overflow-hidden mb-12">
        <div className="absolute inset-0 z-0">
          <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1628522307525-455648a7350c?q=80&w=2069&auto=format&fit=crop')] bg-cover bg-center opacity-30 blur-sm" />
          <div className="absolute inset-0 bg-gradient-to-b from-nearblack/50 via-nearblack/80 to-nearblack" />
        </div>

        <div className="relative z-10 max-w-4xl mx-auto space-y-4">
          <span className="text-accent-gold font-bold tracking-[0.2em] text-sm uppercase">Original Series</span>
          <h1 className="text-5xl md:text-8xl font-black text-white drop-shadow-2xl tracking-tight">
            THE ITINERARY
          </h1>
          <p className="text-xl md:text-2xl text-white/80 max-w-2xl mx-auto font-light">
            4 Days. Infinite Memories. <br />
            <span className="text-accent-green font-bold">Season 1: Aswan</span>
          </p>
        </div>
      </div>

      {/* Photo Upload CTA */}
      <div className="max-w-2xl mx-auto px-6 mb-24 text-center">
        <motion.a
          href="https://photos.app.goo.gl/ZwC5xnvfy2H4pPia8"
          target="_blank"
          rel="noopener noreferrer"
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          className="block group relative p-[2px] rounded-2xl overflow-hidden"
        >
          <div className="absolute inset-0 bg-gradient-to-r from-accent-gold via-accent-green to-accent-gold animate-gradient" />
          <div className="relative bg-charcoal rounded-2xl p-6 md:p-8 flex flex-col items-center gap-4">
            <div className="w-16 h-16 rounded-full bg-white/10 flex items-center justify-center group-hover:bg-white/20 transition-colors">
              <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
            </div>
            <h3 className="text-2xl font-bold text-white leading-tight">
              صور الرحلة 📸
            </h3>
            <p className="text-white/70 text-lg" dir="rtl">
              دوس هنا وشوف أو ارفع صورك<br />
              <span className="text-sm text-white/40">(خلى الكل يشوف السحر اللي صورته!)</span>
            </p>
          </div>
        </motion.a>
      </div>

      <div className="max-w-3xl mx-auto px-4 space-y-6">
        {episodes.map((ep, index) => (
          <motion.div
            key={ep.id}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: index * 0.1 }}
            className="group"
          >
            initial={false}
            animate={{ height: expandedEpisode === ep.id ? 'auto' : 0, opacity: expandedEpisode === ep.id ? 1 : 0 }}
            transition={{ duration: 0.3 }}
            className="overflow-hidden bg-[#0d0f14]"
              >
            <div className="p-6 md:p-8 border-t border-white/5 space-y-6 relative">
              <div className="absolute top-0 right-8 w-px h-full bg-white/10 hidden md:block" />

              {ep.scenes.map((scene, i) => (
                <div key={i} className="flex flex-col md:flex-row-reverse gap-4 md:gap-8 items-start md:items-center relative z-10" dir="rtl">
                  <div className="md:w-32 shrink-0 text-left md:text-right">
                    <span className="text-accent-green font-mono text-sm font-bold bg-accent-green/10 px-2 py-1 rounded">
                      {scene.time}
                    </span>
                  </div>
                  <div className="flex-1 text-right">
                    <h4 className="text-white text-lg font-bold">{scene.title}</h4>
                    <p className="text-white/50 text-sm mt-1">{scene.desc}</p>
                  </div>
                </div>
              ))}
            </div>

            {/* Image for Mobile (Inside expand) */}
            <div className="md:hidden w-full h-48 relative">
              <img src={ep.image} alt="" className="w-full h-full object-cover opacity-60" />
              <div className="absolute inset-0 bg-gradient-to-t from-[#0d0f14] to-transparent" />
            </div>
          </motion.div>
            </button>
    </motion.div>
  ))
}
      </div >

      <h2 className="text-3xl md:text-4xl font-black text-white mb-4 leading-tight">
        {ep.title}
      </h2>

      <p className="text-lg text-white/70 mb-8 border-r-4 border-accent-green pr-4 leading-relaxed">
        {ep.description}
      </p>

      <div className="space-y-6 relative">
        {/* Connection Line */}
        <div className="absolute top-2 right-[7px] bottom-0 w-px bg-white/10" />

        {ep.scenes.map((scene, i) => (
          <div key={i} className="flex gap-6 relative">
            <div className="w-4 h-4 rounded-full bg-nearblack border-2 border-accent-gold relative z-10 mt-1 shrink-0" />
            <div>
              <h4 className="text-white font-bold text-lg">{scene.title}</h4>
              <p className="text-white/50 text-sm mt-1">{scene.desc}</p>
              <span className="text-xs text-accent-green font-mono mt-2 block">{scene.time}</span>
            </div>
          </div>
        ))}
      </div>
    </div >
          </motion.div >
        ))}
      </div >

  <div className="mt-32 text-center pb-12">
    <p className="text-white/30 text-sm font-mono uppercase tracking-widest">End of Season 1</p>
  </div>
    </div >
  );
};

export default Program;
