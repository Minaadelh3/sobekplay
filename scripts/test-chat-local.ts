// Native fetch is available in Node.js 18+

const API_URL = 'http://localhost:3001/api/chat'; // Direct access to local-api

async function testChat() {
    console.log("🧪 Testing /api/chat...");

    // 1. Valid Request
    console.log("\n1. Sending Valid Request...");
    try {
        const res = await fetch(API_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ message: "Hello, who are you?" })
        });
        const data = await res.json();
        console.log(`Status: ${res.status}`);
        console.log("Response:", JSON.stringify(data, null, 2));
    } catch (e) {
        console.error("❌ Request Failed:", e);
    }

    // 2. Missing Body
    console.log("\n2. Sending Request with Missing Body...");
    try {
        const res = await fetch(API_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' }
            // No body
        });
        const data = await res.json();
        console.log(`Status: ${res.status}`);
        console.log("Response:", JSON.stringify(data, null, 2));
    } catch (e) {
        console.error("❌ Request Failed:", e);
    }

    // 3. Empty Message
    console.log("\n3. Sending Request with Empty Message...");
    try {
        const res = await fetch(API_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ message: "   " })
        });
        const data = await res.json();
        console.log(`Status: ${res.status}`);
        console.log("Response:", JSON.stringify(data, null, 2));
    } catch (e) {
        console.error("❌ Request Failed:", e);
    }
}

testChat();
