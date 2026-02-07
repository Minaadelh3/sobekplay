
export interface AgpeyaSection {
    id: string;
    title: string;
    type: 'fixed' | 'psalm' | 'gospel' | 'litany' | 'absolution' | 'other';
    content: string;
}

export const parseAgpeyaContent = (fullText: string): AgpeyaSection[] => {
    if (!fullText) return [];

    const lines = fullText.split('\n');
    const sections: AgpeyaSection[] = [];

    let currentTitle = "المقدمة";
    let currentType: AgpeyaSection['type'] = 'fixed';
    let currentContent: string[] = [];

    // Helper to push current section and reset
    const pushSection = () => {
        if (currentContent.length > 0) {
            // Cleanup content
            const text = currentContent.join('\n').trim();
            if (text.length > 0) {
                sections.push({
                    id: `section-${sections.length}`,
                    title: currentTitle,
                    type: currentType,
                    content: text
                });
            }
        }
        currentContent = [];
    };

    // Regex/Keywords for detection
    const patterns = [
        { key: "المزمور", type: 'psalm' as const },
        { key: "الإنجيل", type: 'gospel' as const },
        { key: "فصل من", type: 'gospel' as const }, // Sometimes "Fasl men..."
        { key: "القطع", type: 'litany' as const },
        { key: "التحليل", type: 'absolution' as const },
        { key: "تسبحة الملائكة", type: 'fixed' as const },
        { key: "الثلاث تقديسات", type: 'fixed' as const },
        { key: "مقدمة كل ساعة", type: 'fixed' as const },
        { key: "بدء صلاة", type: 'fixed' as const },
    ];

    for (let i = 0; i < lines.length; i++) {
        const line = lines[i].trim();
        if (!line) {
            if (currentContent.length > 0) currentContent.push(line); // Keep paragraph breaks
            continue;
        }

        // Check if line is a header
        // Heuristic: Short line, contains keyword, or matches known headers
        // Also checks if it DOESN'T end with typical punctuation if it's long, but titles are usually short.

        let foundMatch = false;

        // Specific Logic for "Mzamir" logic which usually have numbered list or just "Al Mazmoor..."
        // We look for lines that are clearly titles.
        if (line.length < 50) {
            for (const pattern of patterns) {
                if (line.includes(pattern.key)) {
                    pushSection();
                    currentTitle = line;
                    currentType = pattern.type;
                    foundMatch = true;
                    break;
                }
            }
        }

        if (!foundMatch) {
            currentContent.push(lines[i]); // Push original line with whitespace
        }
    }

    pushSection(); // Push last section

    return sections;
};
