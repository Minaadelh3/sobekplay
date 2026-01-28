
// --- SOBEK FORBIDDEN ENGINE: "ممنوعات" ---
// A game of shadow dynamics and high-risk truth.
// Curve: Boundary -> Loyalty -> Resentment -> Power -> Exit

export type ForbiddenCategory = 'BOUNDARY' | 'LOYALTY' | 'RESENTMENT' | 'POWER' | 'EXIT';

export interface ForbiddenPrompt {
    id: string;
    text: string;
    category: ForbiddenCategory;
    intensity: 'High' | 'Critical' | 'Extreme';
}

export const FORBIDDEN_PROMPTS: ForbiddenPrompt[] = [
    // 1. BOUNDARY PUSHERS (Testing comfort)
    { id: 'b1', category: 'BOUNDARY', intensity: 'High', text: 'مين في القعدة دي حاسس إنه "مش شبهنا"؟' },
    { id: 'b2', category: 'BOUNDARY', intensity: 'High', text: 'مين الشخص اللي وجوده بيخليك تمسك لسانك وتوزن كلامك؟' },
    { id: 'b3', category: 'BOUNDARY', intensity: 'High', text: 'مين فينا بيحاول يبان "مثالي" زيادة عن اللزوم؟' },
    { id: 'b4', category: 'BOUNDARY', intensity: 'High', text: 'مين فينا واخد مساحة (وقت أو كلام) أكتر من حقه؟' },
    { id: 'b5', category: 'BOUNDARY', intensity: 'High', text: 'مين الشخص اللي بتحس إنه بيحكم عليك من غير ما يتكلم؟' },

    // 2. LOYALTY TESTS (Trust dynamics)
    { id: 'l1', category: 'LOYALTY', intensity: 'Critical', text: 'مين فينا لو جاله عرض (شغل أو سفر) هيسيبنا وينسى اللي بينا؟' },
    { id: 'l2', category: 'LOYALTY', intensity: 'Critical', text: 'مين الشخص اللي لو وقعت في مشكلة كبيرة.. مش هتفكر تلجأله؟' },
    { id: 'l3', category: 'LOYALTY', intensity: 'Critical', text: 'مين فينا بيعرف مصلحته الأول قبل مصلحة الصحاب؟' },
    { id: 'l4', category: 'LOYALTY', intensity: 'Critical', text: 'مين فينا كلامه غير أفعاله في وقت الجد؟' },
    { id: 'l5', category: 'LOYALTY', intensity: 'Critical', text: 'مين فينا سرك مش في بير معاه؟' },

    // 3. HIDDEN RESENTMENTS (Unspoken grudges)
    { id: 'r1', category: 'RESENTMENT', intensity: 'Extreme', text: 'إيه الحاجة اللي عملها حد قاعد هنا وأنت لسه شايلها جواك؟' },
    { id: 'r2', category: 'RESENTMENT', intensity: 'Extreme', text: 'مين الشخص اللي اتغير معاك للأسوأ وأنت مش فاهم ليه؟' },
    { id: 'r3', category: 'RESENTMENT', intensity: 'Extreme', text: 'مين فينا دايماً بيقلل من إنجازاتك أو هزارك؟' },
    { id: 'r4', category: 'RESENTMENT', intensity: 'Extreme', text: 'مين هنا بتحس إنه بينافسك في الخفاء؟' },
    { id: 'r5', category: 'RESENTMENT', intensity: 'Extreme', text: 'مين الشخص اللي كنت بتثق فيه زمان ودلوقتي.. لأ؟' },

    // 4. POWER DYNAMICS (Control & Influence)
    { id: 'p1', category: 'POWER', intensity: 'Critical', text: 'مين فينا رأيه بيمشي غصب عن الكل؟' },
    { id: 'p2', category: 'POWER', intensity: 'Critical', text: 'مين الشخص اللي بيعرف يتلاعبي بمشاعر اللي حواليه؟' },
    { id: 'p3', category: 'POWER', intensity: 'Critical', text: 'مين فينا "الليدر" اللي محدش اختاره؟' },
    { id: 'p4', category: 'POWER', intensity: 'Critical', text: 'مين الشخص اللي دايماً بيطلع نفسه ضحية؟' },
    { id: 'p5', category: 'POWER', intensity: 'Critical', text: 'مين فينا بيستخدم "الزعل" سلاح عشان ياخد اللي عايزه؟' },

    // 5. EXIT CARDS (De-escalation)
    { id: 'ex1', category: 'EXIT', intensity: 'High', text: 'لو هنصفي قلوبنا دلوقتي.. مين محتاج يقول "حقك عليا" لمين؟' },
    { id: 'ex2', category: 'EXIT', intensity: 'High', text: 'مين الشخص اللي مهما حصل هيفضل وجوده أساسي؟' },
    { id: 'ex3', category: 'EXIT', intensity: 'High', text: 'إيه الحاجة اللي بتخلي القعدة دي "أمان" رغم كل حاجة؟' },
];

export const getForbiddenPrompt = (round: number): ForbiddenPrompt | null => {
    // Hard cap at 5 rounds for safety
    if (round > 5) return null;

    let pool: ForbiddenPrompt[] = [];

    if (round === 1) pool = FORBIDDEN_PROMPTS.filter(p => p.category === 'BOUNDARY');
    else if (round === 2) pool = FORBIDDEN_PROMPTS.filter(p => p.category === 'LOYALTY');
    else if (round === 3) pool = FORBIDDEN_PROMPTS.filter(p => p.category === 'RESENTMENT');
    else if (round === 4) pool = FORBIDDEN_PROMPTS.filter(p => p.category === 'POWER');
    else pool = FORBIDDEN_PROMPTS.filter(p => p.category === 'EXIT');

    return pool[Math.floor(Math.random() * pool.length)];
};
