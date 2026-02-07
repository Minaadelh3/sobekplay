import { useState, useEffect } from 'react';
import { collection, doc, onSnapshot, setDoc } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { posters as initialPosters } from '../data/posters';
import { PosterItem } from '../types';

export interface MediaMeta {
    id: string; // matches filename/id from posters.ts
    isHidden?: boolean;
    customTitle?: string;
    customDescription?: string;
    tags?: string[]; // e.g., 'trending', 'classic'
    isFeatured?: boolean;
}

export function useMedia() {
    const [mediaMeta, setMediaMeta] = useState<Record<string, MediaMeta>>({});
    const [posters, setPosters] = useState<PosterItem[]>(initialPosters);
    const [allPosters, setAllPosters] = useState<PosterItem[]>(initialPosters);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const unsub = onSnapshot(collection(db, 'media_meta'), (snapshot) => {
            const meta: Record<string, MediaMeta> = {};
            snapshot.forEach(doc => {
                meta[doc.id] = { id: doc.id, ...doc.data() };
            });
            setMediaMeta(meta);

            // Merge with static posters
            const merged = initialPosters.map(p => {
                const m = meta[p.id];
                const overrides = m ? {
                    title: m.customTitle || p.title,
                    description: m.customDescription || p.description,
                    isHidden: m.isHidden,
                    isFeatured: m.isFeatured
                } : {};

                return { ...p, ...overrides } as PosterItem;
            });

            setAllPosters(merged);
            setPosters(merged.filter(p => !p.isHidden));
            setLoading(false);
        });

        return () => unsub();
    }, []);

    const updateMediaMeta = async (id: string, updates: Partial<MediaMeta>) => {
        await setDoc(doc(db, 'media_meta', id), updates, { merge: true });
    };

    return { posters, allPosters, mediaMeta, loading, updateMediaMeta };
}
