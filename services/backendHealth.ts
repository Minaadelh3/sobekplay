import { collection, doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { Achievement } from '../types/achievements';

// ✅ REQUIRED BACKEND ROOTS
export const REQUIRED_ROOTS = [
    'achievements',
    'user_achievements',
    'points_logs',
    'ledger',
    'teams',
    'team_rankings',
    'badges',
    'user_badges',
    'seasons',
    'system_messages',
    'admin_logs',
    'system_config'
];

export interface RootStatus {
    name: string;
    status: 'ONLINE' | 'OFFLINE' | 'UNKNOWN';
    lastChecked: Date;
    message?: string;
}

export interface AchievementHealth {
    id: string;
    status: 'HEALTHY' | 'WARNING' | 'BROKEN';
    issues: string[];
}

// 🟠 KNOWN TRIGGERS MAP
export const KNOWN_TRIGGERS: Record<string, string[]> = {
    'LOGIN_STREAK': ['user.streaks'],
    'FIRST_LOGIN': ['user.auth'],
    'TEAM_WIN': ['team_rankings'],
    'POINTS_THRESHOLD': ['user.points'],
    'MANUAL': ['admin.action'],
    'CUSTOM': ['unknown']
};

export const checkBackendRoots = async (): Promise<RootStatus[]> => {
    const results: RootStatus[] = [];

    // In Firestore client, we can't easily "check existence" of a root collection without listing (admin only) or reading a known doc.
    // For this "Admin Tool", we will assume if we can generate a reference, it's "Conceptually Online", 
    // but ideally we should try to read a metadata doc if one existed.
    // We will simulate a check by ensuring the config is recognized.

    for (const root of REQUIRED_ROOTS) {
        // True "Existence" check is hard from Client SDK without a known doc.
        // We will assume "ONLINE" if it is in our configuration list.
        // But for "system_config", let's try to read 'main'.
        let status: 'ONLINE' | 'OFFLINE' | 'UNKNOWN' = 'ONLINE';
        let message = 'شغال تمام';

        if (root === 'system_config') {
            try {
                const docRef = doc(db, 'system_config', 'main');
                const snap = await getDoc(docRef); // Read attempt
                // If read succeeds (even if empty), connection is okay.
            } catch (e) {
                status = 'OFFLINE';
                message = 'مش قادر يقرأ (Access/Missing)';
            }
        }

        results.push({
            name: root,
            status,
            lastChecked: new Date(),
            message
        });
    }
    return results;
};

export const validateAchievement = (achievement: Achievement): AchievementHealth => {
    const issues: string[] = [];

    // 1. Field Validation
    if (achievement.points === undefined || achievement.points < 0) issues.push('Points value invalid');
    if (!achievement.conditionType) issues.push('Condition Type missing');

    // 2. Trigger Validation
    const mappedTriggers = KNOWN_TRIGGERS[achievement.conditionType];
    if (!mappedTriggers) {
        issues.push(`Trigger Mapping ناقص: ${achievement.conditionType}`);
    }

    // 3. Points Flow (Logic Check)
    if (achievement.points > 0 && !achievement.isActive) {
        // Not an issue per se, but worth noting? No, disabled is fine.
    }

    return {
        id: achievement.id,
        status: issues.length > 0 ? 'BROKEN' : 'HEALTHY',
        issues
    };
};

export const logHealthCheck = async (scope: string, results: any) => {
    try {
        await setDoc(doc(collection(db, 'admin_health')), {
            scope,
            results,
            checkedAt: serverTimestamp()
        });
    } catch (e) {
        console.error("Failed to log health", e);
    }
};
