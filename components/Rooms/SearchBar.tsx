import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { searchIndexedPeople, buildIndex, SearchablePerson } from '../../data/rooms/search';


import { Assignment } from '../../data/rooms/types';

interface SearchBarProps {
    onSelect: (personName: string) => void;
    onClear: () => void;
    assignments: Assignment[];
}

export const SearchBar: React.FC<SearchBarProps> = ({ onSelect, onClear, assignments }) => {
    const [query, setQuery] = useState('');
    const [results, setResults] = useState<string[]>([]);

    // Build Index when assignments change
    const indexRef = React.useRef<SearchablePerson[]>([]);

    useEffect(() => {
        const allNames = assignments.map(a => a.personName);
        indexRef.current = buildIndex(allNames);
    }, [assignments]);

    useEffect(() => {
        if (query.length > 1) {
            setResults(searchIndexedPeople(query, indexRef.current));
        } else {
            setResults([]);
        }
    }, [query]);

    return (
        <div className="w-full max-w-lg mx-auto relative z-50">
            <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="اكتب اسمك..."
                className="w-full bg-[#1e1e20] border border-white/10 rounded-2xl px-6 py-4 text-right text-white placeholder-white/30 text-lg font-bold shadow-lg focus:outline-none focus:border-accent-gold transition-colors"
                dir="rtl"
            />

            <AnimatePresence>
                {results.length > 0 && (
                    <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 10 }}
                        className="absolute top-full left-0 right-0 mt-2 bg-[#1e1e20] border border-white/10 rounded-2xl overflow-hidden shadow-2xl max-h-60 overflow-y-auto no-scrollbar"
                    >
                        {results.map((name, idx) => (
                            <button
                                key={idx}
                                onClick={() => onSelect(name)}
                                className="w-full text-right px-6 py-3 text-white hover:bg-white/10 transition-colors font-medium border-b border-white/5 last:border-0"
                            >
                                {name}
                            </button>
                        ))}
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};
