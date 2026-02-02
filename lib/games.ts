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
        title: "كامل المثل",
        description: "كمّل المثل الصح.. اللي اختشوا؟",
        type: 'SOLO',
        category: 'PROVERB',
        rewards: { win: 10 },
        icon: "👀",
        color: "text-green-400",
        bgGradient: "from-green-600 to-green-900"
    },
    {
        id: 'verse',
        title: "كمّل الآية",
        description: "آيات كريمة.. بدون استعجال 🌿",
        type: 'SOLO',
        category: 'VERSE',
        rewards: { win: 10, streak: 5 },
        icon: "✨",
        color: "text-cyan-400",
        bgGradient: "from-cyan-600 to-cyan-900"
    },
    {
        id: 'who',
        title: "مين ده؟",
        description: "شخصيات وتاريخ.. ركّز 🤔",
        type: 'SOLO',
        category: 'WHO',
        rewards: { win: 10 },
        icon: "🕵️",
        color: "text-yellow-400",
        bgGradient: "from-yellow-600 to-yellow-900"
    },
    {
        id: 'kan_asdo_eh',
        title: "كان قصده إيه؟",
        description: "نية صافية ولا..",
        type: 'SOLO', // Or Trivia
        rewards: { win: 10 },
        icon: "💭",
        color: "text-blue-400",
        bgGradient: "from-blue-600 to-blue-900"
    },
    {
        id: 'shaifino_ezay',
        title: "شايفينه إزاي؟",
        description: "بدون زعل بقى",
        type: 'SOLO',
        rewards: { win: 15 },
        icon: "👀",
        color: "text-purple-400",
        bgGradient: "from-purple-600 to-purple-900"
    },
    {
        id: 'soal_3ameek',
        title: "سؤال عميق",
        description: "كلام من القلب",
        type: 'SOLO',
        rewards: { win: 15 },
        icon: "🌑",
        color: "text-gray-400",
        bgGradient: "from-gray-600 to-gray-900"
    },

    // --- ACTIVITY / PARTY GAMES ---
    {
        id: 'oul_besor3a',
        title: "قول بسرعة",
        description: "٣ كلمات في ٣ ثواني",
        type: 'VERSUS',
        rewards: { win: 20 },
        icon: "💣",
        color: "text-red-500",
        bgGradient: "from-red-600 to-red-900"
    },
    {
        id: 'matlha_law_adak',
        title: "مثلها لو قدك",
        description: "جسمك بس اللي يتكلم",
        type: 'VERSUS',
        rewards: { win: 20 },
        icon: "🎭",
        color: "text-yellow-500",
        bgGradient: "from-yellow-600 to-yellow-900"
    },
    {
        id: 'hekaya_gama3eya',
        title: "حكاية جماعية",
        description: "تأليف عالحلو",
        type: 'VERSUS',
        rewards: { win: 20 },
        icon: "🧩",
        color: "text-pink-500",
        bgGradient: "from-pink-600 to-pink-900"
    },
    {
        id: 'mamno3at',
        title: "ممنوعات",
        description: "خطر جدًا",
        type: 'VERSUS',
        rewards: { win: 25 },
        icon: "⛔",
        color: "text-red-600",
        bgGradient: "from-red-700 to-red-950"
    },

    // --- LEGACY / OTHER ---
    {
        id: 'sobek_intel',
        title: "ذكاء سوبك",
        description: "ألغاز للمحترفين فقط 🐊",
        type: 'SOLO',
        category: 'SOBEK',
        rewards: { win: 15 },
        icon: "🐊",
        color: "text-green-500",
        bgGradient: "from-green-700 to-black"
    },
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
