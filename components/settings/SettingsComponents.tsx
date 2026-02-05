import React, { ReactNode } from 'react';
import { motion } from 'framer-motion';

// --- Types ---
interface ToggleProps {
    label: string;
    description?: string;
    checked: boolean;
    onChange: (checked: boolean) => void;
    disabled?: boolean;
    icon?: string;
}

interface SectionProps {
    title: string;
    children: ReactNode;
    icon?: string;
    description?: string;
}

export function Section({ title, icon, description, children }: SectionProps) {
    return (
        <section className="bg-[#141414] border border-white/5 rounded-2xl p-6 mb-6 overflow-hidden relative">
            <div className="flex items-start gap-4 mb-6">
                {icon && <div className="text-2xl mt-1">{icon}</div>}
                <div>
                    <h2 className="text-xl font-bold text-white mb-1">{title}</h2>
                    {description && <p className="text-gray-400 text-sm">{description}</p>}
                </div>
            </div>
            <div className="space-y-6">
                {children}
            </div>
        </section>
    );
}

export function Toggle({ label, description, checked, onChange, disabled, icon }: ToggleProps) {
    return (
        <div className={`flex items-center justify-between group ${disabled ? 'opacity-50 pointer-events-none' : ''}`}>
            <div className="flex items-center gap-3">
                {icon && <span className="text-lg opacity-70 group-hover:opacity-100 transition">{icon}</span>}
                <div className="flex flex-col">
                    <span className="text-white font-medium group-hover:text-accent-gold transition-colors">{label}</span>
                    {description && <span className="text-gray-500 text-xs">{description}</span>}
                </div>
            </div>

            <button
                type="button"
                role="switch"
                aria-checked={checked}
                onClick={() => !disabled && onChange(!checked)}
                className={`relative w-12 h-7 rounded-full transition-colors duration-300 focus:outline-none focus:ring-2 focus:ring-accent-gold/50 ${checked ? 'bg-accent-gold' : 'bg-white/10'
                    }`}
            >
                <motion.div
                    className="absolute top-1 left-1 w-5 h-5 bg-white rounded-full shadow-md"
                    animate={{ x: checked ? 20 : 0 }}
                    transition={{ type: "spring", stiffness: 500, damping: 30 }}
                />
            </button>
        </div>
    );
}

export function SettingsInput({ label, value, onChange, type = "text", disabled, icon, placeholder }: any) {
    return (
        <div>
            <label className="block text-gray-400 text-sm font-bold mb-2 flex items-center gap-2">
                {icon && <span>{icon}</span>}
                {label}
            </label>
            <input
                type={type}
                value={value}
                onChange={(e) => onChange(e.target.value)}
                disabled={disabled}
                placeholder={placeholder}
                className="w-full bg-black/30 border border-white/10 rounded-xl px-4 py-3 text-white focus:border-accent-gold focus:outline-none transition focus:bg-black/50 disabled:opacity-50"
            />
        </div>
    );
}

export function DangerButton({ label, onClick, confirmationText }: { label: string, onClick: () => void, confirmationText?: string }) {
    const [confirming, setConfirming] = React.useState(false);

    if (confirming) {
        return (
            <div className="flex items-center gap-3 animate-fade-in bg-red-500/10 p-2 rounded-lg border border-red-500/20">
                <span className="text-sm text-red-200 font-bold">{confirmationText || "Are you sure?"}</span>
                <button
                    onClick={onClick}
                    className="bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded text-xs font-bold"
                >
                    Yes, Do it
                </button>
                <button
                    onClick={() => setConfirming(false)}
                    className="bg-transparent hover:bg-white/10 text-gray-300 px-3 py-1 rounded text-xs"
                >
                    Cancel
                </button>
            </div>
        );
    }

    return (
        <button
            onClick={() => setConfirming(true)}
            className="w-full text-left text-red-400 hover:text-red-300 hover:bg-red-500/10 px-4 py-3 rounded-xl transition border border-red-500/10 hover:border-red-500/30 flex items-center justify-between group"
        >
            <span className="font-bold flex items-center gap-2">
                ⚠️ {label}
            </span>
            <span className="text-red-500 opacity-0 group-hover:opacity-100 transition text-sm">
                Proceed
            </span>
        </button>
    );
}
