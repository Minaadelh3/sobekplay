import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';

admin.initializeApp();

// Interface for User Push Settings
interface QuietHours {
    start: string; // "22:00"
    end: string;   // "08:00"
    timezone: string;
}

interface PushSettings {
    enabled?: boolean;
    quietHours?: QuietHours;
    categories?: Record<string, boolean>;
}

/**
 * Checks if current time is within quiet hours
 */
const isInQuietHours = (quietHours: QuietHours): boolean => {
    // Basic implementation - needs moment-timezone for robustness
    if (!quietHours?.start || !quietHours?.end) return false;

    // Warning: This simplistic check assumes Server Time, which is UTC
    // Production should convert server time to user timezone
    const now = new Date();
    const currentHour = now.getHours();

    const startHour = parseInt(quietHours.start.split(':')[0]);
    const endHour = parseInt(quietHours.end.split(':')[0]);

    if (startHour > endHour) {
        // Spans over midnight (e.g. 22:00 to 08:00)
        return currentHour >= startHour || currentHour < endHour;
    } else {
        // Same day (e.g. 09:00 to 17:00)
        return currentHour >= startHour && currentHour < endHour;
    }
};

export const sendPushNotification = functions.https.onCall(async (data, context) => {
    if (!context.auth) throw new functions.https.HttpsError('unauthenticated', 'User must be logged in');

    const { targetUserId, title, body, category = 'system', priority = 'normal' } = data;

    // 1. Fetch User Settings
    const userDoc = await admin.firestore().collection('users').doc(targetUserId).get();
    if (!userDoc.exists) return { success: false, reason: 'User not found' };

    const userData = userDoc.data();
    const settings: PushSettings = userData?.notifications || {};

    // 2. Check Global Enable
    if (settings.enabled === false) {
        return { success: false, reason: 'User disabled notifications' };
    }

    // 3. Check Category
    if (settings.categories && settings.categories[category] === false) {
        return { success: false, reason: 'Category blocked' };
    }

    // 4. Check Quiet Hours (Skip if High Priority)
    if (priority !== 'high' && settings.quietHours && isInQuietHours(settings.quietHours)) {
        return { success: false, reason: 'Quiet hours active' };
    }

    // 5. Get Tokens
    const tokensSnap = await admin.firestore()
        .collection('users')
        .doc(targetUserId)
        .collection('devices')
        .get();

    if (tokensSnap.empty) return { success: false, reason: 'No devices' };

    const tokens = tokensSnap.docs.map(d => d.id); // We used docId as token

    // 6. Send Multicast
    const payload = {
        notification: { title, body },
        data: { category }
    };

    const response = await admin.messaging().sendMulticast({
        tokens,
        notification: payload.notification,
        data: payload.data
    });

    // 7. Cleanup Invalid Tokens
    const tokensToRemove: Promise<any>[] = [];
    response.responses.forEach((res, idx) => {
        if (!res.success) {
            const error = res.error;
            if (error?.code === 'messaging/registration-token-not-registered' ||
                error?.code === 'messaging/invalid-registration-token') {
                tokensToRemove.push(
                    tokensSnap.docs[idx].ref.delete()
                );
            }
        }
    });

    await Promise.all(tokensToRemove);

    return {
        success: true,
        sent: response.successCount,
        failed: response.failureCount,
        cleaned: tokensToRemove.length
    };
});
