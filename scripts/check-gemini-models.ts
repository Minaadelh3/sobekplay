
import { GoogleGenerativeAI } from "@google/generative-ai";
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(process.cwd(), '.env') });
dotenv.config({ path: path.resolve(process.cwd(), '.env.local'), override: true });

async function listModels() {
    const key = process.env.GEMINI_API_KEY;
    if (!key) {
        console.error("No GEMINI_API_KEY found");
        return;
    }
    const genAI = new GoogleGenerativeAI(key);
    // Note: listModels might not be available on GoogleGenerativeAI instance directly in some versions,
    // usually it's on the model or via API. 
    // Actually, the SDK has a way to get model info?
    // Let's try to just use a known model and see if it works.
    // Or check documentation.

    // The node SDK doesn't have listModels on the client usually.
    // But we can try to generate content with a very basic prompt.

    const models = ["gemini-1.5-flash", "gemini-pro", "gemini-1.0-pro", "gemini-1.5-pro"];

    console.log("Checking models...");

    for (const modelName of models) {
        try {
            console.log(`Trying ${modelName}...`);
            const model = genAI.getGenerativeModel({ model: modelName });
            const result = await model.generateContent("Hello");
            console.log(`✅ ${modelName} works! Response: ${result.response.text()}`);
            break;
        } catch (e: any) {
            console.log(`❌ ${modelName} failed: ${e.message}`);
        }
    }
}

listModels();
