
// --- SOBEK PRESSURE ENGINE: "إنتو شايفينه إزاي؟" ---
// A game of social perception, collective pointing, and roasting.
// Social Curve: WarmUp -> Roast -> Exposure -> Edge -> Repair

export type PressureCategory = 'WARMUP' | 'ROAST' | 'EXPOSURE' | 'EDGE' | 'REPAIR';

export interface PressurePrompt {
    id: string;
    text: string;
    category: PressureCategory;
    dangerLevel: 1 | 2 | 3 | 4 | 5; // Visual indicator of intensity
}

export const PRESSURE_PROMPTS: PressurePrompt[] = [
    // 1. WARM UP (Harmless habits)
    { id: 'w1', category: 'WARMUP', dangerLevel: 1, text: 'مين فينا بيحب الأكل أكتر من البشر؟' },
    { id: 'w2', category: 'WARMUP', dangerLevel: 1, text: 'مين فينا لو سافرنا معاه هيضيعنا؟' },
    { id: 'w3', category: 'WARMUP', dangerLevel: 1, text: 'مين فينا بيصرف فلوسه كلها على حاجات تافهة؟' },
    { id: 'w4', category: 'WARMUP', dangerLevel: 1, text: 'مين فينا بيعمل "Seen" ومبيردش غير بعدها بيومين؟' },
    { id: 'w5', category: 'WARMUP', dangerLevel: 1, text: 'مين فينا دمعته قريبة وممكن يعيط من إعلان؟' },
    { id: 'w6', category: 'WARMUP', dangerLevel: 1, text: 'مين فينا مدمن قهوة (أو شاي) ومبيفوقش من غيرها؟' },

    // 2. BEHAVIORAL ROAST (Noticed patterns)
    { id: 'r1', category: 'ROAST', dangerLevel: 2, text: 'مين فينا بيعمل نفسه مشغول وهو بيلعب على الموبايل؟' },
    { id: 'r2', category: 'ROAST', dangerLevel: 2, text: 'مين فينا دايمًا يقول "أنا في الطريق" وهو لسه بيلبس؟' },
    { id: 'r3', category: 'ROAST', dangerLevel: 2, text: 'مين فينا بيحب يعمل دراما من لا شيء؟' },
    { id: 'r4', category: 'ROAST', dangerLevel: 2, text: 'مين فينا بيبالغ في ردود أفعاله عشان يلفت النظر؟' },
    { id: 'r5', category: 'ROAST', dangerLevel: 2, text: 'مين فينا لو حصلت مصيبة بيرتبك ومبيعرفش يتصرف؟' },
    { id: 'r6', category: 'ROAST', dangerLevel: 2, text: 'مين فينا بيحور عشان ميمشيش المشوار؟' },

    // 3. SOCIAL EXPOSURE (Personality traits)
    { id: 'x1', category: 'EXPOSURE', dangerLevel: 3, text: 'مين فينا بيحب يتحكم في كل حاجة حتى لو مش باين؟' },
    { id: 'x2', category: 'EXPOSURE', dangerLevel: 3, text: 'مين فينا بيتهرب من المواجهة ويعمل نفسه مش واخد باله؟' },
    { id: 'x3', category: 'EXPOSURE', dangerLevel: 3, text: 'مين فينا بيركز في تفاصيل حياة الناس زيادة عن اللزوم؟' },
    { id: 'x4', category: 'EXPOSURE', dangerLevel: 3, text: 'مين فينا عنده استعداد يغير رأيه عشان يرضي اللي حواليه؟' },
    { id: 'x5', category: 'EXPOSURE', dangerLevel: 3, text: 'مين فينا غامض ومحدش عارف هو بيفكر في إيه بجد؟' },
    { id: 'x6', category: 'EXPOSURE', dangerLevel: 3, text: 'مين فينا بيخاف من الالتزام وبيهرب أول ما الموضوع يجد؟' },

    // 4. EDGE CARDS (Awkward tension)
    { id: 'e1', category: 'EDGE', dangerLevel: 4, text: 'مين فينا دايمًا يقول "أنا تمام" وهو مش تمام خالص؟' },
    { id: 'e2', category: 'EDGE', dangerLevel: 4, text: 'مين فينا لو اختفى يومين محدش هيلاحظ أوي؟' },
    { id: 'e3', category: 'EDGE', dangerLevel: 4, text: 'مين فينا ممكن يبيع صحابه عشان مصلحته (أو ساندوتش)؟' },
    { id: 'e4', category: 'EDGE', dangerLevel: 4, text: 'مين فينا فاكر نفسه أذكى واحد في القعدة؟' },
    { id: 'e5', category: 'EDGE', dangerLevel: 4, text: 'مين فينا قراراته العاطفية دايماً غلط؟' },
    { id: 'e6', category: 'EDGE', dangerLevel: 4, text: 'مين فينا بيسامح كتير بس لو قلب مابيرجعش؟' },

    // 5. REPAIR CARDS (Humor/Self-awareness)
    { id: 'h1', category: 'REPAIR', dangerLevel: 1, text: 'مين فينا مهما حصل هيفضل قلبنا عليه؟' },
    { id: 'h2', category: 'REPAIR', dangerLevel: 1, text: 'مين فينا وجوده بيطمن اللي حواليه؟' },
    { id: 'h3', category: 'REPAIR', dangerLevel: 1, text: 'مين فينا لو طلب مساعدة من حد الكل هيجري عليه؟' },
    { id: 'h4', category: 'REPAIR', dangerLevel: 1, text: 'مين فينا ضحكته بتعدي المكان كله؟' },
];


export const getPressurePrompt = (round: number): PressurePrompt => {
    let pool: PressurePrompt[] = [];

    if (round <= 2) pool = PRESSURE_PROMPTS.filter(p => p.category === 'WARMUP');
    else if (round <= 5) pool = PRESSURE_PROMPTS.filter(p => p.category === 'ROAST');
    else if (round <= 8) pool = PRESSURE_PROMPTS.filter(p => p.category === 'EXPOSURE');
    else if (round <= 10) pool = PRESSURE_PROMPTS.filter(p => p.category === 'EDGE');
    else pool = PRESSURE_PROMPTS.filter(p => p.category === 'REPAIR');

    // Fallback
    if (pool.length === 0) pool = PRESSURE_PROMPTS.filter(p => p.category === 'WARMUP');

    return pool[Math.floor(Math.random() * pool.length)];
};
