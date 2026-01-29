import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { findGuest, getRoommates, getFloorLabel, getRoomLabel, GuestResult } from '../services/roomsDirectory';
import { sendMessageToApi, ChatSuggestion } from '../services/chatClient';

interface Message {
  id: string;
  text: string;
  sender: 'user' | 'bot';
  type?: 'text' | 'room_result' | 'candidates_list';
  data?: any;
  suggestions?: ChatSuggestion[];
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

  const [currentGuestId, setCurrentGuestId] = useState<string | null>(null);
  const BOT_NAME = "ابن أخو سوبك";

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(scrollToBottom, [messages, isTyping]);

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
      }, 800);
    }
  }, [isOpen]);

  const addBotMessage = (
    text: string,
    suggestions: ChatSuggestion[] = [],
    type: Message['type'] = 'text',
    data: any = null
  ) => {
    setMessages(prev => [
      ...prev,
      { id: crypto.randomUUID(), text, sender: 'bot', type, data, suggestions }
    ]);
  };

  // ---------------- CORE LOGIC ----------------

  const handleUserMessage = async (rawText: string) => {
    const safeText = typeof rawText === 'string' ? rawText : '';
    const lower = safeText.toLowerCase();

    const isRoomIntent =
      /أوضتي|اوضتي|odty|room|فين|مكان|تسكي|تسكين|fin|fen|mkany/.test(lower);

    if (isRoomIntent) {
      if (currentGuestId) {
        const result = findGuest(currentGuestId);
        if (result.found && result.assignment) {
          setIsTyping(true);
          setTimeout(() => {
            addBotMessage(
              `أنت منورنا يا ${result.assignment.personName?.split(' ')[0] || 'صديقي'}! دي بياناتك:`,
              getContextualSuggestions(true),
              'room_result',
              { assignment: result.assignment, roommates: getRoommates(result.assignment) }
            );
            setIsTyping(false);
          }, 600);
          return;
        }
      }

      const cleanQuery = lower
        .replace(/(فين|أوضتي|اوضتي|odty|room|my|is|accommodation|تسكين|مكاني|مكان)/g, '')
        .trim();

      if (cleanQuery.length > 2) {
        if (processGuestResult(findGuest(cleanQuery))) return;
      } else {
        replyLocal("قولي اسمك وأنا أجيبلك أوضتك فورًا 🔑");
        return;
      }
    }

    if (safeText.split(' ').length <= 4) {
      if (processGuestResult(findGuest(safeText))) return;
    }

    await callServerlessAI(safeText);
  };

  const processGuestResult = (result: GuestResult): boolean => {
    if (result.found && result.assignment) {
      setCurrentGuestId(result.assignment.personName);
      setIsTyping(true);
      setTimeout(() => {
        addBotMessage(
          `لقيت مكانك يا ${result.assignment.personName.split(' ')[0]} 👌`,
          getContextualSuggestions(true),
          'room_result',
          { assignment: result.assignment, roommates: getRoommates(result.assignment) }
        );
        setIsTyping(false);
      }, 600);
      return true;
    }

    if (result.candidates?.length) {
      addBotMessage("اختار اسمك من دول 👇", [], 'candidates_list', {
        options: result.candidates
      });
      return true;
    }

    return false;
  };

  const replyLocal = (text: string, suggestions: ChatSuggestion[] = []) => {
    setIsTyping(true);
    setTimeout(() => {
      addBotMessage(text, suggestions);
      setIsTyping(false);
    }, 500);
  };

  const getContextualSuggestions = (hasRoom: boolean): ChatSuggestion[] =>
    hasRoom
      ? [
        { label: 'نلعب إيه؟', actionType: 'OPEN_GAME', payload: {} },
        { label: 'برنامج الرحلة', actionType: 'NAVIGATE', payload: { path: '/program' } },
        { label: 'تغيير الاسم', actionType: 'CHANGE_NAME', payload: {} }
      ]
      : [
        { label: 'أوضتي فين؟', actionType: 'ROOM_LOOKUP', payload: {} },
        { label: 'برنامج الرحلة', actionType: 'NAVIGATE', payload: { path: '/program' } }
      ];

  // ---------------- API ----------------

  const callServerlessAI = async (userText: string) => {
    setIsTyping(true);
    try {
      const chatHistory = messages.map(m => ({
        role: m.sender === 'user' ? 'user' : 'assistant',
        content: m.text || 'Card shown'
      }));

      chatHistory.push({ role: 'user', content: userText });

      const response = await sendMessageToApi(chatHistory as any, currentGuestId);

      addBotMessage(
        response?.reply || "مش متأكد يا كبير، بس ممكن نشوف سوا!",
        response?.suggestions || []
      );
    } catch (e) {
      console.error(e);
      addBotMessage("حصلت لخبطة بسيطة 😅 جرّب تاني.");
    } finally {
      setIsTyping(false);
    }
  };

  // ---------------- HANDLERS ----------------

  const handleSendMessage = (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!inputText.trim() || isTyping) return;

    const text = inputText;
    setInputText('');
    setMessages(prev => [...prev, { id: crypto.randomUUID(), text, sender: 'user' }]);
    handleUserMessage(text);
  };

  const handleSuggestionClick = (sug: ChatSuggestion) => {
    // 1. Optimistic User Msg (Label)
    setMessages(prev => [...prev, { id: crypto.randomUUID(), text: sug.label, sender: 'user' }]);

    // 2. Action Logic
    switch (sug.actionType) {
      case 'NAVIGATE':
        // Navigation Logic would go here (using Custom Event or Location)
        window.location.hash = sug.payload.path;
        break;
      case 'ROOM_LOOKUP':
        handleUserMessage("أوضتي فين؟");
        break;
      case 'OPEN_GAME':
        window.location.hash = '/games';
        break;
      case 'OPEN_PROGRAM_DAY':
        window.location.hash = '/program';
        break;
      case 'CHANGE_NAME':
        setCurrentGuestId(null);
        replyLocal("تمام، قول اسمك الجديد إيه؟");
        break;
      default:
        callServerlessAI(sug.label);
    }
  };

  const handleCandidateClick = (name: string) => {
    setMessages(prev => [...prev, { id: crypto.randomUUID(), text: name, sender: 'user' }]);
    if (processGuestResult(findGuest(name))) return;
  };

  return (
    <div className={`fixed bottom-6 right-6 z-[105]`}>
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="mb-4 w-[calc(100vw-48px)] max-w-[360px] h-[600px] bg-[#0d0d0d] border border-amber-500/30 rounded-3xl shadow-2xl overflow-hidden flex flex-col pointer-events-auto z-[9999]"
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

                  {/* CANDIDATES */}
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

                  {/* SUGGESTIONS */}
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
                disabled={false}
                className="flex-1 bg-[#0d0d0d] border border-white/10 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-amber-500/50 text-right placeholder-white/20 transition-colors pointer-events-auto"
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

      <button
        onClick={() => setIsOpen(o => !o)}
        className="w-16 h-16 bg-black border-2 border-amber-500 rounded-full text-3xl shadow-[0_4px_20px_rgba(245,158,11,0.3)] hover:scale-110 active:scale-95 transition-transform"
      >
        {isOpen ? '🐊' : '💬'}
      </button>
    </div>
  );
};

export default SobekChatbot;
