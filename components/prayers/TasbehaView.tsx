import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowRight, ChevronRight, Settings, X, Type, Globe, Music, Moon, Sun, Monitor, BookOpen } from 'lucide-react';
import { TUESDAY_TASBEHA_DATA, TasbehaSection } from '../../data/tuesdayTasbehaData';

// --- Types ---

type Theme = 'dark' | 'light' | 'sepia' | 'oled';
type Language = 'arabic' | 'coptic' | 'copticArabic';

interface TasbehaState {
    fontSize: number;
    theme: Theme;
    visibleLanguages: Record<Language, boolean>;
}

// --- Constants ---

const THEMES = [
    { id: 'dark', name: 'ليلي', bg: 'bg-slate-950', text: 'text-white', accent: 'text-amber-400' },
    { id: 'oled', name: 'داكن', bg: 'bg-black', text: 'text-gray-100', accent: 'text-purple-400' },
    { id: 'sepia', name: 'ورقي', bg: 'bg-[#f4ecd8]', text: 'text-[#5b4636]', accent: 'text-[#8c6b4a]' },
    { id: 'light', name: 'نهاري', bg: 'bg-white', text: 'text-slate-900', accent: 'text-blue-600' },
];

// --- Helper Functions ---

const parseContent = (content: string) => {
    const sections: Record<string, string[]> = {};
    const parts = content.split('###').filter(Boolean);

    parts.forEach(part => {
        const lines = part.trim().split('\n');
        const header = lines[0].trim().toLowerCase();
        const body = lines.slice(1).filter(l => l.trim().length > 0);

        if (header.includes('coptic-arabic')) {
            sections.copticArabic = body;
        } else if (header.includes('coptic')) {
            sections.coptic = body;
        } else if (header.includes('arabic')) {
            sections.arabic = body;
        }
    });

    return sections;
};

// --- Components ---

