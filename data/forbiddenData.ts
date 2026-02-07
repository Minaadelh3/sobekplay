
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
    { id: 'b1', category: 'BOUNDARY', intensity: 'High', text: 'مين في القعدة دي تحسه "مش سالك" بس بيمثل الطيبة؟' },
    { id: 'b2', category: 'BOUNDARY', intensity: 'High', text: 'مين الشخص اللي وجوده بيخليك تمسك لسانك وتوزن كلامك؟' },
    { id: 'b3', category: 'BOUNDARY', intensity: 'High', text: 'مين فينا بيحاول يبان "ابن ناس" زيادة عن اللزوم؟' },
    { id: 'b4', category: 'BOUNDARY', intensity: 'High', text: 'مين فينا واخد مقلب في نفسه؟' },
    { id: 'b5', category: 'BOUNDARY', intensity: 'High', text: 'مين الشخص اللي بتحس إنه بيحكم على لبسك وشكلك من غير ما يتكلم؟' },

    // 2. LOYALTY TESTS (Trust dynamics)
    { id: 'l1', category: 'LOYALTY', intensity: 'Critical', text: 'مين فينا لو جاله عقد عمل في الخليج هيسيبنا ومش هيبص وراه؟' },
    { id: 'l2', category: 'LOYALTY', intensity: 'Critical', text: 'مين الشخص اللي لو وقعت في مصيبة.. آخر واحد هتفكر ترن عليه؟' },
    { id: 'l3', category: 'LOYALTY', intensity: 'Critical', text: 'مين فينا بتاع مصلحته؟' },
    { id: 'l4', category: 'LOYALTY', intensity: 'Critical', text: 'مين فينا كلامه "دبش" بس قلبه أبيض؟ (ومين العكس؟)' },
    { id: 'l5', category: 'LOYALTY', intensity: 'Critical', text: 'مين فينا سرك في بير مخروم معاه؟' },

    // 3. HIDDEN RESENTMENTS (Unspoken grudges)
    { id: 'r1', category: 'RESENTMENT', intensity: 'Extreme', text: 'إيه الموقف اللي حصل من حد قاعد هنا وأنت لسه شايله في قلبك؟' },
    { id: 'r2', category: 'RESENTMENT', intensity: 'Extreme', text: 'مين الشخص اللي اتغير معاك للأسوأ بعد ما ارتبط/اشتغل؟' },
    { id: 'r3', category: 'RESENTMENT', intensity: 'Extreme', text: 'مين فينا دايماً بيقلل من إنجازاتك وبيحسسك إنها "عادية"؟' },
    { id: 'r4', category: 'RESENTMENT', intensity: 'Extreme', text: 'مين هنا بتحس إنه بينافسك في الخفاء ونفسه ياخد مكانك؟' },
    { id: 'r5', category: 'RESENTMENT', intensity: 'Extreme', text: 'مين الشخص اللي كنت بتثق فيه زمان ودلوقتي.. بقى غريب عنك؟' },

    // 4. POWER DYNAMICS (Control & Influence)
    { id: 'p1', category: 'POWER', intensity: 'Critical', text: 'مين فينا رأيه بيمشي غصب عن الكل عشان بنخاف من زعله؟' },
    { id: 'p2', category: 'POWER', intensity: 'Critical', text: 'مين الشخص اللي بيعرف يقلب الترابيزة ويطلع نفسه مجني عليه؟' },
    { id: 'p3', category: 'POWER', intensity: 'Critical', text: 'مين فينا "الليدر" اللي محدش اختاره بس هو فارض سيطرته؟' },
    { id: 'p4', category: 'POWER', intensity: 'Critical', text: 'مين الشخص اللي عايش في دور الضحية طول الوقت؟' },
    { id: 'p5', category: 'POWER', intensity: 'Critical', text: 'مين فينا بيستخدم فلوسه أو عربيته عشان يسيطر على الشلة؟' },

    // 5. EXIT CARDS (De-escalation)
    { id: 'ex1', category: 'EXIT', intensity: 'High', text: 'لو القعدة دي آخر قعدة لينا.. مين محتاج يصفي نيته ناحية مين؟' },
    { id: 'ex2', category: 'EXIT', intensity: 'High', text: 'مين الشخص اللي وجوده هو اللي مجمعنا، ومن غيره الشلة تفركش؟' },
    { id: 'ex3', category: 'EXIT', intensity: 'High', text: 'إيه الصفة الحلوة اللي في أوحش واحد فينا؟' },
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
