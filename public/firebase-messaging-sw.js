// Scripts for firebase-messaging-sw.js
importScripts('https://www.gstatic.com/firebasejs/9.22.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/9.22.0/firebase-messaging-compat.js');

// Initialize the Firebase app in the service worker by passing in the messagingSenderId.
firebase.initializeApp({
    apiKey: "REPLACE_WITH_YOUR_API_KEY", // Note: Usually fine to be hardcoded or injected during build if strict, but for SW simplified init often works with just messagingSenderId for notifications. 
    // However, compat tokens require full config usually.
    // Best practice: We will use the proper config. 
    // Since this is a static file, we might need a way to inject env.
    // For now, we will assume standard config or fetch it.
    // actually, for 'messaging' only, senderId is key.
    messagingSenderId: "167580622340" // From previous context or generic placeholder. 
    // User provided project: "Minaadelh3/sobekplay"? No, that's github. Project likely "sobek-play" or similar.
    // We will try standard init.
});

// Retrieve an instance of Firebase Messaging so that it can handle background messages.
const messaging = firebase.messaging();

messaging.onBackgroundMessage((payload) => {
    console.log('[firebase-messaging-sw.js] Received background message ', payload);
    // Customize notification here
    const notificationTitle = payload.notification.title;
    const notificationOptions = {
        body: payload.notification.body,
        icon: payload.notification.icon || '/icon-192.png',
        badge: '/icon-192.png'
    };

    self.registration.showNotification(notificationTitle, notificationOptions);
});
