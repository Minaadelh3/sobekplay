try {
    importScripts('https://cdn.onesignal.com/sdks/web/v16/OneSignalSDK.sw.js');
} catch (e) {
    // Silently fail if blocked by AdBlock/Network.
    // This prevents the SW from crashing entirely.
    console.warn('[SW] OneSignal Import Failed (Likely Blocked). Notification features will be disabled.');
}
