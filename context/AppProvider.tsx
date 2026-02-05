"use client";

import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { useAuth } from './AuthContext';
import { UserPreferences } from '../types/auth';
import { doc, updateDoc } from 'firebase/firestore';
import { db } from '../lib/firebase';

// Default Defaults
const DEFAULT_PREFERENCES: UserPreferences = {
    language: 'ar',
    theme: 'dark',
    backgroundStyle: 'default',
    colorScheme: 'gold',
    accessibility: {
        contrast: 'normal',
        fontScale: 'medium',
        reduceMotion: false,
    }
};

interface AppContextType {
    config: UserPreferences;
    updateConfig: (updates: Partial<UserPreferences>) => Promise<void>;
    isLoading: boolean;
}

const AppContext = createContext<AppContextType | null>(null);

export function AppProvider({ children }: { children: React.ReactNode }) {
    const { user, authLoading } = useAuth();

    // Derived state from user.preferences or defaults
    const config = useMemo(() => {
        return {
            ...DEFAULT_PREFERENCES,
            ...(user?.preferences || {})
        };
    }, [user?.preferences]);

    // --- Side Effects Manager ---
    useEffect(() => {
        // 1. Language & Direction
        const lang = config.language || 'ar';
        const dir = lang === 'ar' ? 'rtl' : 'ltr';
        document.documentElement.lang = lang;
        document.documentElement.dir = dir;

        // 2. Theme
        const theme = config.theme || 'dark';
        if (theme === 'system') {
            const systemDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
            document.documentElement.setAttribute('data-theme', systemDark ? 'dark' : 'light');
            if (systemDark) document.documentElement.classList.add('dark');
            else document.documentElement.classList.remove('dark');
        } else {
            document.documentElement.setAttribute('data-theme', theme);
            if (theme === 'dark') document.documentElement.classList.add('dark');
            else document.documentElement.classList.remove('dark');
        }

        // 3. Background & Color Scheme (CSS Variables)
        document.documentElement.setAttribute('data-bg-style', config.backgroundStyle || 'default');
        document.documentElement.setAttribute('data-color-scheme', config.colorScheme || 'gold');

        // 4. Accessibility
        if (config.accessibility?.contrast === 'high') {
            document.documentElement.classList.add('high-contrast');
        } else {
            document.documentElement.classList.remove('high-contrast');
        }

    }, [config]);

    // --- Update Handler ---
    const updateConfig = async (updates: Partial<UserPreferences>) => {
        if (!user) return; // Can't save if not logged in

        try {
            const firestoreUpdates: Record<string, any> = {};

            Object.keys(updates).forEach(key => {
                const k = key as keyof UserPreferences;
                if (k === 'accessibility' && updates.accessibility) {
                    // Merge accessibility object
                    firestoreUpdates[`preferences.accessibility`] = {
                        ...config.accessibility,
                        ...updates.accessibility
                    };
                } else {
                    firestoreUpdates[`preferences.${key}`] = updates[k];
                }
            });

            await updateDoc(doc(db, 'users', user.id), firestoreUpdates);
        } catch (error) {
            console.error("Failed to update app config:", error);
            throw error;
        }
    };

    const value = {
        config,
        updateConfig,
        isLoading: authLoading
    };

    return (
        <AppContext.Provider value={value}>
            {children}
        </AppContext.Provider>
    );
}

export function useAppConfig() {
    const ctx = useContext(AppContext);
    if (!ctx) throw new Error("useAppConfig must be used within AppProvider");
    return ctx;
}
