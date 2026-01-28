
// --- SOBEK SOUL ENGINE: "سؤال ملوش هزار" ---
// A game of silence, listening, and vulnerability.
// Emotional Curve: Entry -> Mirror -> Exposure -> Edge -> Hug

export type SoulCategory = 'ENTRY' | 'MIRROR' | 'EXPOSURE' | 'EDGE' | 'HUG';

export interface SoulPrompt {
    id: string;
    text: string;
    category: SoulCategory;
}

export const SOUL_PROMPTS: SoulPrompt[] = [
    // 1. ENTRY (Safe reflection, warming up the heart)
    { id: 'en1', category: 'ENTRY', text: 'إيه أكتر مكان في الدنيا بتحس فيه إنك مرتاح بجد؟' },
    { id: 'en2', category: 'ENTRY', text: 'مين أكتر شخص وحشك وجوده في حياتك دلوقتي؟' },
    { id: 'en3', category: 'ENTRY', text: 'إيه الحاجة البسيطة اللي ممكن تغير مودك كله للأحسن؟' },
    { id: 'en4', category: 'ENTRY', text: 'لو حياتك كانت فيلم، تفتكر إحنا في أنهي مشهد دلوقتي؟' },
    { id: 'en5', category: 'ENTRY', text: 'إيه أكتر صفة بتحبها في شخصيتك ومش عايزها تتغير؟' },

    // 2. MIRROR (Self-awareness, how I see myself)
    { id: 'm1', category: 'MIRROR', text: 'شايف نفسك اتغيرت إزاي عن السنة اللي فاتت؟' },
    { id: 'm2', category: 'MIRROR', text: 'إيه العيب اللي فيك وبتحاول بقالك كتير تصلحه؟' },
    { id: 'm3', category: 'MIRROR', text: 'إيه الكدبة اللي بتكدبها على نفسك ساعات عشان ترتاح؟' },
    { id: 'm4', category: 'MIRROR', text: 'إيه الحاجة اللي الناس فاهماها غلط عنك ونفسك تصححها؟' },
    { id: 'm5', category: 'MIRROR', text: 'إمتى حسيت إنك نضجت "فجأة"؟' },

    // 3. EXPOSURE (Vulnerability, showing weaknesses)
    { id: 'x1', category: 'EXPOSURE', text: 'إيه الحاجة اللي بتبان فيها قوي من برا بس هي بتداري ضعف من جوا؟' },
    { id: 'x2', category: 'EXPOSURE', text: 'إيه أكتر مرة كنت محتاج حد جنبك ومحدش خد باله؟' },
    { id: 'x3', category: 'EXPOSURE', text: 'إيه الشعور اللي بتهرب منه بقالك فترة؟' },
    { id: 'x4', category: 'EXPOSURE', text: 'إيه الحاجة اللي محتاج تطلب فيها مساعدة بس مكسوف؟' },
    { id: 'x5', category: 'EXPOSURE', text: 'إمتى حسيت إنك "مش كفاية"؟' },

    // 4. EDGE (Fear, regret, tough truths)
    { id: 'ed1', category: 'EDGE', text: 'إيه أكتر حاجة خايف تخسرها ومش بتقول لحد؟' },
    { id: 'ed2', category: 'EDGE', text: 'إيه القرار اللي خدته ولسه مش مسامح نفسك عليه؟' },
    { id: 'ed3', category: 'EDGE', text: 'لو هتعيش نفس حياتك تاني، إيه الحاجة اللي مستحيل تكررها؟' },
    { id: 'ed4', category: 'EDGE', text: 'مين الشخص اللي جيت عليه عشان ترضي نفسك؟' },
    { id: 'ed5', category: 'EDGE', text: 'ناقصك إيه بجد عشان تكون راضي عن حياتك؟' },

    // 5. HUG (Closure, reassurance, love)
    { id: 'h1', category: 'HUG', text: 'مين الشخص اللي وجوده فارق في حياتك أكتر ما هو يتخيل؟' },
    { id: 'h2', category: 'HUG', text: 'لو هتشكر نفسك على حاجة، هتشكرها على إيه؟' },
    { id: 'h3', category: 'HUG', text: 'إيه الدرس القاسي اللي اتعلمته بس خلاك شخص أحسن؟' },
    { id: 'h4', category: 'HUG', text: 'قول لنفسك كلمة حلوة محتاج تسمعها.' },
    { id: 'h5', category: 'HUG', text: 'إيه أكتر ذكرى دافية بتطمنك لما تفتكرها؟' },
];

export const getSoulPrompt = (round: number): SoulPrompt => {
    let cat: SoulCategory = 'ENTRY';

    // Slow curve logic for deep play
    if (round <= 2) cat = 'ENTRY';
    else if (round <= 4) cat = 'MIRROR';
    else if (round <= 7) cat = 'EXPOSURE';
    else if (round <= 9) cat = 'EDGE';
    else cat = 'HUG';

    const pool = SOUL_PROMPTS.filter(p => p.category === cat);
    return pool[Math.floor(Math.random() * pool.length)];
};
