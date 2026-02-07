
/**
 * Sobek Chat Client – Hardened Production Version
 */

export interface ChatResponse {
    reply: string;
    suggestions: any[];
    meta?: any;
    error?: boolean;
}

const CHAT_TIMEOUT = 12_000; // 12 seconds

export async function sendMessageToApi(message: string): Promise<ChatResponse> {
    const requestId = `req_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;

    console.log(`[ChatClient] ➜ ${requestId}`, message);

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), CHAT_TIMEOUT);

    try {
        const res = await fetch("/api/chat", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Accept": "application/json"
            },
            body: JSON.stringify({ message, requestId }),
            signal: controller.signal
        });

        clearTimeout(timeout);

        // HTTP-level failure
        if (!res.ok) {
            console.error(`[ChatClient] HTTP ${res.status}`);
            return fail("السيرفر مش راضي يرد دلوقتي.. جرّب كمان شوية 🐊");
        }

        const raw = await res.text();
        if (!raw) {
            return fail("السيرفر رد فاضي.. حاجة غريبة حصلت 🤔");
        }

        let data: any;
        try {
            data = JSON.parse(raw);
        } catch {
            console.error("[ChatClient] Invalid JSON:", raw);
            return fail("رد السيرفر بايظ شوية.. جرّب تاني");
        }

        console.log(`[ChatClient] ✓ ${requestId}`, data);

        // Validate response shape
        if (typeof data.reply !== "string") {
            console.warn("[ChatClient] Missing reply field");
            return fail("مفيش رد واضح.. قولها تاني بطريقة تانية؟");
        }

        return {
            reply: data.reply.trim() || fallback(),
            suggestions: Array.isArray(data.suggestions) ? data.suggestions : [],
            meta: data.meta
        };

    } catch (err: any) {
        clearTimeout(timeout);

        if (err.name === "AbortError") {
            return fail("السيرفر اتأخر قوي.. جرّب تاني 📡");
        }

        console.error("[ChatClient] Network error:", err);
        return fail("مشكلة نت أو السيرفر وقع.. اتأكد من الاتصال 📶");
    }
}

/* ---------------- helpers ---------------- */

function fail(reply: string): ChatResponse {
    return {
        reply,
        suggestions: [],
        error: true
    };
}

function fallback() {
    return `معلش مسمعتش كويس.. قول تاني؟ (${new Date().toLocaleTimeString("en-EG")})`;
}
