
import type { VercelRequest, VercelResponse } from "@vercel/node";
import { GoogleGenerativeAI } from "@google/generative-ai";

// Environment Check
const API_KEY = process.env.GEMINI_API_KEY;

export default async function handler(
  req: VercelRequest,
  res: VercelResponse
) {
  // CORS Handling (Optional for Vercel, but good for local/cross-origin safety)
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  // GET: Health Check
  if (req.method === "GET") {
    return res.status(200).json({ status: "Sobek AI online", model: "gemini-1.5-pro" });
  }

  // POST: Chat Logic
  if (req.method === "POST") {
    try {
      if (!API_KEY) {
        console.error("SERVER_ERROR: GEMINI_API_KEY is missing");
        return res.status(500).json({ error: "Server Configuration Error" });
      }

      const { message } = req.body;

      if (!message || typeof message !== 'string') {
        return res.status(400).json({ error: "Validation Error: 'message' must be a string." });
      }

      // Initialize Gemini
      const genAI = new GoogleGenerativeAI(API_KEY);
      const model = genAI.getGenerativeModel({ model: "gemini-1.5-pro" });

      // System Prompts & Context
      const systemPrompt = `
        You are Sobek AI, the friendly, witty Egyptian assistant for "Sobek Play".
        Your role is to help users navigate the app (games, trips, room allocation).
        Tone: Egyptian slang (Franco-Arab or Arabic), funny, helpful, polite.
        Instructions:
        - Keep answers short (max 2-3 sentences).
        - If asked about user status/room, ask for their name.
        - If something is broken, joke about "the system being down".
      `;

      // Generate Content
      const result = await model.generateContent(`${systemPrompt}\n\nUser: ${message}\nAssistant:`);
      const response = await result.response;
      const text = response.text();

      if (!text) throw new Error("Empty response from AI");

      return res.status(200).json({ reply: text });

    } catch (error: any) {
      console.error("GEMINI_API_ERROR:", error);

      // Handle Google specific errors safely
      const errorMessage = error.message?.includes("API_KEY")
        ? "Invalid API Key Config"
        : "AI Service Unavailable";

      return res.status(500).json({ error: errorMessage });
    }
  }

  return res.status(405).json({ error: "Method Not Allowed" });
}
