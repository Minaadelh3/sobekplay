import React, { useState, useRef, useEffect } from 'react';

interface TableHeadFilterProps {
    label: string;
    options: { label: string, value: string }[];
    selectedValues: string[];
    onChange: (values: string[]) => void;
    onSort?: () => void;
    sortDirection?: 'asc' | 'desc' | null;
}

export default function TableHeadFilter({ label, options, selectedValues, onChange, onSort, sortDirection }: TableHeadFilterProps) {
    const [isOpen, setIsOpen] = useState(false);
    const ref = useRef<HTMLDivElement>(null);

    // Close on click outside
    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (ref.current && !ref.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const toggleValue = (val: string) => {
        if (selectedValues.includes(val)) {
            onChange(selectedValues.filter(v => v !== val));
        } else {
            onChange([...selectedValues, val]);
        }
    };

    return (
        <div className="relative flex items-center gap-2 group cursor-pointer select-none" ref={ref}>
            <div onClick={onSort} className="flex items-center gap-1 hover:text-white transition-colors">
                <span>{label}</span>
                {sortDirection && <span className="text-accent-gold">{sortDirection === 'asc' ? '↑' : '↓'}</span>}
            </div>

            <button
                onClick={(e) => { e.stopPropagation(); setIsOpen(!isOpen); }}
                className={`p-1 rounded hover:bg-white/10 ${selectedValues.length > 0 ? 'text-accent-gold' : 'text-gray-600 group-hover:text-gray-400'}`}
            >
                FILTER ▼
            </button>

            {isOpen && (
                <div className="absolute top-full left-0 mt-2 w-48 bg-[#1A1D24] border border-white/10 rounded-xl shadow-2xl z-50 p-2 animate-in fade-in zoom-in-95">
                    <div className="max-h-60 overflow-y-auto custom-scrollbar space-y-1">
                        {options.map(opt => (
                            <label key={opt.value} className="flex items-center gap-2 p-2 hover:bg-white/5 rounded cursor-pointer text-xs text-gray-300">
                                <input
                                    type="checkbox"
                                    checked={selectedValues.includes(opt.value)}
                                    onChange={() => toggleValue(opt.value)}
                                    className="rounded border-white/10 bg-black/40 checked:bg-accent-gold"
                                />
                                {opt.label}
                            </label>
                        ))}
                    </div>
                    <div className="pt-2 mt-2 border-t border-white/5 flex text-[10px] gap-2">
                        <button onClick={() => onChange(options.map(o => o.value))} className="text-blue-400 hover:text-blue-300">Select All</button>
                        <button onClick={() => onChange([])} className="text-gray-500 hover:text-gray-300">Clear</button>
                    </div>
                </div>
            )}
        </div>
    );
}
