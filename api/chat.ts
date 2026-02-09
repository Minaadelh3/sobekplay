
import type { VercelRequest, VercelResponse } from "@vercel/node";
import { GoogleGenerativeAI } from "@google/generative-ai";
import crypto from 'node:crypto';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const startTime = Date.now();
  const requestId = req.body?.requestId || crypto.randomUUID();

  // --- Headers ---
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, X-Request-ID");
  res.setHeader("Content-Type", "application/json");
  res.setHeader("X-Request-ID", requestId);

  if (req.method === "OPTIONS") return res.status(200).end();
  if (req.method !== "POST") return res.status(405).json({ error: "Method Not Allowed" });

  try {
    // Robust Body Checking
    if (!req.body) {
      console.warn(`[${requestId}] Missing request body`);
      return res.status(400).json({ error: "Missing request body" });
    }

    const { message } = req.body;

    if (!message || typeof message !== "string" || !message.trim()) {
      return res.status(200).json({ reply: "مش سامعك كويس.. قول تاني؟ 🤔" });
    }

    console.log(`[${requestId}] Processing chat message: "${message.substring(0, 50)}..."`);

    // --- Environment Variables ---
    const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
    const GROQ_API_KEY = process.env.GROQ_API_KEY;

    // --- Persona & System Prompt ---
    const timeString = new Date().toLocaleTimeString("en-EG", { timeZone: "Africa/Cairo" });
    const systemPrompt = `
      You are "Abn Akho Sobek" (Sobek's Nephew), the cool concierge of Sobek Play.
      Current Cairo Time: ${timeString}.
      User Message ID: ${requestId}
      
      Persona: Witty, friendly Egyptian slang (Franco-Arab ok). Helpful but chill.
      Rules: Short answers (max 2 sentences). NEVER repeat "How can I help you?".
      IMPORTANT: If the user greeted you before, vary your response. Don't say the same thing twice.
    `;

    let reply = "";
    let provider = "";

    // --- Provider Selection Strategy ---
    // 1. Try Gemini (Google) first if available
    // 2. Try Groq (Llama) if available
    // 3. Fail if neither is configured

    let modelError;

    if (GEMINI_API_KEY) {
      try {
        provider = "gemini-1.5-flash";
        console.log(`[${requestId}] Attempting Provider: ${provider}`);

        const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);
        const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

        const chat = model.startChat({
          history: [
            {
              role: "user",
              parts: [{ text: systemPrompt }],
            },
            {
              role: "model",
              parts: [{ text: "OK. I am ready to be Sobek's Nephew. Bring it on!" }],
            },
          ],
        });

        const result = await chat.sendMessage(message);
        const response = await result.response;
        reply = response.text();
        console.log(`[${requestId}] Gemini Success`);

      } catch (e: any) {
        console.warn(`[${requestId}] Gemini Failed: ${e.message}. Falling back...`);
        modelError = e;
        provider = "";
      }
    }

    // Attempt Groq if Gemini failed OR wasn't configured
    if (!reply && GROQ_API_KEY) {
      try {
        provider = "groq-llama-3.1-8b";
        console.log(`[${requestId}] Attempting Provider: ${provider}`);

        const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${GROQ_API_KEY}`
          },
          body: JSON.stringify({
            model: "llama-3.1-8b-instant",
            messages: [
              { role: "system", content: systemPrompt },
              { role: "user", content: message }
            ],
            temperature: 0.9,
            max_tokens: 200,
          })
        });

        if (!response.ok) {
          const errorText = await response.text();
          throw new Error(`Groq API Error: ${response.status} ${response.statusText} - ${errorText}`);
        }

        const data = await response.json();
        reply = data.choices?.[0]?.message?.content || "";
        console.log(`[${requestId}] Groq Success`);

      } catch (e: any) {
        console.error(`[${requestId}] Groq Failed: ${e.message}`);
        modelError = e;
      }
    }

    if (!reply) {
      console.error(`[FATAL] All AI Providers Failed!`);
      if (modelError) throw modelError;
      throw new Error("No AI Providers configured or working.");
    }

    if (!reply.trim()) reply = "الشبكة بتقطع.. قول تاني؟ 🐊";

    console.log(`[${requestId}] Success. Duration: ${Date.now() - startTime}ms`);

    return res.status(200).json({
      reply,
      meta: {
        requestId,
        provider,
        timestamp: Date.now(),
        duration: Date.now() - startTime
      }
    });

  } catch (error: any) {
    console.error(`API_FAIL [${requestId}]:`, error);
    console.error(error.stack);

    // Graceful Fallback
    const fallbacks = [
      "معلش النت في مصر بعافية شوية.. لحظة وجاي!",
      "السيستم بياخد دش.. جرب تاني كمان دقيقة 🐊",
      "يا ساتر.. النت فصل! قول تاني كدة؟"
    ];

    // In DEV mode, return actual error
    // Note: Vercel environment variables are strings
    const isDev = process.env.NODE_ENV === 'development' || !process.env.NODE_ENV;

    if (isDev) {
      return res.status(500).json({
        error: "Internal Handler Error",
        message: error.message,
        stack: error.stack,
        requestId
      });
    }

    return res.status(200).json({
      reply: fallbacks[Math.floor(Math.random() * fallbacks.length)],
      meta: { error: true, details: error.message }
    });
  }
}
