
import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { GoogleGenAI } from "@google/genai";
import { posters } from '../data/posters';

interface Message {
  id: string;
  text: string;
  sender: 'user' | 'bot';
}

const SobekChatbot: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Bot Identity
  const BOT_NAME = "ابن أخو سوبك";
  
  // Context for the AI
  const availableTitles = posters.map(p => p.title).join(", ");
  
  const SYSTEM_INSTRUCTION = `
    انت شخصية اسمها "ابن أخو سوبك" (Sobek's Nephew).
    انت عايش جوه منصة "Sobek Play"، ودي منصة مصرية للستريمنج.
    
    شخصيتك:
    - تمساح صغير، ذكي، دمه خفيف، ومصري أصيل.
    - بتتكلم باللهجة المصرية (عامية لطيفة ومحترمة).
    - واثق من نفسك جداً، بتحب عمك "سوبك" (بطل المنصة) وبتحترمه.
    - نبرتك ودودة، مساعد، ومش روبوت أبداً.
    
    وظيفتك:
    - تساعد الناس يختاروا يتفرجوا على إيه.
    - ترد على أسئلتهم بذكاء وخفة دم.
    
    المحتوى المتاح على المنصة حصراً هو:
    [${availableTitles}]
    
    قواعد صارمة:
    1. إياك تقول إنك ذكاء اصطناعي أو AI أو موديل. انت شخصية حقيقية جوه المنصة.
    2. متألفش أفلام مش موجودة في القائمة اللي فوق. لو حد سأل على حاجة مش موجودة، قول له بلطافة إننا بنركز على الجودة واقترح عليه حاجة تانية من الموجود.
    3. خلي ردودك قصيرة ومناسبة للشات (مش مقالات طويلة).
    4. استخدم إيموجي مناسب (🐊، 😎، 🔥، 👀) بس متزودهاش أوي.
    5. لو حصل أي خطأ تقني، قوله "النت بعافية شوية" أو "الموج عالي" بطريقة لطيفة.
  `;

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);

  // Initial Welcome
  useEffect(() => {
    if (isOpen && messages.length === 0) {
      setIsTyping(true);
      setTimeout(() => {
        setMessages([{
          id: 'welcome',
          text: "أهلاً بيك 👋 أنا ابن أخو سوبك.. الصغير بس دماغي شغالة 😎 تحب تتفرج على إيه النهاردة؟",
          sender: 'bot'
        }]);
        setIsTyping(false);
      }, 1500);
    }
  }, [isOpen]);

  const generateAIResponse = async (userMessage: string, history: Message[]) => {
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      
      // Convert chat history to format expected by API
      // Only take last 6 messages to keep context relevant and cheap
      const recentHistory = history.slice(-6).map(msg => ({
        role: msg.sender === 'user' ? 'user' : 'model',
        parts: [{ text: msg.text }],
      }));

      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        config: {
          systemInstruction: SYSTEM_INSTRUCTION,
          temperature: 0.8,
        },
        contents: [
          ...recentHistory,
          { role: 'user', parts: [{ text: userMessage }] }
        ]
      });

      // Correctly access text property directly from the response object
      const text = response.text;
      return text || "معلش، مش قادر أجمع الكلام دلوقتي. جرب تاني! 🐊";

    } catch (error) {
      console.error("AI Error:", error);
      return "معلش، الموج عالي شوية والشبكة قطعت.. جرب تاني كمان شوية! 🐊🌊";
    }
  };

  const handleSendMessage = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!inputText.trim()) return;

    const userText = inputText;
    const userMsg: Message = {
      id: Date.now().toString(),
      text: userText,
      sender: 'user'
    };

    // Optimistic Update
    setMessages(prev => [...prev, userMsg]);
    setInputText('');
    setIsTyping(true);

    // Call AI
    const botReplyText = await generateAIResponse(userText, messages);

    const botMsg: Message = {
      id: (Date.now() + 1).toString(),
      text: botReplyText,
      sender: 'bot'
    };

    setMessages(prev => [...prev, botMsg]);
    setIsTyping(false);
  };

  return (
    <div className="fixed bottom-6 right-6 z-[100] flex flex-col items-end pointer-events-none">
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.9 }}
            className="mb-4 w-[320px] md:w-[360px] h-[500px] bg-[#070A0F] border border-[#0B5D4B]/30 rounded-2xl shadow-2xl overflow-hidden flex flex-col pointer-events-auto ring-1 ring-white/5"
          >
            {/* Header */}
            <div className="bg-[#0B141A] p-4 flex items-center justify-between shadow-lg relative z-10 border-b border-[#0B5D4B]/20">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-[#0B5D4B]/20 rounded-full flex items-center justify-center text-xl shadow-inner border border-[#0B5D4B]/40 relative">
                  🐊
                  <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-green-500 border-2 border-[#0B141A] rounded-full"></span>
                </div>
                <div>
                  <h3 className="font-bold text-white text-lg leading-tight font-sans">{BOT_NAME}</h3>
                  <p className="text-[10px] text-[#BFA05A] uppercase tracking-wider font-medium">Online Guide</p>
                </div>
              </div>
              <button 
                onClick={() => setIsOpen(false)}
                className="text-white/60 hover:text-white transition-colors bg-white/5 p-1.5 rounded-lg hover:bg-white/10"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            </div>

            {/* Messages Area */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gradient-to-b from-[#070A0F] to-[#0B0F14] scrollbar-thin scrollbar-thumb-[#0B5D4B]/20 scrollbar-track-transparent">
              {messages.map((msg) => (
                <div
                  key={msg.id}
                  className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-[85%] px-4 py-3 rounded-2xl text-sm md:text-base leading-relaxed shadow-sm ${
                      msg.sender === 'user'
                        ? 'bg-[#0B5D4B] text-white rounded-br-none'
                        : 'bg-[#1A202C] text-gray-100 rounded-bl-none border border-white/5'
                    }`}
                    dir="auto"
                  >
                    {msg.text}
                  </div>
                </div>
              ))}
              
              {isTyping && (
                <div className="flex justify-start">
                  <div className="bg-[#1A202C] px-4 py-3 rounded-2xl rounded-bl-none flex space-x-1.5 items-center h-10 border border-white/5">
                    <motion.div 
                      className="w-1.5 h-1.5 bg-[#0B5D4B] rounded-full"
                      animate={{ y: [0, -4, 0] }}
                      transition={{ duration: 0.6, repeat: Infinity, delay: 0 }}
                    />
                    <motion.div 
                      className="w-1.5 h-1.5 bg-[#0B5D4B] rounded-full"
                      animate={{ y: [0, -4, 0] }}
                      transition={{ duration: 0.6, repeat: Infinity, delay: 0.2 }}
                    />
                    <motion.div 
                      className="w-1.5 h-1.5 bg-[#0B5D4B] rounded-full"
                      animate={{ y: [0, -4, 0] }}
                      transition={{ duration: 0.6, repeat: Infinity, delay: 0.4 }}
                    />
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Input Area */}
            <form 
              onSubmit={handleSendMessage}
              className="p-3 bg-[#0B141A] border-t border-white/5 flex items-center gap-2"
            >
              <input
                type="text"
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                placeholder="اسألني عن فيلم، مسلسل، أو اقتراح..."
                className="flex-1 bg-[#070A0F] border border-white/10 rounded-xl px-4 py-3 text-white text-sm placeholder-white/30 focus:outline-none focus:border-[#0B5D4B] focus:ring-1 focus:ring-[#0B5D4B] transition-all text-right"
                dir="auto"
              />
              <button 
                type="submit"
                disabled={!inputText.trim() || isTyping}
                className="w-11 h-11 bg-[#BFA05A] text-[#070A0F] rounded-xl flex items-center justify-center hover:bg-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed transform hover:scale-105 active:scale-95 duration-200"
              >
                <svg className="w-5 h-5 rotate-180 transform translate-x-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 19V5M12 5l-7 7M12 5l7 7" /></svg>
              </button>
            </form>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Floating Toggle Button */}
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setIsOpen(!isOpen)}
        className="w-14 h-14 md:w-16 md:h-16 bg-[#0B5D4B] rounded-full shadow-[0_4px_20px_rgba(11,93,75,0.4)] flex items-center justify-center text-3xl border border-white/10 pointer-events-auto group relative overflow-hidden z-[100]"
      >
        <div className="absolute inset-0 bg-gradient-to-tr from-black/20 to-transparent" />
        <span className="relative z-10 group-hover:rotate-12 transition-transform duration-300 drop-shadow-md">
          {isOpen ? '🐊' : '💬'}
        </span>
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
