import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import BackButton from '../components/BackButton';
import { CITY_INFO_DATA, InfoTopic } from '../data/cityInfo';
import {
    ArrowRight,
    Search,
    X
} from 'lucide-react';

const TopicCard = ({ topic, onClick, index }: { topic: InfoTopic; onClick: () => void; index: number }) => (
    <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: index * 0.05 }}
        onClick={onClick}
        className="group cursor-pointer relative overflow-hidden rounded-3xl bg-[#121820] border border-white/5 hover:border-white/20 transition-all duration-300 h-64 flex flex-col justify-between p-6"
    >
        {/* Hover Gradient Background */}
        <div className={`absolute inset-0 bg-gradient-to-br ${topic.gradient} opacity-0 group-hover:opacity-20 transition-opacity duration-500`} />

        <div className="relative z-10 flex justify-between items-start">
            <div className="w-12 h-12 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center text-3xl group-hover:scale-110 transition-transform duration-300">
                {topic.icon}
            </div>
            <span className="text-[10px] font-bold tracking-wider uppercase bg-white/5 px-2 py-1 rounded-md text-white/50 group-hover:bg-white/10 group-hover:text-white/80 transition-colors">
                {topic.category}
            </span>
        </div>

        <div className="relative z-10">
            <h3 className="text-2xl font-black text-white mb-1 group-hover:text-accent-gold transition-colors">
                {topic.title}
            </h3>
            {topic.subtitle && (
                <p className="text-white/50 text-sm font-medium line-clamp-1">
                    {topic.subtitle}
                </p>
            )}
        </div>

        {/* Decorative Circle */}
        <div className="absolute -bottom-10 -right-10 w-32 h-32 bg-white/5 rounded-full blur-2xl group-hover:bg-white/10 transition-colors" />
    </motion.div>
);

const DetailView = ({ topic, onClose }: { topic: InfoTopic; onClose: () => void }) => (
    <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="fixed inset-0 z-50 bg-[#050505] overflow-y-auto custom-scrollbar flex flex-col"
    >
        {/* Sticky Header */}
        <div className="sticky top-0 z-50 bg-[#050505]/80 backdrop-blur-xl border-b border-white/5 px-6 py-4 flex justify-between items-center">
            <button
                onClick={onClose}
                className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center text-white hover:bg-white/10 transition-colors"
            >
                <ArrowRight size={20} />
            </button>
            <h2 className="text-lg font-bold text-white/90">{topic.title}</h2>
            <div className="w-10" /> {/* Spacer for balance */}
        </div>

        {/* Hero Section */}
        <div className={`relative h-[40vh] min-h-[300px] w-full bg-gradient-to-b ${topic.gradient} flex items-end p-8`}>
            <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 mix-blend-overlay" />
            <div className="absolute inset-0 bg-gradient-to-t from-[#050505] to-transparent" />

            <div className="relative z-10 max-w-4xl mx-auto w-full">
                <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-md border border-white/10 px-3 py-1 rounded-full text-xs font-bold text-white/80 mb-4">
                    <span>{topic.icon}</span>
                    <span>{topic.category}</span>
                </div>
                <h1 className="text-4xl md:text-6xl font-black text-white mb-2 leading-tight drop-shadow-xl">{topic.title}</h1>
                {topic.subtitle && <p className="text-xl md:text-2xl text-white/70 font-medium">{topic.subtitle}</p>}
            </div>
        </div>

        {/* Content Body */}
        <div className="flex-1 max-w-3xl mx-auto w-full px-6 py-12 space-y-12">

            {/* Intro */}
            {topic.content.intro && (
                <div className="text-xl md:text-2xl leading-loose text-white/90 font-medium border-r-4 border-accent-gold/50 pr-6">
                    {topic.content.intro}
                </div>
            )}

            {/* Sections */}
            <div className="space-y-12">
                {topic.content.sections.map((section, idx) => (
                    <motion.div
                        key={idx}
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: idx * 0.1 }}
                        className="bg-[#121820] rounded-3xl p-6 md:p-8 border border-white/5"
                    >
                        {section.heading && (
                            <h3 className="text-2xl font-bold text-accent-gold mb-6 flex items-center gap-3">
                                <span className="w-2 h-2 rounded-full bg-accent-gold" />
                                {section.heading}
                            </h3>
                        )}

                        {section.body && (
                            <p className="text-lg text-white/70 leading-loose mb-6">
                                {section.body}
                            </p>
                        )}

                        {section.bullets && (
                            <ul className="space-y-4">
                                {section.bullets.map((bullet, bIdx) => (
                                    <li key={bIdx} className="flex items-start gap-3 text-white/80 text-lg leading-relaxed">
                                        <span className="mt-2 w-1.5 h-1.5 rounded-full bg-white/40 shrink-0" />
                                        <span>{bullet}</span>
                                    </li>
                                ))}
                            </ul>
                        )}
                    </motion.div>
                ))}
            </div>

            {/* Footer */}
            <div className="pt-12 text-center">
                <button
                    onClick={onClose}
                    className="px-8 py-3 rounded-full bg-white/5 border border-white/10 text-white font-bold hover:bg-white/10 transition-colors"
                >
                    العودة للقائمة
                </button>
            </div>

            <div className="h-12" />
        </div>
    </motion.div>
);

const InformationsPage: React.FC = () => {
    const [selectedTopicId, setSelectedTopicId] = useState<string | null>(null);
    const [searchTerm, setSearchTerm] = useState('');

    const selectedTopic = CITY_INFO_DATA.find(t => t.id === selectedTopicId);

    const filteredTopics = CITY_INFO_DATA.filter(topic =>
        topic.title.includes(searchTerm) ||
        topic.subtitle?.includes(searchTerm) ||
        topic.category.includes(searchTerm)
    );

    return (
        <div className="min-h-screen bg-[#050505] font-arabic text-white safe-area-pb" dir="rtl">
            <AnimatePresence>
                {selectedTopic && (
                    <DetailView topic={selectedTopic} onClose={() => setSelectedTopicId(null)} />
                )}
            </AnimatePresence>

            <div className="pt-24 pb-32 px-5 max-w-6xl mx-auto">
                <BackButton />

                {/* Header */}
                <div className="mb-12 text-center">
                    <motion.h1
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="text-4xl md:text-6xl font-black text-white mb-4"
                    >
                        الموسوعة
                    </motion.h1>
                    <motion.p
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.1 }}
                        className="text-white/50 text-xl"
                    >
                        استكشف تاريخ وأسرار الحضارة المصرية
                    </motion.p>
                </div>

                {/* Search Bar */}
                <div className="mb-12 relative max-w-lg mx-auto">
                    <div className="absolute top-1/2 right-4 -translate-y-1/2 text-white/30">
                        <Search size={20} />
                    </div>
                    <input
                        type="text"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        placeholder="ابحث عن موضوع..."
                        className="w-full bg-[#121820] border border-white/10 rounded-2xl py-4 pr-12 pl-4 text-white placeholder-white/30 focus:outline-none focus:border-accent-gold/50 transition-colors"
                    />
                </div>

                {/* Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredTopics.map((topic, idx) => (
                        <TopicCard
                            key={topic.id}
                            topic={topic}
                            index={idx}
                            onClick={() => setSelectedTopicId(topic.id)}
                        />
                    ))}
                </div>

                {filteredTopics.length === 0 && (
                    <div className="text-center text-white/30 py-20">
                        لا توجد نتائج بحث
                    </div>
                )}
            </div>
        </div>
    );
};

export default InformationsPage;
