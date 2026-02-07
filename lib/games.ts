/**
 * MALAHY SOBEK - GAME CONFIGURATION
 * 
 * Defines game types, scoring rules, and initial content.
 */

export type GameType = 'SOLO' | 'VERSUS';
export type GameCategory = 'PROVERB' | 'VERSE' | 'WHO' | 'SOBEK';

export interface GameConfig {
    id: string;
    title: string;
    description: string;
    type: GameType;
    category?: GameCategory;
    rewards: {
        win: number;   // Solo correct answer OR Versus Win
        loss?: number; // Versus Loss
        draw?: number; // Versus Draw
        streak?: number; // Solo Streak Bonus
    };
    icon: string;
    color: string;
    bgGradient: string;
}

export const GAMES_CONFIG: GameConfig[] = [
    // --- SOLO GAMES ---
    {
        id: 'proverb',
        title: "أمثال",
        description: "العب بالأمثال الشعبية",
        type: 'SOLO',
        category: 'PROVERB',
        rewards: { win: 10 },
        icon: "📜",
        color: "text-amber-400",
        bgGradient: "from-amber-600 to-amber-900"
    },
    {
        id: 'kamel-elayah',
        title: "آيات",
        description: "كمّل الآية من الكتاب المقدس",
        type: 'SOLO',
        category: 'VERSE',
        rewards: { win: 10, streak: 5 },
        icon: "✝️",
        color: "text-cyan-400",
        bgGradient: "from-cyan-600 to-cyan-900"
    },
    {
        id: 'who',
        title: "مين؟",
        description: "شخصيات تاريخية وكتابية",
        type: 'SOLO',
        category: 'WHO',
        rewards: { win: 10 },
        icon: "🕵️",
        color: "text-purple-400",
        bgGradient: "from-purple-600 to-purple-900"
    },
    {
        id: 'sobek_intel',
        title: "ذكاء سوبِك",
        description: "ألغاز وتفكير عميق",
        type: 'SOLO',
        category: 'SOBEK',
        rewards: { win: 15 },
        icon: "🧠",
        color: "text-emerald-400",
        bgGradient: "from-emerald-600 to-emerald-900"
    },

    // --- GROUP GAMES ---
    {
        id: 'mafia',
        title: "مافيا",
        description: "المدينة بتنام.. والمافيا بتصحى",
        type: 'VERSUS',
        rewards: { win: 30 },
        icon: "🕶️",
        color: "text-red-500",
        bgGradient: "from-gray-900 to-black"
    },
    {
        id: 'matlha_law_adak',
        title: "مثلها",
        description: "لعبة التمثيل الصامت (Charades)",
        type: 'VERSUS',
        rewards: { win: 20 },
        icon: "🎭",
        color: "text-yellow-400",
        bgGradient: "from-yellow-600 to-yellow-900"
    },
    {
        id: 'oul_besor3a',
        title: "قول بسرعة",
        description: "٣ كلمات في ٣ ثواني!",
        type: 'VERSUS',
        rewards: { win: 20 },
        icon: "⏱️",
        color: "text-indigo-400",
        bgGradient: "from-indigo-600 to-indigo-900"
    },
    {
        id: 'mamno3at',
        title: "ممنوعات",
        description: "Taboo - اوصف من غير ما تقول الكلمة",
        type: 'VERSUS',
        rewards: { win: 25 },
        icon: "🚫",
        color: "text-rose-500",
        bgGradient: "from-rose-700 to-rose-950"
    },
    {
        id: 'hekaya_gama3eya',
        title: "حكاية",
        description: "تأليف قصة جماعية",
        type: 'VERSUS',
        rewards: { win: 20 },
        icon: "📖",
        color: "text-pink-400",
        bgGradient: "from-pink-600 to-pink-900"
    },

    // --- LEGACY / OTHER ---

    {
        id: 'versus_match',
        title: "واجه لاعب",
        description: "العب ضد حد من فريق تاني 🔥",
        type: 'VERSUS',
        rewards: { win: 20, loss: 5, draw: 10 },
        icon: "⚔️",
        color: "text-red-500",
        bgGradient: "from-red-900/40 to-black"
    }
];

// --- MOCK QUESTIONS ---

export interface Question {
    id: string;
    text: string;
    options: string[];
    correctIndex: number;
    hint?: string;
}

export const MOCK_PROVERBS: Question[] = [
    { id: 'p1', text: "اللي اختشوا...", options: ["ماتوا", "ناموا", "طاروا", "عاشوا"], correctIndex: 0 },
    { id: 'p2', text: "يا واخد القرد على ماله...", options: ["يروح القرد ويفضل المال", "يروح المال ويفضل القرد", " القرد يرقص", "المال يطير"], correctIndex: 1 },
    { id: 'p3', text: "القرد في عين أمه...", options: ["أسد", "غزال", "بطل", "سكر"], correctIndex: 1 },
];

export const MOCK_VERSES: Question[] = [
    { id: 'v1', text: "إِنَّ مَعَ الْعُسْرِ...", options: ["يُسْرًا", "صَبْرًا", "نَصْرًا"], correctIndex: 0 },
    { id: 'v2', text: "وَبَشِّرِ الصَّابِرِينَ الَّذِينَ إِذَا أَصَابَتْهُم...", options: ["مُصِيبَةٌ", "سَيِّئَةٌ", "ضَرَّاءُ"], correctIndex: 0 },
];
