import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { db, storage } from '../lib/firebase';
import { collection, query, orderBy, limit, onSnapshot, addDoc, serverTimestamp, Timestamp } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { motion, AnimatePresence } from 'framer-motion';
import EmojiPicker, { Theme, EmojiStyle } from 'emoji-picker-react';

interface Message {
    id: string;
    text: string;
    uid: string;
    name: string;
    avatarUrl: string;
    type: 'text' | 'image' | 'audio';
    mediaUrl?: string;
    createdAt: Timestamp | null;
}

export default function TeamChatPopup() {
    const { user, activeTeam } = useAuth();
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState<Message[]>([]);
    const [newMessage, setNewMessage] = useState('');
    const [showEmojiPicker, setShowEmojiPicker] = useState(false);
    const [isRecording, setIsRecording] = useState(false);
    const [uploading, setUploading] = useState(false);
    const [recordingTime, setRecordingTime] = useState(0);

    const messagesEndRef = useRef<HTMLDivElement>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const mediaRecorderRef = useRef<MediaRecorder | null>(null);
    const audioChunksRef = useRef<Blob[]>([]);
    const timerRef = useRef<NodeJS.Timeout | null>(null);

    // Scroll to bottom
    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        if (isOpen) scrollToBottom();
    }, [messages, isOpen, showEmojiPicker]);

    // Subscribe to Messages
    useEffect(() => {
        if (!activeTeam?.id) return;

        const q = query(
            collection(db, `teams/${activeTeam.id}/messages`),
            orderBy('createdAt', 'asc'),
            limit(100)
        );

        const unsubscribe = onSnapshot(q, (snapshot) => {
            const msgs = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            } as Message));
            setMessages(msgs);
        });

        return () => unsubscribe();
    }, [activeTeam?.id]);

    // --- Actions ---

    const handleSend = async (e?: React.FormEvent) => {
        e?.preventDefault();
        const text = newMessage.trim();
        if (!text && !uploading) return;

        // Optimistic clear
        setNewMessage('');
        setShowEmojiPicker(false);

        try {
            await addDoc(collection(db, `teams/${activeTeam!.id}/messages`), {
                text: text,
                uid: user!.id,
                name: user!.name,
                avatarUrl: user!.avatar || '',
                type: 'text',
                createdAt: serverTimestamp()
            });
        } catch (error) {
            console.error("Failed to send", error);
        }
    };

    const handleEmojiClick = (emojiData: any) => {
        setNewMessage(prev => prev + emojiData.emoji);
    };

    const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        if (!e.target.files?.length || !user || !activeTeam) return;
        const file = e.target.files[0];
        setUploading(true);

        try {
            const storageRef = ref(storage, `teams/${activeTeam.id}/${Date.now()}_${file.name}`);
            await uploadBytes(storageRef, file);
            const url = await getDownloadURL(storageRef);

            await addDoc(collection(db, `teams/${activeTeam.id}/messages`), {
                text: 'Sent an image',
                uid: user.id,
                name: user.name,
                avatarUrl: user.avatar || '',
                type: 'image',
                mediaUrl: url,
                createdAt: serverTimestamp()
            });
        } catch (err) {
            console.error("Upload failed", err);
            alert("فشل رفع الصورة");
        } finally {
            setUploading(false);
        }
    };

    // --- Voice Recording ---
    const startRecording = async () => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            const mediaRecorder = new MediaRecorder(stream);
            mediaRecorderRef.current = mediaRecorder;
            audioChunksRef.current = [];

            mediaRecorder.ondataavailable = (event) => {
                if (event.data.size > 0) {
                    audioChunksRef.current.push(event.data);
                }
            };

            mediaRecorder.onstop = async () => {
                const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
                await uploadVoiceNote(audioBlob);
                stream.getTracks().forEach(track => track.stop());
            };

            mediaRecorder.start();
            setIsRecording(true);
            setRecordingTime(0);
            timerRef.current = setInterval(() => {
                setRecordingTime(prev => prev + 1);
            }, 1000);

        } catch (err) {
            console.error("Mic Error", err);
            alert("لازم تسمح باستخدام المايكروفون عشان تسجل");
        }
    };

    const stopRecording = () => {
        if (mediaRecorderRef.current && isRecording) {
            mediaRecorderRef.current.stop();
            setIsRecording(false);
            if (timerRef.current) clearInterval(timerRef.current);
        }
    };

    const uploadVoiceNote = async (blob: Blob) => {
        if (!user || !activeTeam) return;
        setUploading(true);
        try {
            const storageRef = ref(storage, `teams/${activeTeam.id}/voice/${Date.now()}.webm`);
            await uploadBytes(storageRef, blob);
            const url = await getDownloadURL(storageRef);

            await addDoc(collection(db, `teams/${activeTeam.id}/messages`), {
                text: 'Voice Note',
                uid: user.id,
                name: user.name,
                avatarUrl: user.avatar || '',
                type: 'audio',
                mediaUrl: url,
                createdAt: serverTimestamp()
            });
        } catch (err) {
            console.error("Voice Upload Failed", err);
        } finally {
            setUploading(false);
        }
    };

    const formatTime = (seconds: number) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    };

    if (!activeTeam) return null;

    return (
        <div className="fixed bottom-24 right-5 z-[9999] font-sans" dir="ltr">
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.9, y: 20 }}
                        className="w-[90vw] md:w-[400px] h-[580px] max-h-[75vh] bg-[#ECE5DD] rounded-2xl shadow-2xl flex flex-col overflow-hidden relative border border-gray-300"
                    >
                        {/* WhatsApp Header */}
                        <div className="bg-[#075E54] p-3 flex items-center gap-3 text-white shadow-md z-10">
                            <button onClick={() => setIsOpen(false)} className="md:hidden text-white">
                                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
                            </button>
                            <img
                                src={activeTeam.avatar}
                                alt={activeTeam.name}
                                className="w-10 h-10 rounded-full object-cover bg-white"
                            />
                            <div className="flex-1">
                                <h3 className="font-bold text-base leading-tight">{activeTeam.name}</h3>
                                <p className="text-xs text-green-200 truncate">
                                    {activeTeam.id === 'uncle_joy' ? 'Official Admin Channel' : `${activeTeam.totalPoints || 0} Points • Tap for info`}
                                </p>
                            </div>
                            <button onClick={() => setIsOpen(false)} className="p-2 hover:bg-white/10 rounded-full transition-colors">
                                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                            </button>
                        </div>

                        {/* Background Pattern */}
                        <div className="absolute inset-0 z-0 opacity-[0.06] pointer-events-none bg-[url('https://user-images.githubusercontent.com/15075759/28719144-86dc0f70-73b1-11e7-911d-60d70fcded21.png')] bg-repeat" />

                        {/* Messages Area */}
                        <div className="flex-1 overflow-y-auto p-4 space-y-2 z-10 scrollbar-thin scrollbar-thumb-gray-300">
                            {messages.map((msg) => {
                                const isMe = msg.uid === user?.id;
                                return (
                                    <div key={msg.id} className={`flex flex-col ${isMe ? 'items-end' : 'items-start'} mb-1`}>
                                        <div className={`
                                            relative px-3 py-1.5 rounded-lg max-w-[80%] shadow-sm text-sm
                                            ${isMe ? 'bg-[#DCF8C6] rounded-tr-none' : 'bg-white rounded-tl-none'}
                                        `}>
                                            {/* Sender Name */}
                                            {!isMe && (
                                                <p className={`text-[11px] font-bold mb-0.5 leading-none ${activeTeam.id === 'ra' ? 'text-orange-500' : 'text-teal-600'}`}>
                                                    {msg.name}
                                                </p>
                                            )}

                                            {/* Content */}
                                            {msg.type === 'text' && <span className="text-gray-900 whitespace-pre-wrap">{msg.text}</span>}

                                            {msg.type === 'image' && (
                                                <div className="mt-1 mb-1">
                                                    <img src={msg.mediaUrl} alt="shared" className="rounded-lg max-h-48 object-cover cursor-pointer hover:opacity-90 transition-opacity" onClick={() => window.open(msg.mediaUrl, '_blank')} />
                                                </div>
                                            )}

                                            {msg.type === 'audio' && (
                                                <audio controls src={msg.mediaUrl} className="mt-1 h-8 w-48" />
                                            )}

                                            {/* Time & Ticks */}
                                            <div className="flex items-center justify-end gap-1 mt-1 -mb-1 opacity-60">
                                                <span className="text-[10px]">
                                                    {msg.createdAt?.toDate().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) || 'Now'}
                                                </span>
                                                {isMe && <span className="text-blue-500 text-[10px]">✓✓</span>}
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                            <div ref={messagesEndRef} />
                        </div>

                        {/* Input Area */}
                        <div className="bg-[#F0F0F0] p-2 flex items-end gap-2 z-20 sticky bottom-0">
                            {/* Emoji Toggle */}
                            <button
                                onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                                className="p-2 text-gray-500 hover:text-gray-700 transition-colors"
                            >
                                <svg className="w-7 h-7" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm3.5-9c.83 0 1.5-.67 1.5-1.5S16.33 8 15.5 8 14 8.67 14 9.5s.67 1.5 1.5 1.5zm-7 0c.83 0 1.5-.67 1.5-1.5S9.33 8 8.5 8 7 8.67 7 9.5 7.67 11 8.5 11zm3.5 6.5c2.33 0 4.31-1.46 5.11-3.5H6.89c.8 2.04 2.78 3.5 5.11 3.5z" /></svg>
                            </button>

                            {/* Attach Media */}
                            <button
                                onClick={() => fileInputRef.current?.click()}
                                className="p-2 text-gray-500 hover:text-gray-700 transition-colors -ml-1"
                            >
                                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" /></svg>
                            </button>
                            <input type="file" ref={fileInputRef} onChange={handleFileUpload} accept="image/*" className="hidden" />

                            <div className="flex-1 bg-white rounded-2xl flex items-center px-4 py-2 shadow-sm border border-white focus-within:border-teal-500 transition-colors">
                                <textarea
                                    value={newMessage}
                                    onChange={(e) => setNewMessage(e.target.value)}
                                    placeholder="Type a message"
                                    className="w-full max-h-24 bg-transparent outline-none text-gray-800 text-sm resize-none overflow-hidden"
                                    rows={1}
                                    onKeyDown={(e) => {
                                        if (e.key === 'Enter' && !e.shiftKey) {
                                            e.preventDefault();
                                            handleSend();
                                        }
                                    }}
                                />
                            </div>

                            {/* Voice or Send Button */}
                            {newMessage.trim() || uploading ? (
                                <button
                                    onClick={(e) => handleSend(e)}
                                    disabled={uploading}
                                    className="p-3 bg-[#00897B] rounded-full text-white shadow-md hover:scale-105 active:scale-95 transition-all flex justify-center items-center"
                                >
                                    {uploading ? (
                                        <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                    ) : (
                                        <svg className="w-5 h-5 translate-x-0.5" viewBox="0 0 24 24" fill="currentColor"><path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z" /></svg>
                                    )}
                                </button>
                            ) : (
                                <button
                                    onMouseDown={startRecording}
                                    onMouseUp={stopRecording}
                                    onTouchStart={startRecording}
                                    onTouchEnd={stopRecording}
                                    className={`p-3 rounded-full text-white shadow-md transition-all flex justify-center items-center select-none
                                        ${isRecording ? 'bg-red-500 scale-110 animate-pulse' : 'bg-[#00897B] hover:scale-105'}
                                    `}
                                >
                                    {isRecording ? (
                                        <div className="flex items-center gap-1 font-mono text-[10px]">
                                            <div className="w-2 h-2 bg-white rounded-full" />
                                            {formatTime(recordingTime)}
                                        </div>
                                    ) : (
                                        <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor"><path d="M12 14c1.66 0 3-1.34 3-3V5c0-1.66-1.34-3-3-3S9 3.34 9 5v6c0 1.66 1.34 3 3 3z" /><path d="M17 11c0 2.76-2.24 5-5 5s-5-2.24-5-5H5c0 3.53 2.61 6.43 6 6.92V21h2v-3.08c3.39-.49 6-3.39 6-6.92h-2z" /></svg>
                                    )}
                                </button>
                            )}
                        </div>

                        {/* Emoji Picker Overlay */}
                        {showEmojiPicker && (
                            <div className="absolute bottom-16 left-0 right-0 z-30">
                                <EmojiPicker
                                    onEmojiClick={handleEmojiClick}
                                    autoFocusSearch={false}
                                    theme={Theme.LIGHT}
                                    emojiStyle={EmojiStyle.APPLE}
                                    height={300}
                                    width="100%"
                                    previewConfig={{ showPreview: false }}
                                />
                            </div>
                        )}
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Floating Toggle Button (WhatsApp Style) */}
            {!isOpen && (
                <button
                    onClick={() => setIsOpen(true)}
                    className="group relative flex items-center justify-center w-14 h-14 bg-[#25D366] rounded-full shadow-lg hover:bg-[#20bd5a] transition-all hover:scale-110 active:scale-95"
                >
                    <span className="absolute -top-1 -right-1 flex h-4 w-4">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-4 w-4 bg-red-500 text-[9px] text-white justify-center items-center font-bold font-sans">1</span>
                    </span>
                    <svg className="w-7 h-7 text-white" viewBox="0 0 24 24" fill="currentColor"><path d="M12.04 2C6.58 2 2.13 6.45 2.13 11.91C2.13 13.66 2.59 15.36 3.45 16.86L2.05 22L7.3 20.62C8.75 21.41 10.38 21.83 12.04 21.83C17.5 21.83 21.95 17.38 21.95 11.92C21.95 9.27 20.92 6.78 19.05 4.91C17.18 3.03 14.69 2 12.04 2ZM12.05 20.21C10.43 20.21 8.92 19.78 7.59 18.99L7.28 18.8L4.17 19.61L4.99 16.59L4.8 16.27C3.92 14.87 3.46 13.28 3.46 11.63C3.46 6.91 7.31 3.07 12.05 3.07C14.35 3.07 16.5 3.97 18.13 5.59C19.75 7.22 20.65 9.38 20.65 11.68C20.65 16.41 16.79 20.21 12.05 20.21Z" /></svg>
                </button>
            )}
        </div>
    );
}
