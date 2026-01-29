
import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { findGuest, getRoommates, getFloorLabel, getRoomLabel } from '../services/roomsDirectory';
import { sendMessageToApi } from '../services/chatClient';

// --- Assets ---
const BOT_AVATAR = "🐊";
const BOT_NAME = "ابن أخو سوبك";
const SESSION_KEY = "sobek_chat_welcomed";

interface Message {
  id: string;
  text: string;
  sender: 'user' | 'bot';
  isCard?: boolean;
  data?: any;
}

const SobekChatbot: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState("");
  const [isThinking, setIsThinking] = useState(false);

  const bottomRef = useRef<HTMLDivElement>(null);

  // --- Auto Scroll ---
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isThinking, isOpen]);

  // --- Session-Based Welcome ---
  useEffect(() => {
    if (isOpen) {
      const hasWelcomed = sessionStorage.getItem(SESSION_KEY);
      if (!hasWelcomed) {
        sessionStorage.setItem(SESSION_KEY, "true");
        setIsThinking(true);
        setTimeout(() => {
          addBotMessage(`أهلاً يا كبير! ${BOT_AVATAR} 
أنا معاك لو محتاج تعرف أوضتك فين أو تسأل عن البرنامج.`);
          setIsThinking(false);
        }, 800);
      }
    }
  }, [isOpen]);

  const addBotMessage = (text: string, isCard = false, data: any = null) => {
    setMessages(prev => [...prev, {
      id: crypto.randomUUID(),
      text,
      sender: 'bot',
      isCard,
      data
    }]);
  };

  const handleSend = async (e?: React.FormEvent) => {
    e?.preventDefault();
    const text = inputValue.trim();
    if (!text) return;

    // 1. UI Update
    setInputValue("");
    setMessages(prev => [...prev, { id: crypto.randomUUID(), text, sender: 'user' }]);

    // 2. Local Intent Check (Room Lookup)
    if (text.split(' ').length < 4) {
      const guest = findGuest(text);
      if (guest.found && guest.assignment) {
        setIsThinking(true);
        setTimeout(() => {
          addBotMessage(
            `لقيتك يا ${guest.assignment.personName.split(' ')[0]}!`,
            true,
            { ...guest.assignment, roommates: getRoommates(guest.assignment) }
          );
          setIsThinking(false);
        }, 600);
        return;
      }
    }

    // 3. AI Call
    setIsThinking(true);
    const response = await sendMessageToApi(text);
    setIsThinking(false);
    addBotMessage(response.reply);
  };

  return (
    <div className="fixed bottom-6 right-6 z-[9999] font-sans">
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="w-[calc(100vw-32px)] md:w-[380px] h-[600px] max-h-[80vh] bg-[#0A0A0A] border border-white/10 rounded-3xl shadow-2xl flex flex-col overflow-hidden ring-1 ring-white/5"
          >
            {/* Header */}
            <div className="bg-[#111] p-4 flex items-center justify-between border-b border-white/5">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-amber-500/10 rounded-full flex items-center justify-center text-xl border border-amber-500/20">
                  {BOT_AVATAR}
                </div>
                <div>
                  <h3 className="font-bold text-white text-sm">{BOT_NAME}</h3>
                  <div className="flex items-center gap-1.5 mt-0.5">
                    <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse" />
                    <span className="text-[10px] text-white/50 uppercase tracking-widest">Online</span>
                  </div>
                </div>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-white/10 text-white/50 hover:text-white transition-colors"
              >
                ✕
              </button>
            </div>

            {/* Chat Area */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gradient-to-b from-black/50 to-transparent">
              {messages.map((msg) => (
                <div key={msg.id} className={`flex flex-col ${msg.sender === 'user' ? 'items-end' : 'items-start'}`}>

                  {msg.isCard ? (
                    /* Room Result Card */
                    <div className="bg-[#151515] border border-amber-500/20 rounded-2xl p-4 w-[90%] mt-1">
                      <div className="flex justify-between items-start mb-3">
                        <div>
                          <div className="text-[10px] text-amber-500 uppercase font-bold tracking-widest mb-1">Room Assignment</div>
                          <div className="text-2xl font-bold text-white">{getRoomLabel(msg.data.room)}</div>
                        </div>
                        <div className="text-3xl opacity-50">🔑</div>
                      </div>
                      <div className="text-sm text-white/60 mb-4">{getFloorLabel(msg.data.floor)}</div>

                      <div className="space-y-2">
                        <div className="text-[10px] text-white/30 uppercase font-bold">Roommates</div>
                        <div className="flex flex-wrap gap-2">
                          {msg.data.roommates.map((m: string) => (
                            <span key={m} className="px-2 py-1 bg-white/5 rounded text-xs text-white/80 border border-white/5">{m}</span>
                          ))}
                        </div>
                      </div>
                    </div>
                  ) : (
                    /* Text Bubble */
                    <div className={`px-4 py-2.5 max-w-[85%] text-[14px] leading-6 rounded-2xl shadow-sm ${msg.sender === 'user'
                        ? 'bg-[#EAB308] text-black font-medium rounded-br-none'
                        : 'bg-[#1A1A1A] text-gray-200 rounded-bl-none border border-white/5'
                      }`}>
                      {msg.text}
                    </div>
                  )}
                </div>
              ))}

              {isThinking && (
                <div className="flex items-start">
                  <div className="bg-[#1A1A1A] px-4 py-3 rounded-2xl rounded-bl-none border border-white/5 flex gap-1.5">
                    <span className="w-1.5 h-1.5 bg-white/40 rounded-full animate-bounce [animation-delay:-0.3s]" />
                    <span className="w-1.5 h-1.5 bg-white/40 rounded-full animate-bounce [animation-delay:-0.15s]" />
                    <span className="w-1.5 h-1.5 bg-white/40 rounded-full animate-bounce" />
                  </div>
                </div>
              )}
              <div ref={bottomRef} />
            </div>

            {/* Input - ALWAYS ENABLED */}
            <form onSubmit={handleSend} className="p-3 bg-[#111] border-t border-white/5 flex gap-2">
              <input
                className="flex-1 bg-black border border-white/10 rounded-xl px-4 text-sm text-white focus:outline-none focus:border-amber-500/50 transition-colors placeholder:text-white/20"
                placeholder="Ask Sobek..."
                value={inputValue}
                onChange={e => setInputValue(e.target.value)}
                autoFocus
              />
              <button
                type="submit"
                className="w-10 h-10 bg-amber-500 rounded-xl flex items-center justify-center text-black hover:bg-amber-400 active:scale-95 transition-all text-lg"
                disabled={!inputValue.trim()}
              >
                ➤
              </button>
            </form>
          </motion.div>
        )}
      </AnimatePresence>

      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-14 h-14 bg-black border border-white/10 rounded-full flex items-center justify-center text-2xl shadow-xl hover:scale-105 active:scale-95 transition-all text-amber-500 z-50 ring-2 ring-amber-500/20"
      >
        {isOpen ? '🐊' : '💬'}
      </button>
    </div>
  );
};

export default SobekChatbot;
