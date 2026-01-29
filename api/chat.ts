import type { VercelRequest, VercelResponse } from "@vercel/node";
import { GoogleGenerativeAI } from "@google/generative-ai";

/**
 * Sobek Play Chat API
 * Handles connection to Google Gemini AI
 */
export default async function handler(
  req: VercelRequest,
  res: VercelResponse
) {
  // GET: Health Check
  if (req.method === "GET") {
    return res.status(200).json({ status: "Sobek AI online" });
  }

  // POST: Chat Interaction
  if (req.method === "POST") {
    try {
      const { message } = req.body;

      // Validate input - must be a string and exist
      if (!message || typeof message !== "string") {
        return res.status(400).json({ error: "Invalid request. Body must include { message: string }" });
      }

      // Security Check: API Key
      const apiKey = process.env.GEMINI_API_KEY;
      if (!apiKey) {
        console.error("CRITICAL: GEMINI_API_KEY is missing in environment variables.");
        return res.status(500).json({ error: "Server Configuration Error" });
      }

      // Initialize Gemini
      const genAI = new GoogleGenerativeAI(apiKey);
      const model = genAI.getGenerativeModel({ model: "gemini-1.5-pro" });

      // System Persona
      const systemInstruction = `You are Sobek AI, the friendly and witty concierge for Sobek Play (a cinematic streaming & gaming platform).
      - Tone: Egyptian Arabic, friendly, slightly witty (like a helpful friend).
      - Role: Help users find games, check trip program, or find their room assignment.
      - If you don't know the answer, politely say you are still learning.
      - Keep responses concise (under 200 chars if possible).
      - Always respond in Arabic unless spoken to in English.`;

      // Construct Prompt
      const fullPrompt = `${systemInstruction}\n\nUser: ${message}\nSobek AI:`;

      // Generate Content
      const result = await model.generateContent(fullPrompt);
      const response = await result.response;
      const text = response.text();

      // Return Valid JSON
      return res.status(200).json({ reply: text });

    } catch (err: any) {
      console.error("🔥 Chat API Error:", err);
      return res.status(500).json({ error: "Internal Server Error", details: err.message });
    }
  }

  // Method not allowed
  return res.status(405).json({ error: "Method not allowed" });
}