const SettingsPanel = ({
    isOpen,
    onClose,
    state,
    setState
}: {
    isOpen: boolean;
    onClose: () => void;
    state: TasbehaState;
    setState: React.Dispatch<React.SetStateAction<TasbehaState>>;
}) => {
    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50"
                    />
                    <motion.div
                        initial={{ y: '100%' }}
                        animate={{ y: 0 }}
                        exit={{ y: '100%' }}
                        transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                        className="fixed bottom-0 left-0 right-0 bg-slate-900 border-t border-white/10 rounded-t-3xl z-50 p-6 max-h-[85vh] overflow-y-auto"
                    >
                        <div className="flex justify-between items-center mb-8">
                            <h3 className="text-xl font-bold text-white flex items-center gap-2">
                                <Settings className="w-5 h-5 text-amber-400" />
                                إعدادات اللحن
                            </h3>
                            <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-full transition-colors">
                                <X className="w-6 h-6 text-white/60" />
                            </button>
                        </div>

                        <div className="space-y-8">


                            {/* Languages */}
                            <div className="space-y-3">
                                <label className="text-sm text-white/60 font-medium flex items-center gap-2">
                                    <Globe className="w-4 h-4" />
                                    إظهار/إخفاء:
                                </label>
                                <div className="flex flex-wrap gap-3">
                                    {[
                                        { id: 'arabic', label: 'عربي' },
                                        { id: 'coptic', label: 'قبطي' },
                                        { id: 'copticArabic', label: 'قبطي معرب' }
                                    ].map(lang => (
                                        <button
                                            key={lang.id}
                                            onClick={() => setState(s => ({
                                                ...s,
                                                visibleLanguages: {
                                                    ...s.visibleLanguages,
                                                    [lang.id]: !s.visibleLanguages[lang.id as Language]
                                                }
                                            }))}
                                            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${state.visibleLanguages[lang.id as Language]
                                                ? 'bg-amber-500 text-slate-900'
                                                : 'bg-white/5 text-white/50 hover:bg-white/10'
                                                }`}
                                        >
                                            {lang.label}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Font Size */}
                            <div className="space-y-3">
                                <label className="text-sm text-white/60 font-medium flex items-center gap-2">
                                    <Type className="w-4 h-4" />
                                    حجم الخط:
                                </label>
                                <div className="flex items-center gap-4 bg-white/5 p-4 rounded-xl">
                                    <button
                                        onClick={() => setState(s => ({ ...s, fontSize: Math.max(80, s.fontSize - 10) }))}
                                        className="w-10 h-10 flex items-center justify-center rounded-lg bg-white/10 hover:bg-white/20 text-white"
                                    >
                                        A-
                                    </button>
                                    <input
                                        type="range"
                                        min="80"
                                        max="200"
                                        value={state.fontSize}
                                        onChange={(e) => setState(s => ({ ...s, fontSize: Number(e.target.value) }))}
                                        className="flex-1 h-2 bg-white/10 rounded-lg appearance-none cursor-pointer accent-amber-500"
                                    />
                                    <button
                                        onClick={() => setState(s => ({ ...s, fontSize: Math.min(200, s.fontSize + 10) }))}
                                        className="w-10 h-10 flex items-center justify-center rounded-lg bg-white/10 hover:bg-white/20 text-white"
                                    >
                                        A+
                                    </button>
                                    <span className="text-white/60 min-w-[3rem] text-center">{state.fontSize}%</span>
                                </div>
                            </div>

                            {/* Themes */}
                            <div className="space-y-3">
                                <label className="text-sm text-white/60 font-medium flex items-center gap-2">
                                    <Monitor className="w-4 h-4" />
                                    المظهر:
                                </label>
                                <div className="grid grid-cols-4 gap-3">
                                    {THEMES.map(theme => (
                                        <button
                                            key={theme.id}
                                            onClick={() => setState(s => ({ ...s, theme: theme.id as Theme }))}
                                            className={`aspect-square rounded-full flex items-center justify-center border-2 transition-all ${state.theme === theme.id
                                                ? 'border-amber-500 scale-110'
                                                : 'border-transparent hover:scale-105'
                                                } ${theme.bg}`}
                                        >
                                            {theme.id === 'dark' && <Moon className="w-5 h-5 text-gray-400" />}
                                            {theme.id === 'light' && <Sun className="w-5 h-5 text-yellow-600" />}
                                            {theme.id === 'sepia' && <BookOpen className="w-5 h-5 text-[#8c6b4a]" />}
                                            {theme.id === 'oled' && <Monitor className="w-5 h-5 text-purple-400" />}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
};

const TasbehaContentBlock = ({
    section,
    state
}: {
    section: TasbehaSection;
    state: TasbehaState;
}) => {
    const parsed = useMemo(() => parseContent(section.content), [section.content]);
    const theme = THEMES.find(t => t.id === state.theme) || THEMES[0];
    const baseFontSize = 1.125 * (state.fontSize / 100);

    // Determine active languages to display
    const activeLangs: Language[] = [];
    if (state.visibleLanguages.coptic) activeLangs.push('coptic');
    if (state.visibleLanguages.copticArabic) activeLangs.push('copticArabic');
    if (state.visibleLanguages.arabic) activeLangs.push('arabic');

    if (activeLangs.length === 0) {
        return (
            <div className={`text-center py-10 opacity-50 ${theme.text}`}>
                يرجى اختيار لغة واحدة على الأقل من الإعدادات
            </div>
        );
    }

    // Determine max number of verses to iterate
    const maxVerses = Math.max(
        (parsed.coptic?.length || 0),
        (parsed.copticArabic?.length || 0),
        (parsed.arabic?.length || 0)
    );

    // Config for grid columns based on active languages
    const gridColsClass =
        activeLangs.length === 1 ? 'grid-cols-1' :
            activeLangs.length === 2 ? 'grid-cols-1 lg:grid-cols-2' :
                'grid-cols-1 lg:grid-cols-3';

    return (
        <div
            className={`min-h-[60vh] rounded-3xl p-6 md:p-8 transition-colors duration-500 ${state.theme === 'oled' ? 'bg-black border border-white/10' :
                state.theme === 'dark' ? 'bg-slate-900/50 border border-white/10' :
                    state.theme === 'sepia' ? 'bg-[#e8dec0] border border-[#d6c7a5]' :
                        'bg-slate-50 border border-slate-200'
                }`}
        >
            {/* Section Image */}
            {section.imagePath && (
                <div className="mb-8 rounded-2xl overflow-hidden shadow-lg border border-white/10 relative h-48 md:h-64 lg:h-80 w-full group">
                    <img
                        src={section.imagePath}
                        alt={section.title}
                        className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-700"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                    <div className="absolute bottom-0 right-0 p-6 text-white w-full">
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.2 }}
                        >
                            <p className="text-sm font-medium opacity-80 mb-1">{section.subtitle}</p>
                            <h2 className="text-3xl font-bold drop-shadow-md">{section.title}</h2>
                        </motion.div>
                    </div>
                </div>
            )}

            <div className={`grid ${gridColsClass} gap-x-8 gap-y-8 lg:gap-y-12`}>
                {Array.from({ length: maxVerses }).map((_, rowIndex) => (
                    <React.Fragment key={rowIndex}>
                        {activeLangs.map((lang) => {
                            const verse = parsed[lang]?.[rowIndex];
                            const isCoptic = lang === 'coptic';
                            // Coptic is LTR, Arabic/Coptic-Arabic are RTL
                            // Actually Coptic-Arabic is largely phonetic so reading LTR might be preferred by some but standard is RTL. 
                            // Let's stick to standard: Coptic LTR, Others RTL.
                            const dir = isCoptic ? 'ltr' : 'rtl';
                            const langFont = isCoptic ? 'font-coptic' : 'font-arabic';
                            const fontSize = baseFontSize * (isCoptic ? 1.3 : 1.1);

                            return (
                                <div
                                    key={`${lang}-${rowIndex}`}
                                    dir={dir}
                                    className={`
                                        relative
                                        ${langFont} 
                                        leading-loose 
                                        ${theme.text}
                                        ${verse?.includes('+') || rowIndex === 0 ? '' : 'opacity-90'}
                                        flex flex-col justify-center
                                        ${activeLangs.length > 1 ? 'lg:border-b lg:border-dashed lg:border-white/5 lg:pb-6' : ''}
                                        ${rowIndex < maxVerses - 1 && activeLangs.length === 1 ? 'border-b border-dashed border-white/10 pb-6' : ''}
                                    `}
                                    style={{
                                        fontSize: `${fontSize}rem`
                                    }}
                                >
                                    {verse ? (
                                        verse.startsWith('+') ? (
                                            <span className={`${state.theme === 'light' ? 'text-purple-700' : 'text-amber-400'} font-bold`}>
                                                {verse}
                                            </span>
                                        ) : (
                                            verse
                                        )
                                    ) : (
                                        <span className="opacity-20 select-none">-</span>
                                    )}
                                </div>
                            );
                        })}
                        {/* Divider for Mobile View (Interleaved) - Only show if multiple languages active and not last row */}
                        {activeLangs.length > 1 && rowIndex < maxVerses - 1 && (
                            <div className={`lg:hidden col-span-1 h-px w-full my-2 bg-gradient-to-r from-transparent via-current to-transparent opacity-20 ${theme.text}`} />
                        )}
                    </React.Fragment>
                ))}
            </div>
        </div>
    );
};

// --- Main Component ---

const TasbehaView: React.FC = () => {
    const [selectedSection, setSelectedSection] = useState<string | null>(null);
    const [isSettingsOpen, setIsSettingsOpen] = useState(false);
    const [state, setState] = useState<TasbehaState>({
        fontSize: 100,
        theme: 'dark',
        visibleLanguages: {
            arabic: true,
            coptic: true,
            copticArabic: true
        }
    });

    const sections = TUESDAY_TASBEHA_DATA;
    const activeSectionData = sections.find(s => s.id === selectedSection);
    const currentTheme = THEMES.find(t => t.id === state.theme) || THEMES[0];

    // Scroll to top when section changes
    useEffect(() => {
        if (selectedSection) {
            window.scrollTo({ top: 0, behavior: 'smooth' });
        }
    }, [selectedSection]);

    // Background based on theme
    const bgClass =
        state.theme === 'oled' ? 'bg-black' :
            state.theme === 'sepia' ? 'bg-[#f4ecd8]' :
                state.theme === 'light' ? 'bg-slate-50' :
                    'bg-slate-950'; // dark default

    return (
        <div className={`min-h-screen transition-colors duration-500 ease-in-out ${bgClass} ${state.theme === 'light' || state.theme === 'sepia' ? 'text-slate-900' : 'text-white'}`}>
            <AnimatePresence mode="wait">
                {!selectedSection ? (
                    <motion.div
                        key="list"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        className="w-full max-w-7xl mx-auto px-4 py-8"
                    >
                        {/* Header */}
                        <div className="col-span-full text-center mb-12 pt-8">
                            <h2 className="text-4xl md:text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-fuchsia-400 mb-6 drop-shadow-xl">
                                تسبحة نصف الليل
                            </h2>
                            <p className={`text-lg opacity-70 ${state.theme === 'light' ? 'text-slate-600' : 'text-purple-200'}`}>
                                ترتيب التسبحة لليلة الأربعاء (مساء الثلاثاء)
                            </p>
                        </div>

                        {/* Grid */}
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {sections.map((section, index) => (
                                <motion.button
                                    key={section.id}
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: index * 0.05 }}
                                    onClick={() => setSelectedSection(section.id)}
                                    whileHover={{ scale: 1.02, y: -5 }}
                                    whileTap={{ scale: 0.98 }}
                                    className={`relative overflow-hidden rounded-3xl p-6 text-right transition-all duration-300 group border h-full flex flex-col justify-between ${state.theme === 'light'
                                        ? 'bg-white shadow-lg shadow-purple-900/5 border-purple-100 hover:border-purple-300'
                                        : 'bg-white/5 border-white/10 hover:bg-white/10 hover:border-white/20'
                                        }`}
                                >
                                    <div className="flex justify-between items-start mb-6">
                                        <div className={`p-4 rounded-2xl text-3xl group-hover:scale-110 transition-transform duration-300 ${state.theme === 'light' ? 'bg-purple-50 text-purple-600' : 'bg-white/10 text-purple-300'
                                            }`}>
                                            {section.icon}
                                        </div>
                                        <div className={`p-2 rounded-full ${state.theme === 'light' ? 'bg-purple-100 text-purple-400' : 'bg-white/10 text-white/40'
                                            } group-hover:bg-purple-500 group-hover:text-white transition-all`}>
                                            <ChevronRight className="w-5 h-5 rotate-180" />
                                        </div>
                                    </div>

                                    <div>
                                        <h3 className={`text-2xl font-bold mb-2 group-hover:text-purple-400 transition-colors ${state.theme === 'light' ? 'text-slate-900' : 'text-white'
                                            }`}>
                                            {section.title}
                                        </h3>
                                        <p className={`text-sm ${state.theme === 'light' ? 'text-slate-500' : 'text-white/50'
                                            }`}>
                                            {section.subtitle}
                                        </p>
                                    </div>
                                </motion.button>
                            ))}
                        </div>
                    </motion.div>
                ) : (
                    <motion.div
                        key="content"
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: 20 }}
                        className="w-full max-w-4xl mx-auto px-4 py-6 min-h-screen flex flex-col"
                    >
                        {/* Toolbar */}
                        <div className={`sticky top-4 z-40 rounded-2xl shadow-lg border backdrop-blur-md mb-8 px-4 py-3 flex justify-between items-center transition-all ${state.theme === 'light' || state.theme === 'sepia'
                            ? 'bg-white/80 border-slate-200 shadow-slate-200/50'
                            : 'bg-black/50 border-white/10 shadow-black/50'
                            }`}>
                            <button
                                onClick={() => setSelectedSection(null)}
                                className={`flex items-center gap-2 font-medium transition-colors ${state.theme === 'light' || state.theme === 'sepia' ? 'text-slate-600 hover:text-purple-600' : 'text-white/70 hover:text-white'
                                    }`}
                            >
                                <ArrowRight className="w-5 h-5" />
                                <span>العودة</span>
                            </button>

                            <h3 className={`text-lg font-bold hidden md:block ${state.theme === 'light' || state.theme === 'sepia' ? 'text-slate-900' : 'text-white'
                                }`}>
                                {activeSectionData?.title}
                            </h3>

                            <button
                                onClick={() => setIsSettingsOpen(true)}
                                className={`p-2.5 rounded-xl transition-all ${state.theme === 'light' || state.theme === 'sepia'
                                    ? 'bg-amber-100/50 text-amber-700 hover:bg-amber-100'
                                    : 'bg-amber-500/10 text-amber-500 hover:bg-amber-500/20'
                                    }`}
                            >
                                <Settings className="w-5 h-5" />
                            </button>
                        </div>

                        {/* Content Area */}
                        {activeSectionData && (
                            <TasbehaContentBlock
                                section={activeSectionData}
                                state={state}
                            />
                        )}

                        {/* Spacer for settings panel on mobile */}
                        <div className="h-24" />
                    </motion.div>
                )}
            </AnimatePresence>

            <SettingsPanel
                isOpen={isSettingsOpen}
                onClose={() => setIsSettingsOpen(false)}
                state={state}
                setState={setState}
            />
        </div>
    );
};

export default TasbehaView;
