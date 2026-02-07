import { useState, useEffect } from 'react';
import { collection, doc, onSnapshot, setDoc, deleteDoc, addDoc, query, orderBy } from 'firebase/firestore';
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
                items.push({ id: doc.id, ...doc.data() } as NewsItem);
            });
            setNews(items);
            setLoading(false);
        });

        return () => unsub();
    }, []);

    const addNews = async (item: Omit<NewsItem, 'id'>) => {
        await addDoc(collection(db, 'news'), {
            ...item,
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

    return { news, loading, addNews, updateNews, deleteNews, reorderNews };
}
