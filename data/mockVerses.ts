// data/mockVerses.ts

export interface Verse {
    id: string;
    text: string;
    reference: string;
    reflection?: string;
}

export const MOCK_VERSES: Verse[] = [
    {
        id: 'v1',
        text: 'The Lord is my shepherd; I shall not want. He maketh me to lie down in green pastures: he leadeth me beside the still waters.',
        reference: 'Psalm 23:1-2',
        reflection: 'Rest is not a reward for hard work. It is a gift given freely. In the midst of your busy day, remember that you are being led to peace, not just productivity.'
    },
    {
        id: 'v2',
        text: 'Come unto me, all ye that labour and are heavy laden, and I will give you rest.',
        reference: 'Matthew 11:28',
        reflection: 'The invitation is not to achieve more, but to release the burden. If you feel heavy today, it is not because you are weak, but because you are carrying something you were not meant to carry alone.'
    },
    {
        id: 'v3',
        text: 'Be still, and know that I am God.',
        reference: 'Psalm 46:10',
        reflection: 'Stillness is an act of trust. When we stop moving, we admit that the world can spin without our help. In that space, we find who truly holds it together.'
    },
    {
        id: 'v4',
        text: 'For I know the thoughts that I think toward you, saith the Lord, thoughts of peace, and not of evil, to give you an expected end.',
        reference: 'Jeremiah 29:11',
        reflection: 'Uncertainty inevitably breeds anxiety. But the promise here is that the architect of your story is not creating chaos, but crafting peace. Trust the Author.'
    }
];

// Simple daily rotator/hasher
export const getDailyVerse = () => {
    // For demo purposes, allow cycling or clicking hidden area to change
    // But practically, pick one based on day of year
    const dayOfYear = Math.floor((Date.now() - new Date(new Date().getFullYear(), 0, 0).getTime()) / 86400000);
    return MOCK_VERSES[dayOfYear % MOCK_VERSES.length];
};
