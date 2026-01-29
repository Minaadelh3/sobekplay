import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { findGuest, getRoommates, getFloorLabel, getRoomLabel, GuestResult } from '../services/roomsDirectory';
import { sendMessageToApi, ChatSuggestion } from '../services/chatClient';
import { Assignment } from '../data/rooms/types';

interface Message {
  id: string;
  text: string;
  sender: 'user' | 'bot';
  // Rich Content Types
  type?: 'text' | 'room_result' | 'candidates_list' | 'api_suggestions';
  data?: any;
  suggestions?: ChatSuggestion[]; // From API
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

  // Session State
  const [currentGuestId, setCurrentGuestId] = useState<string | null>(null);

  const BOT_NAME = "ابن أخو سوبك";

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
        addBotMessage(
          "مرحبتين يا غالي! 👋 أنا ابن أخو سوبك. محتاج تظبط أوضتك؟ ولا نشوف برنامج الرحلة؟ ولا نلعب؟",
          [
            { label: 'أوضتي فين؟', actionType: 'ROOM_LOOKUP', payload: {} },
            { label: 'برنامج الرحلة', actionType: 'NAVIGATE', payload: { path: '/program' } },
            { label: 'نلعب لعبة', actionType: 'NAVIGATE', payload: { path: '/games' } }
          ]
        );
        setIsTyping(false);
      }, 1000);
    }
  }, [isOpen]);

  // --- HELPERS ---

  const addBotMessage = (text: string, suggestions: ChatSuggestion[] = [], type: Message['type'] = 'text', data: any = null) => {
    setMessages(prev => [...prev, {
      id: Date.now().toString(),
      text,
      sender: 'bot',
      type,
      data,
      suggestions
    }]);
  };

  // --- CORE LOGIC ---

  const handleUserMessage = async (text: string) => {
    const lower = text.toLowerCase();

    // 1. LOCAL PRE-FLIGHT INTENT: ROOM LOOKUP
    const isRoomIntent = /أوضتي|اوضتي|odty|room|فين|مكان|تسكي|تسكين|fin|fen|mkany/.test(lower);

    // A) Explicit Room Request
    if (isRoomIntent) {
      if (currentGuestId) {
        const result = findGuest(currentGuestId);
        if (result.found && result.assignment) {
          setIsTyping(true);
          setTimeout(() => {
            addBotMessage(
              `أنت منورنا يا ${result.assignment!.personName.split(' ')[0]}! دي بياناتك:`,
              getContextualSuggestions(true),
              'room_result',
              { assignment: result.assignment, roommates: getRoommates(result.assignment!) }
            );
            setIsTyping(false);
          }, 800);
          return;
        }
      }

      // Remove trigger words
      const cleanQuery = lower.replace(/(فين|أوضتي|اوضتي|odty|room|my|is|accommodation|تسكين|مكاني|مكان)/g, '').trim();

      if (cleanQuery.length > 2) {
        const result = findGuest(cleanQuery);
        if (processGuestResult(result)) return;
      } else {
        replyLocal("قولي اسمك (عربي أو انجليزي) وأنا أجيبلك المفتاح فوراً! 🔑",
          [{ label: 'أنا مينا', actionType: 'ROOM_LOOKUP', payload: { query: 'Mina' } }]
        );
        return;
      }
    }

    // B) Heuristic: Is this JUST a name?
    if (text.split(' ').length <= 4 && !/لعب|برنامج|فيلم|اغنية|مواعيد/i.test(lower)) {
      const result = findGuest(text);
      if (result.found || (result.candidates && result.candidates.length > 0)) {
        if (processGuestResult(result)) return;
      }
    }

    // 2. SERVERLESS AI
    await callServerlessAI(text);
  };

  const processGuestResult = (result: GuestResult): boolean => {
    if (result.found && result.assignment) {
      setCurrentGuestId(result.assignment.personName);
      setIsTyping(true);
      setTimeout(() => {
        addBotMessage(
          `أهلاً يا ${result.assignment!.personName.split(' ')[0]}! لقيت مكانك:`,
          getContextualSuggestions(true),
          'room_result',
          { assignment: result.assignment, roommates: getRoommates(result.assignment!) }
        );
        setIsTyping(false);
      }, 800);
      return true;
    }
    if (result.candidates && result.candidates.length > 0) {
      setIsTyping(true);
      setTimeout(() => {
        addBotMessage(
          "لقيت كذا اسم قريب.. اختار اسمك:",
          [],
          'candidates_list',
          { options: result.candidates }
        );
        setIsTyping(false);
      }, 600);
      return true;
    }
    return false;
  };

  const replyLocal = (text: string, suggestions: ChatSuggestion[] = []) => {
    setIsTyping(true);
    setTimeout(() => {
      addBotMessage(text, suggestions);
      setIsTyping(false);
    }, 600);
  };

  const getContextualSuggestions = (hasRoom: boolean): ChatSuggestion[] => {
    if (hasRoom) {
      return [
        { label: 'نلعب إيه؟', actionType: 'OPEN_GAME', payload: {} },
        { label: 'برنامج الرحلة', actionType: 'NAVIGATE', payload: { path: '/program' } },
        { label: 'تغيير الاسم', actionType: 'CHANGE_NAME', payload: {} }
      ];
    }
    return [
      { label: 'أوضتي فين؟', actionType: 'ROOM_LOOKUP', payload: {} },
      { label: 'برنامج الرحلة', actionType: 'NAVIGATE', payload: { path: '/program' } }
    ];
  };

  // --- API CALL ---

  const callServerlessAI = async (userText: string) => {
    setIsTyping(true);
    try {
      // Transform current messages to simple chat history format for API
      const chatHistory = messages.map(m => ({
        role: m.sender === 'user' ? 'user' : 'assistant',
        content: m.text || (m.type === 'room_result' ? 'Room Info Card Shown' : '')
      })).filter(m => m.content);

      // Add current user msg
      chatHistory.push({ role: 'user', content: userText });

      const response = await sendMessageToApi(chatHistory as any, currentGuestId);

      addBotMessage(response.replyText, response.suggestions);

    } catch (e) {
      console.error("API Error", e);
      addBotMessage("معلش النت فصل مني لحظة 🐊.. قول تاني؟", getContextualSuggestions(!!currentGuestId));
    } finally {
      setIsTyping(false);
    }
  };


  // --- HANDLERS ---

  const handleSendMessage = (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!inputText.trim()) return;
    const text = inputText;
    // Optimistic User Msg
    setMessages(prev => [...prev, { id: Date.now().toString(), text, sender: 'user' }]);
    setInputText('');

    handleUserMessage(text);
  };

  const handleSuggestionClick = (sug: ChatSuggestion) => {
    // 1. Optimistic User Msg (Label)
    setMessages(prev => [...prev, { id: Date.now().toString(), text: sug.label, sender: 'user' }]);

    // 2. Action Logic
    switch (sug.actionType) {
      case 'NAVIGATE':
        handleNavClick(sug.payload.path);
        break;
      case 'ROOM_LOOKUP':
        if (sug.payload.query) {
          const result = findGuest(sug.payload.query);
          if (!processGuestResult(result)) {
            callServerlessAI(sug.label); // Fallback if query failed
          }
        } else {
          // Generic lookup trigger (will ask for name or use saved)
          handleUserMessage("أوضتي فين؟");
        }
        break;
      case 'OPEN_GAME':
        handleNavClick('/games');
        break;
      case 'OPEN_PROGRAM_DAY':
        handleNavClick('/program');
        break;
      case 'CHANGE_NAME':
        setCurrentGuestId(null);
        replyLocal("تمام، قول اسمك الجديد إيه؟");
        break;
      default:
        // Fallback: Send label to AI
        callServerlessAI(sug.label);
    }
  };

  const handleCandidateClick = (name: string) => {
    setMessages(prev => [...prev, { id: Date.now().toString(), text: name, sender: 'user' }]);
    const result = findGuest(name);
    processGuestResult(result);
  };

  const handleNavClick = (path: string) => {
    setIsOpen(false);
    window.dispatchEvent(new CustomEvent('tab-reset', { detail: { path } }));
    window.location.hash = path;
  };

  return (
    <div className={`fixed bottom-20 right-6 md:bottom-6 md:right-6 z-[105] flex flex-col items-end transition-all duration-500 ${isHidden ? 'opacity-0 translate-y-20 pointer-events-none' : 'opacity-100 translate-y-0'}`}>
      <AnimatePresence>
        {isOpen && !isHidden && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.9 }}
            className="mb-4 w-[calc(100vw-48px)] max-w-[360px] h-[600px] bg-[#0d0d0d] border border-amber-500/30 rounded-3xl shadow-2xl overflow-hidden flex flex-col pointer-events-auto ring-1 ring-white/5 font-arabic"
          >
            {/* Header */}
            <div className="bg-[#151515] p-4 flex items-center justify-between border-b border-white/5 relative overflow-hidden shrink-0">
              <div className="absolute top-0 right-0 w-full h-1 bg-gradient-to-l from-amber-500 to-transparent" />
              <div className="flex items-center space-x-3 relative z-10">
                <div className="w-11 h-11 bg-amber-500/10 rounded-full flex items-center justify-center text-2xl border border-amber-500/20 relative shadow-[0_0_15px_rgba(245,158,11,0.2)]">
                  🐊
                  <span className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-[#151515] rounded-full animate-pulse"></span>
                </div>
                <div>
                  <h3 className="font-bold text-white text-lg font-sans leading-none mb-1">{BOT_NAME}</h3>
                  <p className="text-[10px] text-amber-500 uppercase tracking-widest font-bold">Hybrid Concierge</p>
                </div>
              </div>
              <button onClick={() => setIsOpen(false)} className="text-white/40 hover:text-white bg-white/5 p-2 rounded-xl transition-colors hover:bg-white/10">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            </div>

            {/* Chat Area */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-[#0d0d0d] scrollbar-thin scrollbar-thumb-white/10">
              {messages.map((msg) => (
                <div key={msg.id} className={`flex flex-col space-y-2 ${msg.sender === 'user' ? 'items-end' : 'items-start'}`}>

                  {/* TEXT BUBBLE */}
                  {msg.text && (
                    <div className={`max-w-[85%] px-5 py-3 rounded-2xl text-sm md:text-base leading-relaxed shadow-sm ${msg.sender === 'user' ? 'bg-amber-600 text-white rounded-br-none' : 'bg-[#1e1e1e] text-gray-100 rounded-bl-none border border-white/5'}`} dir="auto">
                      {msg.text}
                    </div>
                  )}

                  {/* ROOM RESULT CARD */}
                  {msg.type === 'room_result' && msg.data && (
                    <div className="w-full max-w-[95%] bg-gradient-to-br from-[#1a1a1a] to-[#252525] border border-amber-500/30 rounded-2xl p-5 shadow-lg relative overflow-hidden mt-1 group cursor-default">
                      {/* Gold shimmer accent */}
                      <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/10 blur-3xl rounded-full -translate-y-1/2 translate-x-1/2" />

                      <h4 className="text-amber-500 text-[10px] font-black uppercase tracking-widest mb-3 flex items-center gap-2">
                        <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />
                        بطاقة تسكين
                      </h4>

                      <div className="flex justify-between items-end border-b border-white/10 pb-4 mb-4">
                        <div>
                          <div className="text-white/60 font-bold text-sm mb-1">{getFloorLabel(msg.data.assignment.floor)}</div>
                          <div className="text-3xl font-black text-white">{getRoomLabel(msg.data.assignment.room)}</div>
                        </div>
                        <div className="text-5xl opacity-80 grayscale group-hover:grayscale-0 transition-all duration-500">🗝️</div>
                      </div>

                      <div className="space-y-3">
                        <p className="text-[10px] text-white/40 font-bold uppercase tracking-widest">الروم ميتس (Roommates)</p>
                        <div className="flex flex-wrap gap-2">
                          {msg.data.roommates.map((mate: string, idx: number) => (
                            <span key={idx} className="px-3 py-1.5 bg-black/40 rounded-lg text-sm text-white/90 border border-white/5 font-medium">
                              {mate}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}

                  {/* CANDIDATES OPTIONS */}
                  {msg.type === 'candidates_list' && msg.data && (
                    <div className="flex flex-wrap gap-2 mt-1">
                      {msg.data.options.map((opt: string) => (
                        <button
                          key={opt}
                          onClick={() => handleCandidateClick(opt)}
                          className="px-4 py-2 bg-[#2a2a2a] hover:bg-amber-600 text-white text-sm border border-white/10 hover:border-amber-500 rounded-xl transition-all shadow-md"
                        >
                          {opt}
                        </button>
                      ))}
                    </div>
                  )}

                  {/* API SUGGESTIONS (PILLS) */}
                  {msg.suggestions && msg.suggestions.length > 0 && (
                    <div className="flex flex-wrap gap-2 mt-1 opacity-0 animate-[fadeIn_0.5s_ease-out_forwards] animation-delay-300">
                      {msg.suggestions.map((sug, idx) => (
                        <button
                          key={idx}
                          onClick={() => handleSuggestionClick(sug)}
                          className="px-3 py-1 bg-white/5 hover:bg-white/10 border border-white/10 rounded-full text-[11px] text-white/70 hover:text-white transition-all whitespace-nowrap"
                        >
                          {sug.label}
                        </button>
                      ))}
                    </div>
                  )}

                </div>
              ))}

              {isTyping && (
                <div className="flex justify-start">
                  <div className="bg-[#1e1e1e] px-4 py-3 rounded-2xl rounded-bl-none flex space-x-1.5 items-center h-10 border border-white/5">
                    <motion.div className="w-1.5 h-1.5 bg-white/50 rounded-full" animate={{ y: [0, -4, 0] }} transition={{ duration: 0.6, repeat: Infinity, delay: 0 }} />
                    <motion.div className="w-1.5 h-1.5 bg-white/50 rounded-full" animate={{ y: [0, -4, 0] }} transition={{ duration: 0.6, repeat: Infinity, delay: 0.2 }} />
                    <motion.div className="w-1.5 h-1.5 bg-white/50 rounded-full" animate={{ y: [0, -4, 0] }} transition={{ duration: 0.6, repeat: Infinity, delay: 0.4 }} />
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Input Area */}
            <form onSubmit={handleSendMessage} className="p-3 bg-[#151515] border-t border-white/5 flex items-center gap-2 shrink-0">
              <input
                type="text"
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                placeholder="اكتب اسمك أو اسألني..."
                className="flex-1 bg-[#0d0d0d] border border-white/10 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-amber-500/50 text-right placeholder-white/20 transition-colors"
                dir="auto"
              />
              <button
                type="submit"
                disabled={!inputText.trim() || isTyping}
                className="w-11 h-11 bg-amber-500 text-[#0d0d0d] rounded-xl flex items-center justify-center disabled:opacity-50 hover:scale-105 active:scale-95 transition-all shadow-lg shadow-amber-500/20"
              >
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
        className="w-14 h-14 md:w-16 md:h-16 bg-[#000] border-2 border-amber-500 rounded-full shadow-[0_4px_20px_rgba(245,158,11,0.3)] flex items-center justify-center text-3xl relative overflow-hidden active:scale-90 transition-transform group"
      >
        <span className="relative z-10 group-hover:scale-110 transition-transform duration-300">{isOpen ? '🐊' : '💬'}</span>
        {!isOpen && messages.length === 0 && (
          <span className="absolute top-1 right-1 flex h-3 w-3">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-500 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-3 w-3 bg-amber-500"></span>
          </span>
        )}
      </motion.button>
    </div>
  );
};

export default SobekChatbot;