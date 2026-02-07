// --- 1. LEVELS SYSTEM (1-10) ---
export interface LevelConfig {
    level: number;
    minXP: number;
    maxXP: number; // For progress calculation
    title: string;
    description: string;
    icon: string;
    color: string;
}

export const LEVELS: LevelConfig[] = [
    { level: 1, minXP: 0, maxXP: 20, title: "مستكشف جديد", description: "لسه داخل وبيتعرف", icon: "👣", color: "text-gray-400" },
    { level: 2, minXP: 21, maxXP: 50, title: "ماشي صح", description: "فاهم الدنيا", icon: "🧭", color: "text-blue-400" },
    { level: 3, minXP: 51, maxXP: 100, title: "ابن الرحلة", description: "ثابت ومكمّل", icon: "🐪", color: "text-amber-600" },
    { level: 4, minXP: 101, maxXP: 180, title: "نوبي أصيل", description: "هادي وبيحسبها", icon: "⚓", color: "text-teal-500" },
    { level: 5, minXP: 181, maxXP: 300, title: "حارس النيل", description: "تقيل ومؤثر", icon: "🐊", color: "text-emerald-500" },
    { level: 6, minXP: 301, maxXP: 450, title: "ابن سوبك", description: "من الكبار", icon: "👑", color: "text-yellow-500" },
    { level: 7, minXP: 451, maxXP: 650, title: "سيد الرحلة", description: "Leader", icon: "🔱", color: "text-orange-500" },
    { level: 8, minXP: 651, maxXP: 900, title: "روح النيل", description: "Rare", icon: "🌊", color: "text-cyan-400" },
    { level: 9, minXP: 901, maxXP: 1200, title: "أسطورة حية", description: "Very Rare", icon: "🏺", color: "text-purple-500" },
    { level: 10, minXP: 1201, maxXP: 99999, title: "مختار سوبك", description: "Elite (Invite Only)", icon: "☀️", color: "text-rose-500" },
];

export const getLevelConfig = (xp: number): LevelConfig => {
    return LEVELS.find(l => xp >= l.minXP && xp <= l.maxXP) || LEVELS[LEVELS.length - 1]; // Fallback to max level
};

export const getNextLevelConfig = (currentLevel: number): LevelConfig | null => {
    return LEVELS.find(l => l.level === currentLevel + 1) || null;
};


// --- 2. ACHIEVEMENT SCHEMA ---

export type AchievementType = 'one_time' | 'daily' | 'progressive' | 'admin';
export type AchievementCategory = 'Onboarding' | 'Daily' | 'Profile' | 'Discovery' | 'Community' | 'Games' | 'Special';

export interface AchievementTrigger {
    event: string;
    cooldown_hours?: number;
    required_count?: number; // For progressive
}

export interface Achievement {
    id: string;
    title: string;
    emoji: string;
    description: string;
    how_to_get: string;
    category: AchievementCategory;
    type: AchievementType;
    xp: number;
    trigger: AchievementTrigger;
    repeatable: boolean;
    visible: boolean;
    order?: number;
    target?: number; // For progressive goals (e.g. 10 movies)
}

// --- 3. MASTER ACHIEVEMENTS LIST ---

