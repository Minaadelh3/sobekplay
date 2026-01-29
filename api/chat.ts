import type { VercelRequest, VercelResponse } from "@vercel/node";
import { GoogleGenerativeAI } from "@google/generative-ai";

const API_KEY = process.env.GEMINI_API_KEY;

// ✅ غيّر الدومين ده لدومينك الحقيقي
const ALLOWED_ORIGIN = "https://sobekplay.vercel.app";

// ⏱️ Timeout helper (safe even لو SDK مش بيدعم AbortController)
function withTimeout<T>(promise: Promise<T>, ms: number): Promise<T> {
  return Promise.race([
    promise,
    new Promise<T>((_, reject) =>
      setTimeout(() => reject(new Error("TIMEOUT")), ms)
    ),
  ]);
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // ✅ CORS (مش *)
  res.setHeader("Access-Control-Allow-Origin", ALLOWED_ORIGIN);
  res.setHeader("Vary", "Origin");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
  res.setHeader("Content-Type", "application/json; charset=utf-8");

  // Preflight
  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  // Only POST
  if (req.method !== "POST") {
    return res.status(200).json({
      reply: "الـ Chat endpoint ده بيقبل POST بس يا كبير 🙏",
    });
  }

  // ✅ Never crash UI بسبب config
  if (!API_KEY) {
    console.error("SERVER_CONFIG_ERROR: Missing GEMINI_API_KEY");
    return res.status(200).json({
      reply: "الخدمة واقفة شوية يا كبير، جرّب تاني كمان شوية 🙏",
    });
  }

  // Validate body
  const { message } = req.body ?? {};
  if (!message || typeof message !== "string") {
    return res.status(200).json({
      reply: "ابعت رسالة نصّية مفهومة بس ✨",
    });
  }

  try {
    const genAI = new GoogleGenerativeAI(API_KEY);
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-pro" });

    const systemPrompt = `
You are Sobek AI, the assistant for Sobek Play.
Persona: Helpful, witty, Egyptian Arabic speaker (Franco/Arabic).
Role: Game guide and trip coordinator.
Constraint: Keep replies short (max 200 chars).
Fallback: If you don't know, say "مش متأكد يا كبير، بس ممكن نشوف سوا!"
`;

    const prompt = `${systemPrompt}\nUser: ${message}\nAssistant:`;

    // ⏱️ 8 ثواني كفاية عشان Vercel مايقفلش الفنكشن
    const result = await withTimeout(model.generateContent(prompt), 8000);
    const text = result.response?.text?.() ?? "";

    return res.status(200).json({
      reply: text.trim() || "مش متأكد يا كبير، بس ممكن نشوف سوا!",
    });
  } catch (err: any) {
    console.error("GEMINI_API_FAIL:", err?.message || err);

    // ✅ أهم نقطة: ما ترجعش 500 للـ UI (خليه دايمًا 200 + reply)
    const fallback =
      err?.message === "TIMEOUT"
        ? "الرد اتأخر شوية 🤦‍♂️ جرّب تاني بسرعة."
        : "حصلت لخبطة بسيطة 😅 جرّب تاني كمان شوية.";

    return res.status(200).json({ reply: fallback });
  }
}
