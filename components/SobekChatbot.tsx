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

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  useEffect(() => {
    if (false) {
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
      }, 600);
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
          }, 500);
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
      }, 500);
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
    }, 400);
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

  const callServerlessAI = async (userText: string) => {
    setIsTyping(true);
    try {
      const response = await sendMessageToApi(userText, currentGuestId);
      addBotMessage(response.reply, response.suggestions || []);
    } catch {
      addBotMessage("حصلت لخبطة بسيطة 😅 جرّب تاني.");
    } finally {
      setIsTyping(false);
    }
  };

  const handleSendMessage = (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!inputText.trim() || isTyping) return;
    const text = inputText;
    setInputText('');
    setMessages(prev => [...prev, { id: crypto.randomUUID(), text, sender: 'user' }]);
    handleUserMessage(text);
  };

  const handleSuggestionClick = (sug: ChatSuggestion) => {
    setMessages(prev => [...prev, { id: crypto.randomUUID(), text: sug.label, sender: 'user' }]);
    switch (sug.actionType) {
      case 'NAVIGATE':
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
    processGuestResult(findGuest(name));
  };

  return (
    <div className="fixed bottom-6 right-6 z-[9999]">
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="mb-4 w-[calc(100vw-48px)] max-w-[360px] h-[600px] bg-[#0d0d0d] border border-amber-500/30 rounded-3xl shadow-2xl overflow-hidden flex flex-col pointer-events-auto"
          >
            <div className="bg-[#151515] p-4 flex items-center justify-between border-b border-white/5 shrink-0">
              <h3 className="text-white font-bold">{BOT_NAME}</h3>
              <button onClick={() => setIsOpen(false)} className="text-white/50">✕</button>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {messages.map(msg => (
                <div key={msg.id} className={msg.sender === 'user' ? 'text-right' : 'text-left'}>
                  <div className={msg.sender === 'user' ? 'bg-amber-600 text-white inline-block px-4 py-2 rounded-xl' : 'bg-[#1e1e1e] text-white inline-block px-4 py-2 rounded-xl'}>
                    {msg.text}
                  </div>
                </div>
              ))}
              {isTyping && <div className="text-white/50">...</div>}
              <div ref={messagesEndRef} />
            </div>

            <form onSubmit={handleSendMessage} className="p-3 flex gap-2 border-t border-white/5">
              <input
                value={inputText}
                onChange={e => setInputText(e.target.value)}
                className="flex-1 bg-black text-white px-4 py-2 rounded-xl outline-none"
                placeholder="اكتب هنا..."
              />
              <button type="submit" className="bg-amber-500 px-4 rounded-xl">➤</button>
            </form>
          </motion.div>
        )}
      </AnimatePresence>

      <button
        onClick={() => setIsOpen(o => !o)}
        className="w-16 h-16 bg-black border-2 border-amber-500 rounded-full text-3xl"
      >
        {isOpen ? '🐊' : '💬'}
      </button>
    </div>
  );
};

export default SobekChatbot;
