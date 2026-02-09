
import { initializeApp } from "firebase/app";
import { getFirestore, doc, getDoc } from "firebase/firestore";
import { firebaseConfig } from './lib/firebaseConfig'; // Adjust import if needed

// Mocking firebase config or using local env if available, strict check not needed for this one-off
// actually, I'll rely on the existing firebase setup in the code
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

async function checkTeams() {
    const teamIds = ['tout', 'ptah', 'amon', 'ra'];
    for (const id of teamIds) {
        const d = await getDoc(doc(db, "teams", id));
        if (d.exists()) {
            console.log(`Team ${id}:`, d.data());
        } else {
            console.log(`Team ${id}: DOES NOT EXIST`);
        }
    }
}

checkTeams();
