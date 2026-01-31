import React from 'react';
import { isFirebaseConfigValid, missingKeys } from '../lib/firebase';

interface EnvValidatorProps {
    children: React.ReactNode;
}

export const EnvValidator: React.FC<EnvValidatorProps> = ({ children }) => {
    if (!isFirebaseConfigValid) {
        return (
            <div className="min-h-screen bg-neutral-900 text-white flex flex-col items-center justify-center p-8 text-center font-mono">
                <div className="bg-red-900/20 border border-red-500/50 p-8 rounded-2xl max-w-2xl">
                    <h1 className="text-3xl font-bold mb-4 text-red-500">Configuration Error ⚠️</h1>
                    <p className="mb-6 text-gray-300">
                        The application cannot start because the connection to the database is not configured correctly.
                    </p>

                    <div className="bg-black/50 p-4 rounded-lg text-left text-sm mb-6 overflow-x-auto">
                        <p className="text-gray-500 border-b border-gray-700 pb-2 mb-2">Missing Environment Variables:</p>
                        <ul className="list-disc pl-5 space-y-1 text-red-400">
                            {missingKeys.map(key => (
                                <li key={key}>VITE_{key} (or NEXT_PUBLIC_{key})</li>
                            ))}
                        </ul>
                    </div>

                    <div className="text-sm text-gray-400">
                        <p>Please check your <code className="bg-gray-800 px-1 py-0.5 rounded">.env.local</code> file.</p>
                        <p className="mt-2 text-xs opacity-50">Master Prompt Checkpoint 1B: Safe Environment Validation</p>
                    </div>
                </div>
            </div>
        );
    }

    return <>{children}</>;
};
