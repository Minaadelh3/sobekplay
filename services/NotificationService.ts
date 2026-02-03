import { getFunctions, httpsCallable } from "firebase/functions";
import { app } from "../lib/firebase";

// Ensure functions region matches your deployment (us-central1 is default)
const functions = getFunctions(app, 'us-central1');

export type NotificationType = 'ADMIN_MANUAL' | 'LEVEL_UP' | 'DAILY_BONUS' | 'RANK_CHANGE';

export interface NotificationPayload {
    userIds: string[];
    title: string;
    body: string;
    url?: string;
    type: NotificationType;
    metadata?: any;
    dryRun?: boolean;
}

export interface NotificationResult {
    data: {
        success: number;
        failed: number;
        skipped: number;
    }
}

/**
 * Service to handle Push Notification Logic from the Frontend.
 * This interacts with the secure Cloud Function Backend.
 */
export const NotificationService = {

    /**
     * Send a notification via the Cloud Function.
     * Use this for Admin actions or secure triggering from client (requires implementation validation).
     */
    send: async (payload: NotificationPayload): Promise<NotificationResult> => {
        try {
            console.log("📤 Sending Notification:", payload);
            const sendPush = httpsCallable<NotificationPayload, NotificationResult['data']>(functions, 'sendPushNotification');
            const result = await sendPush(payload);
            console.log("✅ Notification Result:", result.data);
            return result as NotificationResult;
        } catch (error) {
            console.error("❌ Send Notification Failed:", error);
            throw error;
        }
    },

    /**
     * Helper to format a generic system notification
     */
    formatSystemMessage: (type: NotificationType, userName: string, extraData: any = {}) => {
        switch (type) {
            case 'LEVEL_UP':
                return {
                    title: "Level Up! 🌟",
                    body: `Congratulations ${userName}, you reached Level ${extraData.level}!`,
                    url: '/profile'
                };
            case 'RANK_CHANGE':
                return {
                    title: "New Rank Achieved! 🏆",
                    body: `You are now a ${extraData.rank}!`,
                    url: '/leaderboard'
                };
            default:
                return {
                    title: "New Update",
                    body: "Check out what's new!",
                    url: '/'
                };
        }
    }
};
