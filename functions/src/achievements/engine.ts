import * as admin from 'firebase-admin';
import { ACHIEVEMENT_RULES, LEVEL_THRESHOLDS, AchievementRule } from './rules';

const db = admin.firestore();

export interface GameEvent {
    id: string;
    userId: string;
    name: string;
    timestamp: any;
    metadata: any;
}

/**
 * Main Entry Point: Evaluates an event against all rules.
 */
export async function evaluateAchievements(event: GameEvent) {
    const userRef = db.collection('users').doc(event.userId);

    await db.runTransaction(async (t) => {
        const userSnap = await t.get(userRef);
        if (!userSnap.exists) return; // Should not happen

        const userData = userSnap.data() || {};
        const unlocked = userData.unlockedAchievements || [];
        const progressMap = userData.achievementProgress || {};
        const lastActionMap = userData.achievementLastAction || {};

        let xpGained = 0;
        const newUnlocks: string[] = [];
        const updates: any = {};

        // 1. Filter Rules by Trigger
        const candidates = ACHIEVEMENT_RULES.filter(r => r.trigger === event.name);

        for (const rule of candidates) {
            // A. Check Logic
            if (!checkConditions(rule, event, userData)) continue;

            // B. Check Limit
            if (rule.limit > 0 && unlocked.includes(rule.id)) continue;

            // C. Check Cooldown
            if (rule.cooldownMinutes && lastActionMap[rule.id]) {
                const last = lastActionMap[rule.id].toDate().getTime();
                const now = Date.now();
                if ((now - last) / 60000 < rule.cooldownMinutes) continue;
            }

            // D. Check Progressive Target
            if (rule.target) {
                const current = (progressMap[rule.id] || 0) + 1;
                updates[`achievementProgress.${rule.id}`] = current;
                progressMap[rule.id] = current; // Local update for subsequent checks

                if (current < rule.target) continue; // Not yet
            }

            // --- GRANT ---
            let ruleXp = rule.rewards.xp;
            if (rule.rewards.useMetadataXp && event.metadata?.xp) {
                ruleXp += Number(event.metadata.xp) || 0;
            }

            xpGained += ruleXp;
            if (rule.limit > 0) {
                newUnlocks.push(rule.id);
                updates[`unlockedAchievements`] = admin.firestore.FieldValue.arrayUnion(rule.id);
            }

            // Mark Cooldown
            if (rule.cooldownMinutes) {
                updates[`achievementLastAction.${rule.id}`] = admin.firestore.FieldValue.serverTimestamp();
            }

            // Log User Achievement
            const uaRef = db.collection('user_achievements').doc();
            t.set(uaRef, {
                userId: event.userId,
                achievementId: rule.id,
                eventId: event.id,
                earnedAt: admin.firestore.FieldValue.serverTimestamp(),
                xp: ruleXp
            });
        }

        // 2. Process XP & Leveling
        if (xpGained > 0) {
            const currentXP = (userData.xp || 0) + xpGained;
            const currentPoints = (userData.points || 0) + xpGained;
            const currentLevel = userData.level || 1;
            const newLevel = calculateLevel(currentXP);

            updates.xp = currentXP;
            updates.points = currentPoints; // SYNC POINTS WITH XP GAINS

            if (newLevel > currentLevel) {
                updates.level = newLevel;
                // Triggers "LEVEL_UP" event? Maybe recursively?
                // For now, just log it.
                console.log(`User ${event.userId} Leveled Up: ${newLevel}`);
            }

            // Ledger Entry
            const ledgerRef = db.collection('ledger').doc();
            t.set(ledgerRef, {
                type: 'ACHIEVEMENT_REWARD',
                amount: xpGained,
                fromType: 'SYSTEM',
                fromId: 'achievement_engine',
                toType: 'USER',
                toId: event.userId,
                reason: `Achievements: ${newUnlocks.join(', ') || 'Activity'}`,
                eventId: event.id,
                timestamp: admin.firestore.FieldValue.serverTimestamp()
            });

            // Sync Team XP (Legacy Support)
            if (userData.teamId) {
                const teamRef = db.collection('teams').doc(userData.teamId);
                t.update(teamRef, {
                    xp: admin.firestore.FieldValue.increment(xpGained),
                    points: admin.firestore.FieldValue.increment(xpGained)
                });
            }
        }

        if (Object.keys(updates).length > 0) {
            t.update(userRef, updates);

            // Mark event as processed with result
            const eventRef = db.collection('events').doc(event.id);
            t.update(eventRef, {
                processed: true,
                processedAt: admin.firestore.FieldValue.serverTimestamp(),
                result: {
                    xpGained,
                    unlocked: newUnlocks
                }
            });
        }
    });

    return true;
}

// Helper: Check Boolean Conditions
function checkConditions(rule: AchievementRule, event: GameEvent, user: any): boolean {
    if (!rule.conditions) return true;

    for (const cond of rule.conditions) {
        let actualValue: any;

        if (cond.field.startsWith('metadata.')) {
            actualValue = event.metadata?.[cond.field.split('.')[1]];
        } else if (cond.field.startsWith('user.')) {
            // Nested lookup
            const path = cond.field.split('.').slice(1);
            actualValue = user;
            for (const key of path) actualValue = actualValue?.[key];
        }

        switch (cond.operator) {
            case '==': if (actualValue !== cond.value) return false; break;
            case '>=': if (!(actualValue >= cond.value)) return false; break;
            case '<=': if (!(actualValue <= cond.value)) return false; break;
            case '>': if (!(actualValue > cond.value)) return false; break;
            case '<': if (!(actualValue < cond.value)) return false; break;
            case 'contains':
                if (typeof actualValue === 'string' && !actualValue.includes(cond.value)) return false;
                if (Array.isArray(actualValue) && !actualValue.includes(cond.value)) return false;
                break;
        }
    }
    return true;
}

function calculateLevel(xp: number): number {
    // Find the highest level where xp >= min
    const match = [...LEVEL_THRESHOLDS].reverse().find(l => xp >= l.min);
    return match ? match.level : 1;
}
