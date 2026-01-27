
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

      <div className="max-w-6xl mx-auto px-4 md:px-8 space-y-24">
        {episodes.map((ep, index) => (
          <motion.div
            key={ep.id}
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.8 }}
            className={`flex flex-col ${index % 2 === 0 ? 'md:flex-row' : 'md:flex-row-reverse'} gap-8 md:gap-16 items-start`}
          >
            {/* Visual Side */}
            <div className="w-full md:w-1/2 relative group rounded-2xl overflow-hidden aspect-video shadow-2xl">
              <img
                src={ep.image}
                alt={ep.title}
                className="w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-700"
              />
              <div className="absolute inset-0 bg-black/20 group-hover:bg-black/0 transition-colors" />
              <div className="absolute top-4 left-4 bg-accent-gold text-black font-black px-3 py-1 rounded text-xs uppercase tracking-wide">
                {ep.date}
              </div>
            </div>

            {/* Content Side */}
            <div className="w-full md:w-1/2 pt-4" dir="rtl">
              <div className="flex items-center gap-3 mb-4">
                <span className="text-white/40 font-mono text-sm">EPISODE 0{index + 1}</span>
                <div className="h-px w-12 bg-white/20" />
              </div>

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
            </div>
          </motion.div>
        ))}
      </div>

      <div className="mt-32 text-center pb-12">
        <p className="text-white/30 text-sm font-mono uppercase tracking-widest">End of Season 1</p>
      </div>
    </div>
  );
};

export default Program;
