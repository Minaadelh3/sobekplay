import type { VercelRequest, VercelResponse } from "@vercel/node";
import { GoogleGenerativeAI } from "@google/generative-ai";

const API_KEY = process.env.GEMINI_API_KEY;

export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader("Content-Type", "application/json");

  if (req.method !== "POST") {
    return res.status(200).json({ reply: "POST only" });
  }

  if (!API_KEY) {
    return res.status(200).json({ reply: "AI unavailable" });
  }

  const { message } = req.body || {};
  if (typeof message !== "string" || !message.trim()) {
    return res.status(200).json({ reply: "اكتب حاجة الأول" });
  }

  try {
    const genAI = new GoogleGenerativeAI(API_KEY);
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-pro" });
    const result = await model.generateContent(message);
    const text = result.response.text();
    return res.status(200).json({ reply: text });
  } catch {
    return res.status(200).json({ reply: "حصلت مشكلة مؤقتة" });
  }
}
