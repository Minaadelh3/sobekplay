import React from 'react';
import { useOneSignal } from '../hooks/useOneSignal';

/**
 * Headless component to manage OneSignal Lifecycle
 * Must be placed inside AuthProvider
 */
export default function OneSignalManager() {
    useOneSignal();
    return null;
}
