
// --- SOBEK PANIC ENGINE: "قول بسرعة" ---
// A game of speed, stress, and broken filters.
// Social Curve: WarmUp -> Connector -> Escalator -> Chaos -> Relief

export type PanicCategory = 'WARMUP' | 'CONNECTOR' | 'ESCALATOR' | 'CHAOS' | 'RELIEF';

export interface PanicPrompt {
    id: string;
    text: string;
    category: PanicCategory;
}

export const JUDGMENT_MESSAGES = [
    "لا لا... دي اتحسبت عليك.",
    "بطيء أوي يا كابتن.",
    "السرعة نص الموهبة... وأنت معندكش الاتنين.",
    "إيه التوتر ده؟ اهدى.",
    "كان قدامك فرصة وفاتت.",
    "مسمعناش حاجة... اللي بعده!",
    "مش عايزين مبررات، عايزين إجابات.",
    "الوقت كالسيف... قطعك خلاص.",
];

export const PANIC_PROMPTS: PanicPrompt[] = [
    // 1. WARM UP (Harmless, daily life)
    { id: 'w1', category: 'WARMUP', text: 'قول 3 حاجات موجودين في تلاجتك دلوقتي' },
    { id: 'w2', category: 'WARMUP', text: 'قول 3 أماكن بتروحهم لما تكون مخنوق' },
    { id: 'w3', category: 'WARMUP', text: 'قول 3 أكلات بتعرف تطبخهم (أو تطلبهم)' },
    { id: 'w4', category: 'WARMUP', text: 'قول 3 تطبيقات بتفتحهم أول ما تصحى' },
    { id: 'w5', category: 'WARMUP', text: 'قول 3 حاجات بتنساها وأنت نازل من البيت' },
    { id: 'w6', category: 'WARMUP', text: 'قول 3 مسلسلات مصرية قديمة حافظهم' },

    // 2. CONNECTOR (Shared Suffering/Work)
    { id: 'c1', category: 'CONNECTOR', text: 'قول 3 كدبات بتقولهم لما تتأخر عن الشغل / ميعاد' },
    { id: 'c2', category: 'CONNECTOR', text: 'قول 3 جمل بتقولهم لما تكون عايز تقفل المكالمة' },
    { id: 'c3', category: 'CONNECTOR', text: 'قول 3 حاجات بتضيع فيها فلوسك وتندم' },
    { id: 'c4', category: 'CONNECTOR', text: 'قول 3 أعذار عشان تزوغ من خروجة' },
    { id: 'c5', category: 'CONNECTOR', text: 'قول 3 جمل سواقين ميكروباص مشهورين' },
    { id: 'c6', category: 'CONNECTOR', text: 'قول 3 أنواع ناس بتشوفهم في الجيم/النادي' },

    // 3. ESCALATOR (Awkward Truths)
    { id: 'e1', category: 'ESCALATOR', text: 'قول 3 حاجات بتعملهم في السر ومحدش يعرف' },
    { id: 'e2', category: 'ESCALATOR', text: 'قول 3 صفات بتكرههم في المدير بتاعك' },
    { id: 'e3', category: 'ESCALATOR', text: 'قول 3 عيوب في شخصيتك بتضايق الناس منك' },
    { id: 'e4', category: 'ESCALATOR', text: 'قول 3 أسباب تخليك تعمل بلوك لحد فوراً' },
    { id: 'e5', category: 'ESCALATOR', text: 'قول 3 حاجات بتدور عليهم في شريك حياتك (خارجياً)' },
    { id: 'e6', category: 'ESCALATOR', text: 'قول 3 مواقف محرجة حصلتلك في فرح/عزاء' },

    // 4. CHAOS (Exposure & Funny)
    { id: 'x1', category: 'CHAOS', text: 'قول 3 شتائم (محترمة) بتقولها وأنت سايق' },
    { id: 'x2', category: 'CHAOS', text: 'قول 3 أسماء ناس بتعمل نفسك مش شايفهم لما تقابلهم' },
    { id: 'x3', category: 'CHAOS', text: 'قول 3 حاجات دورت عليهم على جوجل وعملت مسح للسجل بعدها' },
    { id: 'x4', category: 'CHAOS', text: 'قول 3 جرايم هتعملهم لو مفيش قانون لمدة ساعة' },
    { id: 'x5', category: 'CHAOS', text: 'قول 3 حاجات بتسرقهم من أوتيلات/مطاعم (شامبوهات، مناديل..)' },
    { id: 'x6', category: 'CHAOS', text: 'قول 3 أغاني هابطة حافظهم صم' },

    // 5. RELIEF (Laugh it off)
    { id: 'r1', category: 'RELIEF', text: 'قول 3 نكت بايخة بس بتضحكك' },
    { id: 'r2', category: 'RELIEF', text: 'قول 3 حاجات بتفرحك زي الأطفال' },
    { id: 'r3', category: 'RELIEF', text: 'قول 3 أكلات بتضربهم لما تكون مكتئب' },
    { id: 'r4', category: 'RELIEF', text: 'قول 3 أشخاص مشهورين نفسك تقعد معاهم ع القهوة' },
    { id: 'r5', category: 'RELIEF', text: 'قول 3 مميزات في الشخص اللي قاعد جنبك يمين' },
];

// Helper to get random judgement
export const getJudgment = () => JUDGMENT_MESSAGES[Math.floor(Math.random() * JUDGMENT_MESSAGES.length)];

// Helper to get curved prompts
export const getPanicPrompt = (round: number): PanicPrompt => {
    let cat: PanicCategory = 'WARMUP';
    if (round <= 2) cat = 'WARMUP';
    else if (round <= 5) cat = 'CONNECTOR';
    else if (round <= 8) cat = 'ESCALATOR';
    else if (round <= 11) cat = 'CHAOS';
    else cat = 'RELIEF';

    const pool = PANIC_PROMPTS.filter(p => p.category === cat);
    return pool[Math.floor(Math.random() * pool.length)];
};