export const ACHIEVEMENTS_LIST: Achievement[] = [
    // 1️⃣ Onboarding
    {
        id: "first_login",
        title: "جدع من يومه",
        emoji: "👋",
        description: "أول مرة يدخل ويبدأ الرحلة",
        how_to_get: "سجل دخولك أول مرة",
        category: "Onboarding",
        type: "one_time",
        xp: 5,
        trigger: { event: "user_first_login" },
        repeatable: false,
        visible: true,
        order: 1
    },
    {
        id: "onboarding_complete",
        title: "أول خطوة في الرحلة",
        emoji: "🧭",
        description: "كملت البداية صح",
        how_to_get: "خلص شاشات الترحيب",
        category: "Onboarding",
        type: "one_time",
        xp: 5,
        trigger: { event: "onboarding_completed" },
        repeatable: false,
        visible: true,
        order: 2
    },

    // 2️⃣ Daily & Commitment
    {
        id: "daily_open",
        title: "يوم جديد",
        emoji: "☀️",
        description: "كل يوم جديد بنقطة جديدة",
        how_to_get: "افتح الأبليكيشن في يوم جديد",
        category: "Daily",
        type: "daily",
        xp: 2,
        trigger: { event: "app_open", cooldown_hours: 24 },
        repeatable: true,
        visible: true,
        order: 10
    },
    {
        id: "streak_7",
        title: "ثابت على موقفه",
        emoji: "🗓️",
        description: "7 أيام ورا بعض من غير ما تقطع",
        how_to_get: "افتح 7 أيام متواصلة",
        category: "Daily",
        type: "one_time",
        xp: 15,
        trigger: { event: "login_streak_7" },
        repeatable: false,
        visible: true,
        order: 11
    },
    {
        id: "streak_30",
        title: "على العهد",
        emoji: "💍",
        description: "شهر كامل من الالتزام",
        how_to_get: "افتح 30 يوم متواصلة",
        category: "Daily",
        type: "one_time",
        xp: 30,
        trigger: { event: "login_streak_30" },
        repeatable: false,
        visible: true,
        order: 12
    },

    // 3️⃣ Profile & Settings
    {
        id: "profile_photo",
        title: "وشك نور",
        emoji: "📸",
        description: "الصورة بتفرق",
        how_to_get: "حط صورة بروفايل",
        category: "Profile",
        type: "one_time",
        xp: 5,
        trigger: { event: "profile_photo_uploaded" },
        repeatable: false,
        visible: true,
        order: 20
    },
    {
        id: "open_settings",
        title: "مزبطها",
        emoji: "⚙️",
        description: "بتفهم في الإعدادات",
        how_to_get: "افتح صفحة الإعدادات",
        category: "Profile",
        type: "one_time",
        xp: 5,
        trigger: { event: "settings_opened" },
        repeatable: false,
        visible: true,
        order: 21
    },
    {
        id: "enable_notifications",
        title: "صاحي على كل حاجة",
        emoji: "🔔",
        description: "عشان ميفوتكش حاجة",
        how_to_get: "فعل التنبيهات",
        category: "Profile",
        type: "one_time",
        xp: 5,
        trigger: { event: "notifications_enabled" },
        repeatable: false,
        visible: true,
        order: 22
    },

    // 4️⃣ Discovery
    {
        id: "explore_movies",
        title: "عينك لاقطة",
        emoji: "🎬",
        description: "بتشوف وبتفهم في الفن",
        how_to_get: "افتح 10 بوسترات أفلام",
        category: "Discovery",
        type: "progressive",
        xp: 10,
        target: 10,
        trigger: { event: "movie_poster_open" },
        repeatable: false,
        visible: true,
        order: 30
    },
    {
        id: "explore_all_sections",
        title: "لفّيت الدنيا",
        emoji: "👀",
        description: "مفيش حتة ما دخلتهاش",
        how_to_get: "افتح كل الأقسام الرئيسية",
        category: "Discovery",
        type: "progressive",
        xp: 15,
        target: 5, // Home, Games, Team, Profile, Store?
        trigger: { event: "section_visit" },
        repeatable: false,
        visible: true,
        order: 31
    },
    {
        id: "city_info",
        title: "ابن البلد",
        emoji: "🏙️",
        description: "عارف مدينتك كويس",
        how_to_get: "افتح صفحة معلومات المدينة",
        category: "Discovery",
        type: "one_time",
        xp: 5,
        trigger: { event: "city_info_opened" },
        repeatable: false,
        visible: true,
        order: 32
    },
    {
        id: "soundcloud_click",
        title: "سمعت النداء",
        emoji: "🧿",
        description: "المزاج العالي",
        how_to_get: "دوس على لينك الساوند كلاود",
        category: "Discovery",
        type: "one_time",
        xp: 5,
        trigger: { event: "soundcloud_clicked" },
        repeatable: false,
        visible: true,
        order: 33
    },
    {
        id: "photos_click",
        title: "ذكريات الجماعة",
        emoji: "📸",
        description: "بتحب تفتكر الأيام الحلوة",
        how_to_get: "افتح ألبوم الصور",
        category: "Discovery",
        type: "one_time",
        xp: 5,
        trigger: { event: "google_photos_clicked" },
        repeatable: false,
        visible: true,
        order: 34
    },

    // 5️⃣ Community
    {
        id: "team_chat_msg",
        title: "صوتك مسموع",
        emoji: "💬",
        description: "ليك دور ورأي",
        how_to_get: "اكتب رسالة في شات الفريق",
        category: "Community",
        type: "one_time",
        xp: 5,
        trigger: { event: "chat_message_sent" },
        repeatable: false,
        visible: true,
        order: 40
    },
    {
        id: "team_joined",
        title: "واحد مننا",
        emoji: "🤝",
        description: "انضميت لفريق وبقيت جزء من الكيان",
        how_to_get: "انضم لفريق",
        category: "Community",
        type: "one_time",
        xp: 10,
        trigger: { event: "team_joined" },
        repeatable: false,
        visible: true,
        order: 39
    },
    {
        id: "room_assigned",
        title: "عارف مكانك",
        emoji: "🛏️",
        description: "حددت مكان إقامتك",
        how_to_get: "اكتب اسمك ورقم غرفتك",
        category: "Community",
        type: "one_time",
        xp: 5,
        trigger: { event: "room_assigned" },
        repeatable: false,
        visible: true,
        order: 41
    },

    // 6️⃣ Games
    {
        id: "first_game",
        title: "أول لعب",
        emoji: "🎮",
        description: "دخلت الساحة",
        how_to_get: "افتح قسم الألعاب لأول مرة",
        category: "Games",
        type: "one_time",
        xp: 10,
        trigger: { event: "games_opened" },
        repeatable: false,
        visible: true,
        order: 50
    },
    {
        id: "game_score",
        title: "دخلها تقيل",
        emoji: "🔥",
        description: "لعبت وسجلت سكور",
        how_to_get: "العب أي لعبة وسجل نتيجتك",
        category: "Games",
        type: "one_time",
        xp: 10,
        trigger: { event: "game_score_submitted" },
        repeatable: false,
        visible: true,
        order: 51
    },
    {
        id: "save_el_helwa",
        title: "الحلوة دي",
        emoji: "💎",
        description: "جربت ميزة الحلوة",
        how_to_get: "افتح واحفظ الحلوة",
        category: "Games",
        type: "one_time",
        xp: 10,
        trigger: { event: "el_helwa_saved" },
        repeatable: false,
        visible: true,
        order: 52
    },

    // 7️⃣ Special / Admin
    {
        id: "nubi_bundle",
        title: "نوبي أصيل",
        emoji: "🐊",
        description: "خلصت مجموعة مهام كاملة بهدوء",
        how_to_get: "مجموعة مهام (بقرار من الأدمن)",
        category: "Special",
        type: "admin",
        xp: 20,
        trigger: { event: "admin_grant_nubi" },
        repeatable: false,
        visible: true,
        order: 90
    },
    {
        id: "admin_medal",
        title: "وسام سوبك",
        emoji: "👑",
        description: "تقدير خاص جدًا من الإدارة",
        how_to_get: "بيتحسب من الإدارة بس",
        category: "Special",
        type: "admin",
        xp: 100,
        trigger: { event: "admin_grant_sobek" },
        repeatable: false,
        visible: true,
        order: 99
    }
];

// --- 4. DATA TYPES FOR STORE ---

export interface UserProgress {
    xp: number;
    level: number;
    unlockedAchievements: string[]; // IDs
    achievementProgress: Record<string, number>; // ID -> current count (for progressive)
    lastDailyAction?: Record<string, string>; // ID -> ISO Date (to track cooldowns)
}

export const INITIAL_USER_PROGRESS: UserProgress = {
    xp: 0,
    level: 1,
    unlockedAchievements: [],
    achievementProgress: {},
    lastDailyAction: {}
};
