export type AchievementCondition = 'MANUAL' | 'LOGIN_STREAK' | 'FIRST_LOGIN' | 'TEAM_WIN' | 'POINTS_THRESHOLD' | 'CUSTOM';

export interface Achievement {
    id: string;
    name: string;
    description: string;
    points: number;
    icon: string; // Emoji or specific icon identifier
    category: 'ACTIVITY' | 'TEAM' | 'ASWANY' | 'SPECIAL' | 'JOURNEY';
    conditionType: AchievementCondition;
    targetValue?: number; // e.g., 7 for 7 days
    dayNumber?: number; // For Journey (1-5)
    isHidden?: boolean; // If true, description hidden until earned
    isSeasonal?: boolean;
    seasonName?: string; // e.g. "Ramadan 2025"
    repeatable: boolean;
    isActive: boolean;
    createdAt?: any;
}

export interface UserAchievement {
    id: string;
    userId: string;
    achievementId: string;
    achievementName: string; // Computed/Cached for display
    pointsSnapshot: number; // Points at time of earning
    earnedAt: any;
    grantedBy?: string; // Admin ID
}

export const INITIAL_ACHIEVEMENTS: Omit<Achievement, 'id' | 'createdAt'>[] = [
    {
        name: "جدع من يومه",
        description: "أول مرة يدخل السيستم ويبدأ رحلته",
        points: 5,
        icon: "👋",
        category: "ACTIVITY",
        conditionType: "FIRST_LOGIN",
        repeatable: false,
        isActive: true
    },
    {
        name: "ثابت على موقفه",
        description: "دخل 7 أيام ورا بعض من غير ما يقطع",
        points: 15,
        icon: "🗓️",
        category: "ACTIVITY",
        conditionType: "LOGIN_STREAK",
        targetValue: 7,
        repeatable: true,
        isActive: true
    },
    {
        name: "على العهد",
        description: "شهر كامل من الالتزام والاستمرارية",
        points: 30,
        icon: "💍",
        category: "ACTIVITY",
        conditionType: "LOGIN_STREAK",
        targetValue: 30,
        repeatable: false,
        isActive: true
    },
    {
        name: "ابن الفريق",
        description: "شارك مع فريقه وكان له دور فعال",
        points: 10,
        icon: "🤝",
        category: "TEAM",
        conditionType: "CUSTOM",
        repeatable: true,
        isActive: true
    },
    {
        name: "نوبي أصيل",
        description: "هادي، ثابت، وبيكسب على مهله",
        points: 20,
        icon: "🐊",
        category: "ASWANY",
        conditionType: "CUSTOM",
        repeatable: false,
        isActive: true
    },
    {
        name: "وسام سوبك",
        description: "إنجاز نادر جدًا - تقدير خاص من الإدارة",
        points: 100,
        icon: "👑",
        category: "SPECIAL",
        conditionType: "MANUAL",
        repeatable: false,
        isActive: true
    }
];
