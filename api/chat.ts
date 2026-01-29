
import type { VercelRequest, VercelResponse } from "@vercel/node";
import { GoogleGenerativeAI } from "@google/generative-ai";

const API_KEY = process.env.GEMINI_API_KEY;

export default async function handler(
  req: VercelRequest,
  res: VercelResponse
) {
  // Security Headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Content-Type', 'application/json');

  // Handle Preflight
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  // Reject GET requests (Browser Navigation)
  if (req.method === 'GET') {
    return res.status(405).json({
      error: "Method Not Allowed",
      message: "This endpoint accepts POST requests only for AI chat."
    });
  }

  // Handle POST
  if (req.method === 'POST') {
    try {
      // 1. Security Check
      if (!API_KEY) {
        console.error("SERVER_CONFIG_ERROR: Missing GEMINI_API_KEY");
        // Return 500 but with safe message
        return res.status(500).json({ error: "Service configuration error." });
      }

      // 2. Validate Body
      const { message } = req.body;
      if (!message || typeof message !== 'string') {
        return res.status(400).json({ error: "Invalid payload. 'message' string is required." });
      }

      // 3. Initialize Gemini
      const genAI = new GoogleGenerativeAI(API_KEY);
      const model = genAI.getGenerativeModel({ model: "gemini-1.5-pro" });

      // 4. System Instruction (Egyptian Persona)
      const systemPrompt = `
        You are Sobek AI, the assistant for Sobek Play.
        Persona: Helpful, witty, Egyptian Arabic speaker (Franco/Arabic).
        Role: Game guide and trip coordinator.
        Constraint: Keep replies short (max 200 chars).
        Fallback: If you don't know, say "مش متأكد يا كبير، بس ممكن نشوف سوا!"
      `;

      // 5. Generate with Timeout/Safety
      const prompt = `${systemPrompt}\n\nUser: ${message}\nResponse:`;
      const result = await model.generateContent(prompt);
      const response = await result.response;
      const text = response.text();

      // 6. Success Response
      return res.status(200).json({ reply: text });

    } catch (error: any) {
      console.error("GEMINI_API_FAIL:", error);

      // 7. Graceful Failure (Return 200 to keep UI alive, but with fallback text)
      // Note: We return 500 status strictly for monitoring, but the client should handle it.
      // Actually, for a chatbot, returning a 200 with an error explanation is sometimes safer for simple clients,
      // but let's stick to standard HTTP codes and let client fallback.
      return res.status(500).json({
        error: "AI Service Unavailable",
        details: error.message
      });
    }
  }

  // Fallback
  return res.status(405).json({ error: "Method Not Allowed" });
}
