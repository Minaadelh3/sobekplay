import React, { createContext, useContext, useEffect, useState } from 'react';
import { auth, db, initAnonymousSession } from '../src/firebase';
import { doc, onSnapshot, setDoc, updateDoc, arrayUnion, arrayRemove, getDoc } from 'firebase/firestore';

interface SessionContextType {
    userId: string | null;
    myList: string[];
    recentlyWatched: string[];
    reactions: Record<string, string>;
    polls: Record<string, string>;
    addToMyList: (id: string) => Promise<void>;
    removeFromMyList: (id: string) => Promise<void>;
    addToRecentlyWatched: (id: string) => Promise<void>;
    addReaction: (id: string, reaction: string) => Promise<void>;
    votePoll: (id: string, option: string) => Promise<void>;
    loading: boolean;
}

const SessionContext = createContext<SessionContextType | undefined>(undefined);

export const SessionProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [userId, setUserId] = useState<string | null>(null);
    const [data, setData] = useState<any>({
        myList: [],
        recentlyWatched: [],
        reactions: {},
        polls: {}
    });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        initAnonymousSession();
        const unsubscribeAuth = auth.onAuthStateChanged(async (user) => {
            if (user) {
                setUserId(user.uid);
                const docRef = doc(db, 'sessions', user.uid);

                // Create doc if not exists
                const snap = await getDoc(docRef);
                if (!snap.exists()) {
                    await setDoc(docRef, {
                        myList: [],
                        recentlyWatched: [],
                        reactions: {},
                        polls: {},
                        updatedAt: new Date().toISOString()
                    });
                }

                // Realtime listener
                const unsubscribeSnapshot = onSnapshot(docRef, (doc) => {
                    if (doc.exists()) {
                        setData(doc.data());
                    }
                    setLoading(false);
                });

                return () => unsubscribeSnapshot();
            } else {
                setLoading(false);
            }
        });

        return () => unsubscribeAuth();
    }, []);

    const updateSession = async (updates: any) => {
        if (!userId) return;
        const docRef = doc(db, 'sessions', userId);
        await updateDoc(docRef, { ...updates, updatedAt: new Date().toISOString() });
    };

    const addToMyList = async (id: string) => {
        if (!userId) return;
        const docRef = doc(db, 'sessions', userId);
        await updateDoc(docRef, { myList: arrayUnion(id) });
    };

    const removeFromMyList = async (id: string) => {
        if (!userId) return;
        const docRef = doc(db, 'sessions', userId);
        await updateDoc(docRef, { myList: arrayRemove(id) });
    };

    const addToRecentlyWatched = async (id: string) => {
        if (!userId) return;
        let newRecent = [id, ...(data.recentlyWatched || []).filter((rid: string) => rid !== id)];
        if (newRecent.length > 10) newRecent = newRecent.slice(0, 10);
        await updateSession({ recentlyWatched: newRecent });
    };

    const addReaction = async (id: string, reaction: string) => {
        if (!userId) return;
        await updateSession({ [`reactions.${id}`]: reaction });
    };

    const votePoll = async (id: string, option: string) => {
        if (!userId) return;
        await updateSession({ [`polls.${id}`]: option });
    };

    return (
        <SessionContext.Provider value={{
            userId,
            myList: data.myList || [],
            recentlyWatched: data.recentlyWatched || [],
            reactions: data.reactions || {},
            polls: data.polls || {},
            addToMyList,
            removeFromMyList,
            addToRecentlyWatched,
            addReaction,
            votePoll,
            loading
        }}>
            {children}
        </SessionContext.Provider>
    );
};

export const useSession = () => {
    const context = useContext(SessionContext);
    if (!context) {
        // Return dummy context if used outside provider (fallback)
        return {
            userId: null,
            myList: [],
            recentlyWatched: [],
            reactions: {},
            polls: {},
            addToMyList: async () => { },
            removeFromMyList: async () => { },
            addToRecentlyWatched: async () => { },
            addReaction: async () => { },
            votePoll: async () => { },
            loading: false
        };
    }
    return context;
};
