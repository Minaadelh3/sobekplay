import * as admin from 'firebase-admin';

const db = admin.firestore();

export type NotificationType = 'ADMIN_MANUAL' | 'LEVEL_UP' | 'DAILY_BONUS' | 'RANK_CHANGE' | 'INACTIVITY';

interface RuleConfig {
    cooldownHours: number;
    enabled: boolean;
}

const RULES: Record<NotificationType, RuleConfig> = {
    ADMIN_MANUAL: { cooldownHours: 0, enabled: true }, // Always allow manual
    LEVEL_UP: { cooldownHours: 0, enabled: true }, // Level up happens rarely, so allow always
    DAILY_BONUS: { cooldownHours: 24, enabled: true },
    RANK_CHANGE: { cooldownHours: 1, enabled: true }, // Max 1 per hour (prevent flickering)
    INACTIVITY: { cooldownHours: 72, enabled: true } // Max 1 per 3 days
};

export const canSendNotification = async (userId: string, type: NotificationType): Promise<boolean> => {
    const rule = RULES[type];
    if (!rule || !rule.enabled) return false;
    if (rule.cooldownHours === 0) return true;

    try {
        const ruleDocRef = db.doc(`users/${userId}/notificationRules/${type}`);
        const ruleDoc = await ruleDocRef.get();

        if (!ruleDoc.exists) {
            return true; // Never sent before
        }

        const data = ruleDoc.data();
        const lastTriggered = data?.lastTriggeredAt?.toDate();

        if (!lastTriggered) return true;

        const now = new Date();
        const diffMs = now.getTime() - lastTriggered.getTime();
        const diffHours = diffMs / (1000 * 60 * 60);

        if (diffHours < rule.cooldownHours) {
            console.log(`🚫 Rule Blocked: ${type} for user ${userId}. Cooldown active. (Hours left: ${rule.cooldownHours - diffHours})`);
            return false;
        }

        return true;
    } catch (e) {
        console.error(`Rules check failed for ${userId}/${type}`, e);
        // Fail open or closed? Safe to fail open for important things, fail closed for spammy.
        // Let's fail closed to prevent accidental spam storms.
        return false;
    }
};

export const updateRuleState = async (userId: string, type: NotificationType, metadata: any = {}) => {
    try {
        await db.doc(`users/${userId}/notificationRules/${type}`).set({
            lastTriggeredAt: admin.firestore.FieldValue.serverTimestamp(),
            ...metadata
        }, { merge: true });
    } catch (e) {
        console.error("Failed to update rule state", e);
    }
};
