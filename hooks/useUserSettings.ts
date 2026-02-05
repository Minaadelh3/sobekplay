import { doc, onSnapshot } from "firebase/firestore";
import { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import { db } from "../lib/firebase";
import { User } from "../types/auth";
// Note: We might import detailed types if we had them separate, 
// using 'User' generic type + custom fields for now.

export function useUserSettings() {
    const { user, firebaseUser } = useAuth();
    const [userData, setUserData] = useState<User | null>(user);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!firebaseUser) {
            setLoading(false);
            return;
        }

        const unsub = onSnapshot(doc(db, "users", firebaseUser.uid), (docSnap) => {
            if (docSnap.exists()) {
                // We rely on AuthContext for the main 'user' object mostly, 
                // but this hook provides a dedicated stream for SETTINGS specifically 
                // if we want faster updates or granular control without re-rendering the whole app context.
                // For now, mapping similar to Auth is fine, or just returning raw data.
                const data = docSnap.data();
                setUserData({
                    id: docSnap.id,
                    ...data
                } as any);
            }
            setLoading(false);
        });

        return () => unsub();
    }, [firebaseUser]);

    return { userData, loading };
}
