// Native fetch is available in Node.js 18+

const API_URL = 'http://localhost:3002/api/chat'; // Using port 3002

async function testChat() {
    console.log("🧪 Testing /api/chat on port 3002...");

    // 1. Valid Request
    console.log("\n1. Sending Valid Request...");
    try {
        const res = await fetch(API_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ message: "Hello, who are you?" })
        });
        const text = await res.text();
        console.log(`Status: ${res.status}`);
        try {
            console.log("Response:", JSON.stringify(JSON.parse(text), null, 2));
        } catch {
            console.log("Raw Response:", text);
        }
    } catch (e) {
        console.error("❌ Request Failed:", e);
    }
}

testChat();
