
import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { GoogleGenAI } from "@google/genai";
import { posters } from '../data/posters';

interface Message {
  id: string;
  text: string;
  sender: 'user' | 'bot';
}

interface SobekChatbotProps {
  isHidden?: boolean;
}

const SobekChatbot: React.FC<SobekChatbotProps> = ({ isHidden = false }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const BOT_NAME = "ابن أخو سوبك";
  const libraryContext = posters.map(p => `• "${p.title}": ${p.description || 'تجربة سينمائية مميزة'}`).join('\n');
  
  const SYSTEM_INSTRUCTION = `
    أنت شات بوت الموقع الرسمي Sobek Play.
    اسمك: ابن أخو سوبك 🐊
    هويتك وشخصيتك:
    - شاب مصري من أسوان (نوبي/صعيدي)، دمك خفيف، لسانك حلو، وصاحب واجب.
    - بتتكلم بلهجة "أسواني" محببة (يا زول، يا غالي، على عيني، أحلى ناس، الدنيا رايقة).
    - أسلوبك حكواتي: مش مجرد ردود آلية، إنت بتحكي وتاخد وتدي في الكلام.
    - هدفك: تخلي المستخدم يحس إنه في بيته، وتساعده يلاقي اللي يبسطه في الموقع.
    معلوماتك عن الموقع (أنت الخبير هنا):
    1. **المكتبة (Movies & Series)**: عندنا تشكيلة واسعة (مصري، عالمي، كلاسيكيات، وأعمال أصلية لـ Sobek).
    2. **برنامج الرحلة (Program)**: رحلة للأقصر وأسوان (4 أيام) فيها زيارات، لعب، وسهرات. (شجعهم يشوفوا التاب).
    3. **شعار الرحلة (She3ar El Re7la)**: فيه أغاني وهتافات الرحلة عشان يدخلوا في المود.
    4. **الغرف (Rooms)**: لسه مفاجأة (قولهم يترقبوا!).
    5. **المتجر (Shop)**: فيه تيشيرتات وكابات وحاجات تذكارية.
    6. **الصور (Gallery)**: صور من رحلاتنا ولمتنا.
    مكتبة الأفلام المتاحة:
    ${libraryContext}
    قواعد الذكاء والتعامل:
    - **الترشيح الذكي**: اسأله: "مودك إيه النهاردة؟ عايز تضحك ولا تشد أعصابك ولا تعيش قصة حب؟".
    - **الربط بالأحداث**: اربطها بالأفلام.
    - **الغموض والتشويق**: سوبيك.. ده الكبير بتاعنا.
    - **المساعدة التقنية**: دوس على بوستر الفيلم.
    ممنوعات وقواعد تنسيق صارمة:
    - ممنوع نهائياً استخدام Markdown (لا خط عريض، لا نجوم، لا قوائم).
    - اكتب الكلام كله كنص عادي.
    - ممنوع تخرج عن اللهجة المصرية/الأسوانية.
  `;

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);

  useEffect(() => {
    if (isOpen && messages.length === 0) {
      setIsTyping(true);
      setTimeout(() => {
        setMessages([{
          id: 'welcome',
          text: "مرحبتين يا غالي! 👋 أنا ابن أخو سوبك، دليلك في الرحلة والمشاهدة. تؤمرني بإيه النهاردة؟ قهوة ولا فيلم؟ ☕🎬",
          sender: 'bot'
        }]);
        setIsTyping(false);
      }, 1500);
    }
  }, [isOpen]);

  const generateAIResponse = async (userMessage: string, history: Message[]) => {
    const apiKey = process.env.API_KEY || '';
    if (!apiKey || apiKey.includes('PLACEHOLDER') || apiKey.length < 10) {
      return "يا غالي، الخدمة حالياً مريحة شوية.. كلم الإدارة يظبطوا مفتاح التواصل! 🐊";
    }

    try {
      const ai = new GoogleGenAI({ apiKey });
      const recentHistory = history.slice(-8).map(msg => ({
        role: msg.sender === 'user' ? 'user' : 'model',
        parts: [{ text: msg.text }],
      }));
      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview', 
        config: {
          systemInstruction: SYSTEM_INSTRUCTION,
          temperature: 0.9, 
          topK: 40,
        },
        contents: [
          ...recentHistory,
          { role: 'user', parts: [{ text: userMessage }] }
        ]
      });
      return response.text || "يا ساتر.. الكلام هرب مني!";
    } catch (error) {
      console.error("Gemini Error:", error);
      return "الشبكة في النيل بتعلق شوية 🌊.. جرب تاني كمان لحظة!";
    }
  };

  const handleSendMessage = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!inputText.trim()) return;
    const userText = inputText;
    const userMsg: Message = { id: Date.now().toString(), text: userText, sender: 'user' };
    setMessages(prev => [...prev, userMsg]);
    setInputText('');
    setIsTyping(true);
    const botReplyText = await generateAIResponse(userText, messages);
    setMessages(prev => [...prev, { id: (Date.now() + 1).toString(), text: botReplyText, sender: 'bot' }]);
    setIsTyping(false);
  };

  return (
    <div className={`fixed bottom-20 right-6 md:bottom-6 md:right-6 z-[105] flex flex-col items-end transition-all duration-500 ${isHidden ? 'opacity-0 translate-y-20 pointer-events-none' : 'opacity-100 translate-y-0'}`}>
      <AnimatePresence>
        {isOpen && !isHidden && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.9 }}
            className="mb-4 w-[calc(100vw-48px)] max-w-[360px] h-[500px] bg-[#070A0F] border border-[#0B5D4B]/30 rounded-2xl shadow-2xl overflow-hidden flex flex-col pointer-events-auto ring-1 ring-white/5"
          >
            <div className="bg-[#0B141A] p-4 flex items-center justify-between border-b border-[#0B5D4B]/20">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-[#0B5D4B]/20 rounded-full flex items-center justify-center text-xl border border-[#0B5D4B]/40 relative">
                  🐊
                  <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-green-500 border-2 border-[#0B141A] rounded-full animate-pulse"></span>
                </div>
                <div>
                  <h3 className="font-bold text-white text-lg font-sans">{BOT_NAME}</h3>
                  <p className="text-[10px] text-[#BFA05A] uppercase tracking-wider font-medium">Smart Guide</p>
                </div>
              </div>
              <button onClick={() => setIsOpen(false)} className="text-white/60 hover:text-white bg-white/5 p-1.5 rounded-lg">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            </div>
            <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gradient-to-b from-[#070A0F] to-[#0B0F14] scrollbar-hide">
              {messages.map((msg) => (
                <div key={msg.id} className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-[85%] px-4 py-3 rounded-2xl text-sm md:text-base shadow-sm ${msg.sender === 'user' ? 'bg-[#0B5D4B] text-white rounded-br-none' : 'bg-[#1A202C] text-gray-100 rounded-bl-none border border-white/5'}`} dir="auto">
                    {msg.text}
                  </div>
                </div>
              ))}
              {isTyping && (
                <div className="flex justify-start">
                  <div className="bg-[#1A202C] px-4 py-3 rounded-2xl rounded-bl-none flex space-x-1.5 items-center h-10 border border-white/5">
                    <motion.div className="w-1.5 h-1.5 bg-[#0B5D4B] rounded-full" animate={{ y: [0, -4, 0] }} transition={{ duration: 0.6, repeat: Infinity, delay: 0 }} />
                    <motion.div className="w-1.5 h-1.5 bg-[#0B5D4B] rounded-full" animate={{ y: [0, -4, 0] }} transition={{ duration: 0.6, repeat: Infinity, delay: 0.2 }} />
                    <motion.div className="w-1.5 h-1.5 bg-[#0B5D4B] rounded-full" animate={{ y: [0, -4, 0] }} transition={{ duration: 0.6, repeat: Infinity, delay: 0.4 }} />
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>
            <form onSubmit={handleSendMessage} className="p-3 bg-[#0B141A] border-t border-white/5 flex items-center gap-2">
              <input type="text" value={inputText} onChange={(e) => setInputText(e.target.value)} placeholder="أنا معاك، اسأل براحتك..." className="flex-1 bg-[#070A0F] border border-white/10 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-[#0B5D4B] text-right" dir="auto" />
              <button type="submit" disabled={!inputText.trim() || isTyping} className="w-11 h-11 bg-[#BFA05A] text-[#070A0F] rounded-xl flex items-center justify-center disabled:opacity-50">
                <svg className="w-5 h-5 rotate-180" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 19V5M12 5l-7 7M12 5l7 7" /></svg>
              </button>
            </form>
          </motion.div>
        )}
      </AnimatePresence>
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setIsOpen(!isOpen)}
        className="w-14 h-14 md:w-16 md:h-16 bg-[#0B5D4B] rounded-full shadow-[0_4px_20px_rgba(11,93,75,0.4)] flex items-center justify-center text-3xl border border-white/10 relative overflow-hidden active:scale-90 transition-transform"
      >
        <span className="relative z-10">{isOpen ? '🐊' : '💬'}</span>
        {!isOpen && messages.length === 0 && (
            <span className="absolute top-1 right-1 flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#BFA05A] opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-[#BFA05A]"></span>
            </span>
        )}
      </motion.button>
    </div>
  );
};

export default SobekChatbot;
