
import http from 'http';

const PORT = 3001;
const HOST = 'localhost';

console.log(`🔍 Diagnosing API Server on http://${HOST}:${PORT}...`);

// Check Health
const req = http.request({
    hostname: HOST,
    port: PORT,
    path: '/api/health',
    method: 'GET',
    timeout: 2000
}, (res) => {
    console.log(`✅ Connection Successful! Status: ${res.statusCode}`);

    let data = '';
    res.on('data', (chunk) => data += chunk);
    res.on('end', () => {
        console.log("📄 Response Body:", data);
        try {
            JSON.parse(data);
            console.log("✅ Response is valid JSON.");
        } catch (e) {
            console.error("❌ Response is NOT JSON.");
        }
    });
});

req.on('error', (e: any) => {
    console.error(`❌ Connection Failed: ${e.message}`);
    if (e.code === 'ECONNREFUSED') {
        console.error("🔴 Server is NOT running on port 3001.");
        console.error("👉 Please ensure you ran 'npm run dev'.");
    }
});

req.on('timeout', () => {
    req.destroy();
    console.error("❌ Connection Timed Out.");
});

req.end();
