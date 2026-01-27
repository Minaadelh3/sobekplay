import { initializeApp } from "firebase/app";
import { getAuth, signInAnonymously } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
    apiKey: "AIzaSyCjRt0cgbUr0A6nWP09Z2N0PrOHrh4zEIk",
    authDomain: "sobek-play.firebaseapp.com",
    projectId: "sobek-play",
    storageBucket: "sobek-play.firebasestorage.app",
    messagingSenderId: "390711352934",
    appId: "1:390711352934:web:4a663aaabbcd88abd517a7",
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app);

// Anonymous session (UNCLE JOY)
export const initAnonymousSession = async () => {
    if (!auth.currentUser) {
        await signInAnonymously(auth);
    }
};
