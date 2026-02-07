import { useState, useEffect } from 'react';
import { collection, doc, onSnapshot, setDoc } from 'firebase/firestore';
import { db } from '../lib/firebase';

export interface PrayerSection {
    id: string;
    title: string;
    subtitle: string;
    content: string;
    icon: string;
    timeNote?: string;
}

export function usePrayers() {
    const [prayers, setPrayers] = useState<PrayerSection[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const unsub = onSnapshot(collection(db, 'prayers'), (snapshot) => {
            const items: PrayerSection[] = [];
            snapshot.forEach(doc => {
                items.push({ id: doc.id, ...doc.data() } as PrayerSection);
            });
            // Sort by ID order if needed, or add order field. For now Agpeya order is fixed by logic usually.
            // We can sort manually in the component based on ID if strict order is needed.
            setPrayers(items);
            setLoading(false);
        });

        return () => unsub();
    }, []);

    const updatePrayer = async (id: string, updates: Partial<PrayerSection>) => {
        await setDoc(doc(db, 'prayers', id), updates, { merge: true });
    };

    // Helper to seed initial data if empty (Admin use)
    const seedPrayers = async (initialData: PrayerSection[]) => {
        for (const p of initialData) {
            await setDoc(doc(db, 'prayers', p.id), p);
        }
    };

    return { prayers, loading, updatePrayer, seedPrayers };
}
