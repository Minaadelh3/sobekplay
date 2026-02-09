
import { createClient } from '@supabase/supabase-js'; // If used, otherwise remove
// We will use native fetch for OneSignal API calls to keep it lightweight

const BASE_URL = 'https://onesignal.com/api/v1';

export type TargetAudience =
    | { type: 'All' }
    | { type: 'Segment', segments: string[] }
    | { type: 'Filter', filters: any[] }
    | { type: 'Email', email_auth_hash?: string, email: string }
    | { type: 'SpecificUsers', userIds: string[] }; // Added SpecificUsers

export interface NotificationPayload {
    title: string;
    message: string;
    url?: string;
    imageUrl?: string;
    sendAfter?: string;
    data?: Record<string, any>;
    buttons?: any[];
}

// Helper to get headers dynamically
const getHeaders = () => {
    const apiKey = process.env.ONESIGNAL_REST_API_KEY;
    if (!apiKey) {
        throw new Error("Missing ONESIGNAL_REST_API_KEY");
    }
    return {
        'Content-Type': 'application/json; charset=utf-8',
        'Authorization': `Basic ${apiKey}`
    };
};

const getAppId = () => {
    const appId = process.env.ONESIGNAL_APP_ID;
    if (!appId) {
        throw new Error("Missing ONESIGNAL_APP_ID");
    }
    return appId;
};

export const OneSignalServer = {
    /**
     * Send a notification via OneSignal REST API
     */
    async sendNotification(audience: any, payload: NotificationPayload): Promise<{ id: string; recipients: number; errors?: any[] }> {
        const appId = getAppId();
        const headers = getHeaders();

        // 1. Strict Payload Sanitization
        // Remove undefined, null, or empty string values to prevent API errors
        const cleanPayload = (obj: any) => {
            return Object.entries(obj)
                .reduce((acc: any, [key, value]) => {
                    if (value !== undefined && value !== null && value !== '') {
                        if (typeof value === 'object' && !Array.isArray(value)) {
                            const cleaned = cleanPayload(value);
                            if (Object.keys(cleaned).length > 0) acc[key] = cleaned;
                        } else {
                            acc[key] = value;
                        }
                    }
                    return acc;
                }, {});
        };

        const rawBody: any = {
            app_id: appId,
            headings: { en: payload.title },
            contents: { en: payload.message },
            url: payload.url,
            chrome_web_image: payload.imageUrl,
            big_picture: payload.imageUrl,
            ios_attachments: payload.imageUrl ? { id1: payload.imageUrl } : undefined,
            send_after: payload.sendAfter,
            data: payload.data
        };

        const body = cleanPayload(rawBody);

        // Targeting Logic
        if (audience.type === 'All') {
            body.included_segments = ['Subscribed Users'];
        } else if (audience.type === 'Segment') {
            body.included_segments = audience.segments;
        } else if (audience.type === 'Filter') {
            body.filters = audience.filters;
        } else if (audience.type === 'SpecificUsers') {
            // Target by External User ID (Firebase UID)
            body.include_aliases = {
                external_id: audience.userIds
            };
            body.target_channel = "push";
        } else if (audience.include_player_ids) {
            // Internal / Test usage
            body.include_player_ids = audience.include_player_ids;
        }

        try {
            console.log("Sending OneSignal Push:", JSON.stringify(body, null, 2));
            const response = await fetch(`${BASE_URL}/notifications`, {
                method: 'POST',
                headers: headers,
                body: JSON.stringify(body)
            });

            const data = await response.json();

            if (!response.ok) {
                console.error("OneSignal API Error Response:", data);
                throw new Error(data.errors?.[0] || 'OneSignal API Error');
            }

            return data;
        } catch (error) {
            console.error("OneSignal Send Error:", error);
            throw error;
        }
    },

    /**
     * Get View Apps (mocked or real if key allows)
     * This is usually to get Segments.
     */
    async getAppDetails() {
        const appId = getAppId();
        const headers: Record<string, string> = {
            ...getHeaders(),
            'Connection': 'close' // Prevent keep-alive race conditions
        };

        let lastError: any;
        const maxRetries = 3;

        for (let attempt = 1; attempt <= maxRetries; attempt++) {
            try {
                const response = await fetch(`${BASE_URL}/apps/${appId}`, {
                    method: 'GET',
                    headers: headers
                });

                if (!response.ok) {
                    const err = await response.text();
                    console.error(`OneSignal GetApp Error (Attempt ${attempt}/${maxRetries}):`, err);
                    throw new Error("Failed to fetch app details");
                }

                return await response.json();
            } catch (error) {
                lastError = error;
                console.warn(`OneSignal GetApp attempt ${attempt}/${maxRetries} failed:`, error);
                if (attempt < maxRetries) {
                    // Exponential backoff: 500ms, 1000ms, 1500ms...
                    await new Promise(resolve => setTimeout(resolve, 500 * attempt));
                }
            }
        }

        throw lastError;
    }
};
