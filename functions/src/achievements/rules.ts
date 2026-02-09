
export interface AchievementRule {
    id: string;
    trigger: string;            // Event Name e.g. "GAME_COMPLETED"
    conditions?: RuleCondition[];
    target?: number;            // For progressive: reach this count
    limit: number;              // Max times this can be earned (0 = infinite)
    cooldownMinutes?: number;
    rewards: {
        xp: number;
        badge?: string;
        useMetadataXp?: boolean; // If true, adds event.metadata.xp to the reward
    };
}

export interface RuleCondition {
    field: string;              // e.g. "metadata.score" or "user.stats.gamesPlayed"
    operator: '==' | '>=' | '<=' | '>' | '<' | 'contains';
    value: any;
}

export const ACHIEVEMENT_RULES: AchievementRule[] = [
    // 1️⃣ Onboarding
    {
        id: "first_login",
        trigger: "USER_CREATED",
        limit: 1,
        rewards: { xp: 5 }
    },
    {
        id: "onboarding_complete",
        trigger: "ONBOARDING_COMPLETED",
        limit: 1,
        rewards: { xp: 5 }
    },

    // 2️⃣ Daily & Commitment
    {
        id: "daily_open",
        trigger: "DAILY_LOGIN",
        limit: 0,
        cooldownMinutes: 1440,
        rewards: { xp: 2 }
    },
    {
        id: "streak_7",
        trigger: "LOGIN_STREAK",
        conditions: [
            { field: "metadata.count", operator: ">=", value: 7 }
        ],
        limit: 1,
        rewards: { xp: 15 }
    },
    {
        id: "streak_30",
        trigger: "LOGIN_STREAK",
        conditions: [
            { field: "metadata.count", operator: ">=", value: 30 }
        ],
        limit: 1,
        rewards: { xp: 30 }
    },

    // 3️⃣ Profile & Settings
    {
        id: "profile_photo",
        trigger: "PROFILE_PICTURE_UPLOADED",
        limit: 1,
        rewards: { xp: 5 }
    },
    {
        id: "open_settings",
        trigger: "SETTINGS_OPENED",
        limit: 1,
        rewards: { xp: 5 }
    },
    {
        id: "enable_notifications",
        trigger: "NOTIFICATIONS_ENABLED",
        limit: 1,
        rewards: { xp: 5 }
    },

    // 4️⃣ Discovery
    {
        id: "explore_movies",
        trigger: "MOVIE_POSTER_OPENED",
        target: 10,
        limit: 1,
        rewards: { xp: 10 }
    },
    {
        id: "explore_all_sections",
        trigger: "SECTION_OPENED",
        target: 5,
        limit: 1,
        rewards: { xp: 15 }
    },
    {
        id: "city_info",
        trigger: "CITY_INFO_OPENED",
        limit: 1,
        rewards: { xp: 5 }
    },
    {
        id: "soundcloud_click",
        trigger: "SOUNDCLOUD_CLICKED",
        limit: 1,
        rewards: { xp: 5 }
    },
    {
        id: "photos_click",
        trigger: "GOOGLE_PHOTOS_CLICKED",
        limit: 1,
        rewards: { xp: 5 }
    },

    // 5️⃣ Community
    {
        id: "team_chat_msg",
        trigger: "CHAT_MESSAGE_SENT",
        limit: 1,
        rewards: { xp: 5 }
    },
    {
        id: "team_joined",
        trigger: "TEAM_JOINED",
        limit: 1,
        rewards: { xp: 10 }
    },
    {
        id: "room_assigned",
        trigger: "ROOM_ASSIGNED",
        limit: 1,
        rewards: { xp: 5 }
    },

    // 6️⃣ Games
    {
        id: "first_game",
        trigger: "GAMES_OPENED",
        limit: 1,
        rewards: { xp: 10 }
    },
    {
        id: "game_score",
        trigger: "GAME_SCORE_SUBMITTED",
        limit: 1,
        rewards: { xp: 10 }
    },
    {
        id: "mafia_don",
        trigger: "GAME_COMPLETED",
        conditions: [
            { field: "metadata.result", operator: "==", value: "win_mafia" }
        ],
        limit: 1,
        rewards: { xp: 50, badge: "MAFIA_DON" }
    },
    {
        id: "first_win",
        trigger: "GAME_COMPLETED",
        conditions: [
            { field: "metadata.result", operator: "==", value: "win" }
        ],
        limit: 1,
        rewards: { xp: 20 }
    },
    {
        id: "save_el_helwa",
        trigger: "EL_HELWA_SAVED",
        limit: 1,
        rewards: { xp: 10 }
    },

    // 7️⃣ Admin
    {
        id: "nubi_bundle",
        trigger: "ADMIN_GRANT",
        conditions: [
            { field: "metadata.achievementId", operator: "==", value: "nubi_bundle" }
        ],
        limit: 1,
        rewards: { xp: 20 }
    },
    {
        id: "admin_medal",
        trigger: "ADMIN_GRANT",
        conditions: [
            { field: "metadata.achievementId", operator: "==", value: "admin_medal" }
        ],
        limit: 1,
        rewards: { xp: 100 }
    }
];

export const LEVEL_THRESHOLDS = [
    { level: 1, min: 0, title: "مستكشف جديد" },
    { level: 2, min: 100, title: "ماشي صح" },
    { level: 3, min: 300, title: "ابن الرحلة" },
    { level: 4, min: 600, title: "حارس النيل" },
    { level: 5, min: 1000, title: "ابن سوبك" },
    { level: 6, min: 1500, title: "سيد الرحلة" },
    { level: 7, min: 2200, title: "روح النيل" },
    { level: 8, min: 3000, title: "أسطورة حية" },
    { level: 9, min: 5000, title: "مختار سوبك" },
    { level: 10, min: 10000, title: "نصف إله" }
];
