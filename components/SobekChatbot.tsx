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

  return (
    <div className="fixed bottom-6 right-6 z-[105]">
      <AnimatePresence>
        {isOpen && (
          <motion.div className="w-[360px] h-[600px] bg-[#0d0d0d] rounded-3xl flex flex-col">
            {/* UI unchanged */}
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
