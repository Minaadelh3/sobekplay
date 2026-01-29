
import type { VercelRequest, VercelResponse } from "@vercel/node";

const GROQ_API_KEY = process.env.GROQ_API_KEY;

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // 1. Strict CORS
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
  res.setHeader("Content-Type", "application/json");

  if (req.method === "OPTIONS") return res.status(200).end();

  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method Not Allowed" });
  }

  const { message } = req.body;

  if (!message || typeof message !== "string" || !message.trim()) {
    return res.status(200).json({ reply: "مش سامعك كويس.. قول تاني؟ 🤔" });
  }

  try {
    if (!GROQ_API_KEY) throw new Error("MISSING_KEYS");

    // 2. Dynamic System Prompt
    const timeString = new Date().toLocaleTimeString("en-EG", { timeZone: "Africa/Cairo" });
    const systemPrompt = `
      You are "Abn Akho Sobek" (Sobek's Nephew), the cool concierge of Sobek Play.
      
      Persona: 
      - Witty, friendly Egyptian slang (Franco-Arab ok).
      - Helpful but chill. Not a robot.
      
      Tasks:
      - Help with Room/Accommodation.
      - Explain the Trip Program.
      - Suggest Games.
      
      Context:
      - Current Cairo Time: ${timeString}.
      - User is asking for help.

      Rules:
      - Keep it short (max 2 sentences).
      - NEVER repeat "How can I help you?".
      - If you don't know, make a joke about being a crocodile.
    `;

    // 3. Groq Call
    const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${GROQ_API_KEY}`
      },
      body: JSON.stringify({
        model: "llama3-70b-8192",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: message }
        ],
        temperature: 0.9, // High creativity
        max_tokens: 200,
      })
    });

    if (!response.ok) throw new Error(`Groq ${response.status}`);

    const data = await response.json();
    let reply = data.choices?.[0]?.message?.content || "";

    // Fallback if empty
    if (!reply.trim()) reply = "الشبكة بتقطع.. قول تاني؟";

    return res.status(200).json({ reply });

  } catch (error) {
    console.error("API_FAIL:", error);
    // 4. Human Fallback (Randomized)
    const fallbacks = [
      "معلش النت في مصر بعافية شوية.. لحظة وجاي!",
      "السيستم بياخد دش.. جرب تاني كمان دقيقة 🐊",
      "يا ساتر.. النت فصل! قول تاني كدة؟"
    ];
    return res.status(200).json({
      reply: fallbacks[Math.floor(Math.random() * fallbacks.length)]
    });
  }
}
