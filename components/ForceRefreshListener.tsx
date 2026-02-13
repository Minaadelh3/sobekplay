import { useEffect, useRef } from 'react';
import { doc, onSnapshot } from 'firebase/firestore';
import { db } from '../lib/firebase';
import toast from 'react-hot-toast';

export default function ForceRefreshListener() {
    // We use a ref to track if this is the initial connection
    // We only want to reload if the trigger happens *while* we are connected,
    // not if we just loaded the app (which presumably has the latest code/data).
    const isFirstRun = useRef(true);

    useEffect(() => {
        // Listen to the global config document
        const unsubscribe = onSnapshot(doc(db, "system_settings", "global_config"), (snapshot) => {
            // If the document doesn't exist or we are just establishing connection
            if (isFirstRun.current) {
                isFirstRun.current = false;
                return;
            }

            // If we receive an update here, it means the document changed while we were watching.
            // This implies a "Force Refresh" or some other config change occurred.
            // We check if 'forceRefreshAt' exists to be sure it's relevant, 
            // effectively any change to this doc could trigger it, but let's assume this doc is sparse.
            const data = snapshot.data();

            if (data?.forceRefreshAt) {
                console.log("Force Refresh Signal Received");

                // Show a user-friendly message
                toast(t => (
                    <div className="flex items-center gap-2">
                        <span className="animate-spin">🔄</span>
                        <span>تحديث إجباري للنظام...</span>
                    </div>
                ), { duration: 3000, icon: null });

                // Reload after a brief delay to let the toast be seen
                setTimeout(() => {
                    window.location.reload();
                }, 1500);
            }
        });

        return () => unsubscribe();
    }, []);

    return null;
}
