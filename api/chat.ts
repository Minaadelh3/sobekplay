
import type { VercelRequest, VercelResponse } from "@vercel/node";

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // 1. Runtime Key Read
  const GROQ_API_KEY = process.env.GROQ_API_KEY;

  const startTime = Date.now();
  const requestId = req.body?.requestId || crypto.randomUUID();

  // 2. Headers
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, X-Request-ID");
  res.setHeader("Content-Type", "application/json");
  res.setHeader("X-Request-ID", requestId);

  if (req.method === "OPTIONS") return res.status(200).end();
  if (req.method !== "POST") return res.status(405).json({ error: "Method Not Allowed" });

  const { message } = req.body;

  if (!message || typeof message !== "string" || !message.trim()) {
    return res.status(200).json({ reply: "مش سامعك كويس.. قول تاني؟ 🤔" });
  }

  try {
    // 3. Strict Guard
    if (!GROQ_API_KEY) {
      console.error(`[FATAL] GROQ_API_KEY is missing in process.env! RequestId: ${requestId}`);
      throw new Error("MISSING_KEYS");
    }

    // 4. Dynamic System Prompt
    const timeString = new Date().toLocaleTimeString("en-EG", { timeZone: "Africa/Cairo" });
    const systemPrompt = `
      You are "Abn Akho Sobek" (Sobek's Nephew), the cool concierge of Sobek Play.
      Current Cairo Time: ${timeString}.
      User Message ID: ${requestId}
      
      Persona: Witty, friendly Egyptian slang (Franco-Arab ok). Helpful but chill.
      Rules: Short answers (max 2 sentences). NEVER repeat "How can I help you?".
      IMPORTANT: If the user greeted you before, vary your response. Don't say the same thing twice.
    `;

    // 5. Groq Call
    const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${GROQ_API_KEY}` // Validated above
      },
      body: JSON.stringify({
        model: "llama3-70b-8192",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: message }
        ],
        temperature: 0.9,
        max_tokens: 200,
      })
    });

    if (!response.ok) {
      const errText = await response.text();
      console.error(`GROQ_ERR [${requestId}]:`, errText);
      throw new Error(`Provider Error ${response.status}`);
    }

    const data = await response.json();
    let reply = data.choices?.[0]?.message?.content || "";
    if (!reply.trim()) reply = "الشبكة بتقطع.. قول تاني؟ 🐊";

    return res.status(200).json({
      reply,
      meta: {
        requestId,
        provider: "groq-llama3-70b",
        timestamp: Date.now()
      }
    });

  } catch (error: any) {
    console.error(`API_FAIL [${requestId}]:`, error.message);

    // 6. Graceful Human Fallback
    const fallbacks = [
      "معلش النت في مصر بعافية شوية.. لحظة وجاي!",
      "السيستم بياخد دش.. جرب تاني كمان دقيقة 🐊",
      "يا ساتر.. النت فصل! قول تاني كدة؟"
    ];
    return res.status(200).json({
      reply: fallbacks[Math.floor(Math.random() * fallbacks.length)],
      meta: { error: true }
    });
  }
}
