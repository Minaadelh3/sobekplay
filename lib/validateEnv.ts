/**
 * Validates availability of critical Environment Variables on app startup.
 * Throws a loud error if any are missing to prevent silent failures.
 */
export function validateEnv() {
    const requiredKeys = [
        'NEXT_PUBLIC_FIREBASE_API_KEY',
        'NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN',
        'NEXT_PUBLIC_FIREBASE_PROJECT_ID',
        // Add others if strictly necessary, but API Key is the main crash cause
    ];

    const missing = requiredKeys.filter(key => {
        // Check both NEXT_PUBLIC_ (preferred) and VITE_ (legacy fallback)
        const viteKey = key.replace('NEXT_PUBLIC_', 'VITE_');
        return !import.meta.env[key] && !import.meta.env[viteKey];
    });

    if (missing.length > 0) {
        const errorMsg = `\n💀 CRITICAL CONFIG ERROR: Missing Environment Variables!\n\nThe following keys are missing from .env.local:\n${missing.map(k => `   - ${k}`).join('\n')}\n\nPlease check your .env.local file.`;
        console.error(errorMsg);

        // In strict dev mode, we might want to throw to trigger the error boundary immediately.
        throw new Error(errorMsg);
    }

    console.log("✅ Environment Configuration Verified");
}
