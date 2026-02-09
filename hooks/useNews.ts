import { useState, useEffect } from 'react';
import { collection, doc, onSnapshot, setDoc, deleteDoc, addDoc, query, orderBy, writeBatch } from 'firebase/firestore';
import { db } from '../lib/firebase';

import { NewsItem } from '../types';

export function useNews() {
    const [news, setNews] = useState<NewsItem[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const q = query(collection(db, 'news'), orderBy('order', 'asc'));
        const unsub = onSnapshot(q, (snapshot) => {
            const items: NewsItem[] = [];
            snapshot.forEach(doc => {
                // IMPORTANT: Spread data FIRST, then overwrite id with doc.id
                // This prevents the 'id' field in the data from overwriting the actual document ID
                items.push({ ...doc.data(), id: doc.id } as NewsItem);
            });
            setNews(items);
            setLoading(false);
        });

        return () => unsub();
    }, []);

    const addNews = async (item: Omit<NewsItem, 'id'>) => {
        // Ensure we don't save the 'id' field into the document data
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const { id, ...dataToSave } = item as any;

        await addDoc(collection(db, 'news'), {
            ...dataToSave,
            date: new Date(),
            order: news.length + 1
        });
    };

    const updateNews = async (id: string, updates: Partial<NewsItem>) => {
        await setDoc(doc(db, 'news', id), updates, { merge: true });
    };

    const deleteNews = async (id: string) => {
        await deleteDoc(doc(db, 'news', id));
    };

    const reorderNews = async (items: NewsItem[]) => {
        // optimistically update local state if needed, but for now just write to DB
        // Writing in batch might be better but simple loops work for small lists
        items.forEach(async (item, index) => {
            await setDoc(doc(db, 'news', item.id), { order: index + 1 }, { merge: true });
        });
    };

    const deleteAllNews = async () => {
        const batch = writeBatch(db);
        news.forEach((item) => {
            const docRef = doc(db, 'news', item.id);
            batch.delete(docRef);
        });
        await batch.commit();
        setNews([]); // Optimistic update
    };

    return { news, loading, addNews, updateNews, deleteNews, reorderNews, deleteAllNews };
}
