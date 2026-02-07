import { useState, useEffect } from 'react';
import { db } from '../lib/firebase';
import { doc, getDoc, setDoc, onSnapshot } from 'firebase/firestore';

export interface TimelineItem {
    time: string;
    event: string;
}

export interface EpisodeOverride {
    enabled: boolean;
    title: string;
    subtitle: string;
    intro: string; // This maps to "tagline" in the UI concept
    date: string; // This maps to "location" in the UI concept
    details: TimelineItem[];
}

export interface ProgramOverrides {
    [episodeId: number]: EpisodeOverride;
}

export const OVERRIDES_COLLECTION = 'system_config';
export const OVERRIDES_DOC = 'program_overrides';

export const useProgramOverrides = () => {
    const [overrides, setOverrides] = useState<ProgramOverrides>({});
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const unsubscribe = onSnapshot(doc(db, OVERRIDES_COLLECTION, OVERRIDES_DOC), (doc) => {
            if (doc.exists()) {
                setOverrides(doc.data() as ProgramOverrides);
            } else {
                setOverrides({});
            }
            setLoading(false);
        });

        return () => unsubscribe();
    }, []);

    const saveOverride = async (episodeId: number, data: EpisodeOverride) => {
        try {
            await setDoc(doc(db, OVERRIDES_COLLECTION, OVERRIDES_DOC), {
                [episodeId]: data
            }, { merge: true });
            return true;
        } catch (error) {
            console.error("Error saving override:", error);
            return false;
        }
    };

    const resetOverride = async (episodeId: number) => {
        try {
            // We just disable it, but keep the data? Or clear it? 
            // The prompt says "Reset to default". 
            // Let's just set enabled to false.
            // Actually, maybe we want to delete the key? 
            // For now, let's just set enabled: false and clear fields to empty strings to be clean.

            // But to avoid losing draft work, maybe just disable. 
            // The prompt implies "Reset" might mean "Clear".
            // Let's implement as "Disable and Clear" for true reset.

            await setDoc(doc(db, OVERRIDES_COLLECTION, OVERRIDES_DOC), {
                [episodeId]: {
                    enabled: false,
                    title: "",
                    subtitle: "",
                    intro: "",
                    date: "",
                    details: []
                }
            }, { merge: true });
            return true;
        } catch (error) {
            console.error("Error resetting override:", error);
            return false;
        }
    };

    return { overrides, loading, saveOverride, resetOverride };
};
