import React, { useState } from 'react';
import { Section, SettingsInput } from './SettingsComponents';

interface SecuritySectionProps {
    email: string;
    onResetPassword: () => Promise<void>;
    loading?: boolean;
}

export const SecuritySection: React.FC<SecuritySectionProps> = ({
    email, onResetPassword, loading
}) => {
    return (
        <Section title="Account Security">
            <div className="mb-4">
                <SettingsInput
                    label="Email Address"
                    value={email}
                    onChange={() => { }}
                    disabled={true}
                    icon="📧"
                />
                <p className="text-[10px] text-gray-500 mt-1 pl-1">
                    Email cannot be changed instantly for security reasons.
                </p>
            </div>

            <div className="pt-2 border-t border-white/5">
                <button
                    onClick={onResetPassword}
                    disabled={loading}
                    className="text-accent-gold text-sm font-bold hover:underline disabled:opacity-50"
                >
                    {loading ? 'Sending...' : 'Send Password Reset Email'}
                </button>
            </div>
        </Section>
    );
};
