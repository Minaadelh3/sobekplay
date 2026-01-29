import type { VercelRequest, VercelResponse } from "@vercel/node";
import { GoogleGenerativeAI } from "@google/generative-ai";

const API_KEY = process.env.GEMINI_API_KEY;

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (!API_KEY) {
    return res.status(200).json({ reply: "NO_API_KEY" });
  }

  const { message } = req.body || {};
  if (!message) {
    return res.status(200).json({ reply: "NO_MESSAGE" });
  }

  try {
    const genAI = new GoogleGenerativeAI(API_KEY);
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
    const result = await model.generateContent(message);

    return res.status(200).json({
      reply: result.response.text()
    });
  } catch (e) {
    return res.status(200).json({
      reply: "GEMINI_ERROR"
    });
  }
}
