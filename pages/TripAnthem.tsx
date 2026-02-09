import React from 'react';
import { useTabReset } from '../hooks/useTabReset';
import { motion, Variants } from 'framer-motion';
import BackButton from '../components/BackButton';
import { useAuth } from '../context/AuthContext';
import { doc, onSnapshot, setDoc } from 'firebase/firestore';
import { db } from '../lib/firebase';

const TripAnthem: React.FC = () => {
  // Animation for verses
  const containerVars: Variants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.15,
        delayChildren: 0.3
      }
    }
  };

  const verseVars: Variants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.8, ease: "easeOut" }
    }
  };

  // Reset Logic for Replaying Animations
  const [resetKey, setResetKey] = React.useState(0);
  const handleTabReset = React.useCallback(() => {
    setResetKey(prev => prev + 1);
  }, []);

  useTabReset('/she3ar-al-re7la', handleTabReset);

  // SoundCloud Link Logic
  const { user, isAdmin } = useAuth();
  const [soundcloudLink, setSoundcloudLink] = React.useState("https://soundcloud.com/ahmed-ismail-19/ekadoli-nubian-song");
  const [isEditing, setIsEditing] = React.useState(false);
  const [newLink, setNewLink] = React.useState("");

  // Check permissions: Admin or Uncle Joy Team
  const canEdit = isAdmin || user?.teamId === 'uncle_joy';

  // Listen for Link Updates
  React.useEffect(() => {
    const unsub = onSnapshot(doc(db, "content", "tripAnthem"), (doc) => {
      if (doc.exists() && doc.data().soundcloudLink) {
        setSoundcloudLink(doc.data().soundcloudLink);
      }
    });
    return () => unsub();
  }, []);

  const handleSaveLink = async () => {
    if (!newLink.trim()) return;
    try {
      await setDoc(doc(db, "content", "tripAnthem"), { soundcloudLink: newLink }, { merge: true });
      setIsEditing(false);
    } catch (error) {
      console.error("Error saving link:", error);
      alert("Failed to save link.");
    }
  };


  return (
    <div key={resetKey} className="min-h-screen bg-[#050505] text-white font-arabic safe-area-pb selection:bg-amber-500/30 overflow-x-hidden flex flex-col relative" dir="rtl">

      {/* Ambient Background - Dynamic & Rich */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute top-0 right-0 w-[80vw] h-[80vw] bg-amber-600/10 blur-[150px] rounded-full opacity-30 mix-blend-screen animate-pulse-slow" />
        <div className="absolute bottom-0 left-0 w-[70vw] h-[70vw] bg-blue-900/15 blur-[120px] rounded-full opacity-20" />
      </div>

      <BackButton />

      {/* Main Content */}
      <div className="flex-1 flex flex-col items-center justify-start pt-28 pb-32 px-6 relative z-10 w-full max-w-3xl mx-auto">

        <motion.div
          variants={containerVars}
          initial="hidden"
          animate="visible"
          className="text-center w-full space-y-16"
        >
          {/* Header Section */}
          <motion.div variants={verseVars} className="space-y-4">
            <h1 className="text-5xl md:text-7xl font-black text-transparent bg-clip-text bg-gradient-to-b from-amber-200 to-amber-600 drop-shadow-2xl font-sans tracking-tight">
              شِعار الرحلة
            </h1>
            <div className="w-24 h-1 bg-gradient-to-r from-transparent via-amber-500 to-transparent mx-auto rounded-full opacity-80" />
          </motion.div>

          {/* Lyrics Container */}
          <div className="space-y-16">

            {/* Verse 1 */}
            <div className="space-y-3">
              <motion.p variants={verseVars} className="text-2xl md:text-3xl text-white/90 font-bold leading-[2.2]">
                صحينا وإبتدت رحلتنا
              </motion.p>
              <motion.p variants={verseVars} className="text-2xl md:text-3xl text-white/90 font-bold leading-[2.2]">
                وأسوان هي محطتنا
              </motion.p>
              <motion.p variants={verseVars} className="text-2xl md:text-3xl text-white/90 font-bold leading-[2.2]">
                فيها راح نعرف حكايتنا
              </motion.p>
              <motion.p variants={verseVars} className="text-2xl md:text-3xl text-amber-400 font-black leading-[2.2] drop-shadow-md">
                ومعاكوا هتكمل فرحتنا
              </motion.p>
            </div>

            {/* Separator */}
            <motion.div variants={verseVars} className="flex justify-center opacity-30">
              <span className="text-2xl text-amber-200">✦</span>
            </motion.div>

            {/* Chorus 1 */}
            <div className="space-y-4 relative py-8 px-4">
              <div className="absolute inset-0 bg-gradient-to-b from-amber-500/5 to-transparent rounded-3xl blur-xl -z-10" />
              <motion.p variants={verseVars} className="text-3xl md:text-4xl font-bold text-white leading-relaxed">
                ياما قلت وياما حكيت
              </motion.p>
              <motion.p variants={verseVars} className="text-3xl md:text-4xl font-bold text-white leading-relaxed">
                وبصوت عالي أنا غنيت
              </motion.p>
              <motion.p variants={verseVars} className="text-3xl md:text-4xl font-black text-amber-500 leading-relaxed scale-105 inline-block drop-shadow-lg p-2">
                ياحبيبتى يامصر أنا جيت
              </motion.p>
              <motion.p variants={verseVars} className="text-4xl md:text-5xl font-black text-transparent bg-clip-text bg-gradient-to-tr from-amber-100 to-amber-400 leading-relaxed pt-2">
                إيكادولي يا كيميت ياكيميت
              </motion.p>
            </div>

            {/* Refrain 1 */}
            <div className="space-y-4">
              <motion.p variants={verseVars} className="text-2xl md:text-3xl text-white/80 font-medium leading-[2.2]">
                (إيكادولي يا كيميت ياكيميت)٢
              </motion.p>
              <motion.p variants={verseVars} className="text-2xl md:text-3xl text-white/80 font-medium leading-[2.2]">
                ياحبيبتى يامصر أنا جيت
              </motion.p>
              <motion.p variants={verseVars} className="text-2xl md:text-3xl text-white/80 font-medium leading-[2.2]">
                إيكادولي يا كيميت ياكيميت
              </motion.p>
            </div>

            {/* Separator */}
            <motion.div variants={verseVars} className="flex justify-center opacity-30">
              <span className="text-2xl text-amber-200">✦</span>
            </motion.div>

            {/* Verse 2 */}
            <div className="space-y-4">
              <motion.p variants={verseVars} className="text-2xl md:text-3xl text-white/90 font-bold leading-[2.2]">
                هنتعرف علي الأسرار
              </motion.p>
              <motion.p variants={verseVars} className="text-2xl md:text-3xl text-white/90 font-bold leading-[2.2]">
                وعين سوبيك بتطق شرار
              </motion.p>
              <motion.p variants={verseVars} className="text-2xl md:text-3xl text-white/90 font-bold leading-[2.2]">
                وإزاي النيل نازل هزار
              </motion.p>
              <motion.p variants={verseVars} className="text-2xl md:text-3xl text-amber-300 font-extrabold leading-[2.2]">
                (والدنيا )٢ و الدنيا بتحلي بعد مرار
              </motion.p>
            </div>

            {/* Refrain 2 */}
            <div className="space-y-4">
              <motion.p variants={verseVars} className="text-2xl md:text-3xl text-white/80 font-medium leading-[2.2]">
                (إيكادولي يا كيميت ياكيميت)٢
              </motion.p>
              <motion.p variants={verseVars} className="text-2xl md:text-3xl text-white/80 font-medium leading-[2.2]">
                ياحبيبتى يامصر أنا جيت
              </motion.p>
              <motion.p variants={verseVars} className="text-2xl md:text-3xl text-white/80 font-medium leading-[2.2]">
                إيكادولي يا كيميت ياكيميت
              </motion.p>
            </div>

            {/* Separator */}
            <motion.div variants={verseVars} className="flex justify-center opacity-30">
              <span className="text-2xl text-amber-200">✦</span>
            </motion.div>

            {/* Verse 3 - The Story */}
            <div className="space-y-4 bg-white/5 rounded-3xl p-8 border border-white/10 shadow-inner">
              <motion.p variants={verseVars} className="text-2xl md:text-3xl text-white font-bold leading-[2.2]">
                حدوتة مثيرة ومحبوبة
              </motion.p>
              <motion.p variants={verseVars} className="text-2xl md:text-3xl text-white font-bold leading-[2.2]">
                ماشية من أسوان للنوبة
              </motion.p>
              <motion.p variants={verseVars} className="text-2xl md:text-3xl text-amber-500 font-black leading-[2.2]">
                فيها لعنة وكنوز منهوبة
              </motion.p>
              <motion.p variants={verseVars} className="text-2xl md:text-3xl text-white font-bold leading-[2.2] pt-4">
                وقوالب صارت
              </motion.p>
              <motion.p variants={verseVars} className="text-3xl md:text-4xl text-amber-400 font-black leading-[2.2] scale-110 origin-center py-2">
                صارت ايه ؟
              </motion.p>
              <motion.p variants={verseVars} className="text-4xl md:text-5xl text-red-500 font-black leading-[2.2] drop-shadow-md rotate-2 origin-center">
                مقلوبة !
              </motion.p>
            </div>

            {/* Outro */}
            <div className="space-y-6 pt-8 pb-12">
              <motion.p variants={verseVars} className="text-2xl md:text-3xl text-white/70 font-medium leading-[2.2]">
                (إيكادولي يا كيميت ياكيميت)٢
              </motion.p>
              <motion.p variants={verseVars} className="text-2xl md:text-3xl text-white/70 font-medium leading-[2.2]">
                يا حبيبتي يا مصر انا جيت
              </motion.p>
              <motion.p variants={verseVars} className="text-3xl md:text-4xl text-white/90 font-bold leading-[2.2]">
                ايكادولي يا كيميت يا كيميت
              </motion.p>
              <motion.div variants={verseVars} className="pt-4">
                <p className="text-3xl md:text-5xl font-black text-transparent bg-clip-text bg-gradient-to-t from-amber-600 to-amber-200 opacity-90 leading-tight">
                  (ايكادولي)٢
                </p>
                <p className="text-2xl md:text-4xl font-bold text-amber-100/80 mt-2">
                  ايكادولي يا كيميت يا كيميت
                </p>
              </motion.div>
            </div>

          </div>

          {/* SoundCloud Link */}
          <motion.div
            variants={verseVars}
            className="flex flex-col items-center gap-4 pt-8"
          >
            {isEditing ? (
              <div className="flex flex-col items-center gap-2 bg-white/10 p-4 rounded-xl border border-white/20 w-full max-w-md">
                <input
                  type="text"
                  value={newLink}
                  onChange={(e) => setNewLink(e.target.value)}
                  placeholder="Paste SoundCloud URL here..."
                  className="w-full bg-black/50 border border-white/20 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-amber-500"
                />
                <div className="flex gap-2 w-full">
                  <button
                    onClick={() => setIsEditing(false)}
                    className="flex-1 px-4 py-2 bg-white/10 hover:bg-white/20 text-white rounded-lg font-bold transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleSaveLink}
                    className="flex-1 px-4 py-2 bg-amber-500 hover:bg-amber-600 text-black rounded-lg font-bold transition-colors"
                  >
                    Save
                  </button>
                </div>
              </div>
            ) : (
              <div className="relative group/container">
                <a
                  href={soundcloudLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group relative flex items-center justify-center w-24 h-24 bg-[#ff7700] rounded-full shadow-2xl shadow-orange-600/40 transition-all duration-300 hover:scale-110 hover:shadow-orange-600/60 active:scale-95"
                  aria-label="Play on SoundCloud"
                >
                  <div className="absolute inset-0 rounded-full border-4 border-white/20 scale-110 group-hover:scale-125 opacity-0 group-hover:opacity-100 transition-all duration-500" />
                  <svg className="w-12 h-12 text-white fill-current ml-1" viewBox="0 0 24 24">
                    <path d="M19.3,10.8c-0.2,0-0.4,0-0.6,0.1c-0.7-2.6-3.1-4.4-5.9-4.4c-2.3,0-4.3,1.2-5.4,3.1C7.1,9.4,6.8,9.4,6.5,9.4c-2.7,0-4.9,2.2-4.9,4.9 s2.2,4.9,4.9,4.9h12.8c2.4,0,4.4-2,4.4-4.4S21.7,10.8,19.3,10.8z" />
                  </svg>
                </a>

                {canEdit && (
                  <button
                    onClick={() => {
                      setNewLink(soundcloudLink);
                      setIsEditing(true);
                    }}
                    className="absolute -top-2 -right-2 bg-white text-black p-2 rounded-full shadow-lg opacity-0 group-hover/container:opacity-100 transition-opacity hover:bg-gray-100"
                    title="Edit Link"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                      <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
                    </svg>
                  </button>
                )}
              </div>
            )}
          </motion.div>

        </motion.div>
      </div>
    </div>
  );
};

export default TripAnthem;
