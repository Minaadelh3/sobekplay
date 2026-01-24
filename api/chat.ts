import type { VercelRequest, VercelResponse } from "@vercel/node";

export default async function handler(
  req: VercelRequest,
  res: VercelResponse
) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { message } = req.body;

  if (!message) {
    return res.status(400).json({ error: "Message missing" });
  }

  try {
    const aiResponse = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${process.env.GEMINI_API_KEY}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          contents: [
            {
              parts: [
                {
                  text: `
أنت شات بوت اسمه "ابن أخو سوبك".

الشخصية:
- مصري
- خفيف دم
- ذكي
- بيحب أسوان والنيل
- بيرد كل مرة رد مختلف
- ممنوع تكرار نفس الرد

رد على السؤال ده:
${message}
`,
                },
              ],
            },
          ],
        }),
      }
    );

    const data = await aiResponse.json();

    const reply =
      data?.candidates?.[0]?.content?.parts?.[0]?.text ||
      "مش قادر أرد دلوقتي، جرّب تاني";

    return res.status(200).json({ reply });
  } catch (error) {
    return res.status(500).json({ error: "AI error" });
  }
}
