
// --- SOBEK STORY ENGINE: "كمّلها وإنت ساكت" ---
// Social Engineering Curve: WarmUp -> Connector -> Escalator -> Chaos -> Hug

export type PromptCategory = 'WARMUP' | 'CONNECTOR' | 'ESCALATOR' | 'CHAOS' | 'HUG';

export interface StoryPrompt {
    id: string;
    text: string;
    category: PromptCategory;
    mood: string; // Display text for the UI (e.g., "تسخين", "توليعة")
}

export const STORY_STARTERS = [
    "قاعدين في القهوة بنشيش، فجأة دخل واحد لابس بدلة فضاء وقال...",
    "يوم الفرح، العريس ساب الكوشة ومسك المايك وقال قصيدة عن...",
    "وإحنا راجعين من الساحل، العربية عطلت في الصحراوي وطلع لنا...",
    "قررت أعمل دايت، بس أول ما فتحت التلاجة لقيت حلة محشي بتكلمني وبتقول...",
    "دخلت اللجنة مش مذاكر، والمراقب غششني بس بشرط غريب وهو...",
    "ركبت ميكروباص، والسواق قرر يغير خط السير ويودينا كلنا على...",
    "لقيت موبايلي بيبعت رسائل لوحده للناس، وأول رسالة كانت لمديري بتقول...",
];

export const CATEGORIZED_PROMPTS: Record<PromptCategory, StoryPrompt[]> = {
    WARMUP: [
        { id: 'w1', category: 'WARMUP', mood: 'تسخين', text: 'كمّل وكأن البطل بيحاول يبرر موقفه بـ "معلش أصل أنا عندي ظروف"' },
        { id: 'w2', category: 'WARMUP', mood: 'تسخين', text: 'كمّل واوصف ريحة المكان (كشري، بحر، أو دخان)' },
        { id: 'w3', category: 'WARMUP', mood: 'تسخين', text: 'كمّل وكأن البطل لسه ضارب طبق كبده ومش قادر يتنفس' },
        { id: 'w4', category: 'WARMUP', mood: 'تسخين', text: 'كمّل وخلي البطل يلاحظ إن محفظته اتنشلت' },
        { id: 'w5', category: 'WARMUP', mood: 'تسخين', text: 'كمّل بجملة تبين إن البطل مستعجل عشان يلحق الماتش' },
        { id: 'w6', category: 'WARMUP', mood: 'تسخين', text: 'كمّل وكأن البطل بيحاول يفتكر مين الشخص اللي بيسلم عليه بحرارة ده' },
    ],
    CONNECTOR: [
        { id: 'c1', category: 'CONNECTOR', mood: 'شبك الخيوط', text: 'كمّل وخلي سواق الميكروباص يتدخل في الحوار بحكمة وجودية' },
        { id: 'c2', category: 'CONNECTOR', mood: 'شبك الخيوط', text: 'كمّل واكشف إن الشخصيتين دول كانوا مع بعض في ابتدائي' },
        { id: 'c3', category: 'CONNECTOR', mood: 'شبك الخيوط', text: 'كمّل وكأن في "جمعية" لسه مخلصتش بينهم' },
        { id: 'c4', category: 'CONNECTOR', mood: 'شبك الخيوط', text: 'كمّل وخلي حد فيهم يفكر التاني بخناقة قديمة على حساب القهوة' },
        { id: 'c5', category: 'CONNECTOR', mood: 'شبك الخيوط', text: 'كمّل وكأنهم بيتكلموا "إيجيبشن إنجليش" عشان محدش يفهمهم' },
        { id: 'c6', category: 'CONNECTOR', mood: 'شبك الخيوط', text: 'كمّل وخلي واحد فيهم يطلب "سلف" من التاني بشكل غير مباشر' },
    ],
    ESCALATOR: [
        { id: 'e1', category: 'ESCALATOR', mood: 'ولعت', text: 'كمّل وكأن حمات البطل طبت عليهم فجأة' },
        { id: 'e2', category: 'ESCALATOR', mood: 'ولعت', text: 'كمّل وخلي الجملة دي تلقيح كلام على حد قاعد معانا' },
        { id: 'e3', category: 'ESCALATOR', mood: 'ولعت', text: 'كمّل وكأن الحكومة (الشرطة) وصلت المكان' },
        { id: 'e4', category: 'ESCALATOR', mood: 'ولعت', text: 'كمّل واكشف إن البطل متجوز عرفي ومخبي' },
        { id: 'e5', category: 'ESCALATOR', mood: 'ولعت', text: 'كمّل وخلي البطل يكتشف إن العربية اتكلبشت' },
        { id: 'e6', category: 'ESCALATOR', mood: 'ولعت', text: 'كمّل ودخل شخصية "البلطجي" في الأحداث' },
        { id: 'e7', category: 'ESCALATOR', mood: 'ولعت', text: 'كمّل وخلي البطل يحلف بالطلاق إنه ما عمل كدة' },
    ],
    CHAOS: [
        { id: 'x1', category: 'CHAOS', mood: 'فوضى', text: 'كمّل واقلب القصة لفيلم "إبراهيم الأبيض" فجأة' },
        { id: 'x2', category: 'CHAOS', mood: 'فوضى', text: 'كمّل وخلي قطة الشارع تبدأ تتكلم وتنصحهم' },
        { id: 'x3', category: 'CHAOS', mood: 'فوضى', text: 'كمّل وغير انتباهنا لواحد بيبيع مناديل في الخلفية' },
        { id: 'x4', category: 'CHAOS', mood: 'فوضى', text: 'كمّل وكأن النور قطع والفرح اتقلب خناقة كراسي' },
        { id: 'x5', category: 'CHAOS', mood: 'فوضى', text: 'كمّل ودخل "محمد رمضان" في الموضوع' },
        { id: 'x6', category: 'CHAOS', mood: 'فوضى', text: 'كمّل وخلي البطل يكتشف إنه كان بيحلم وهو نايم في المواصلات' },
    ],
    HUG: [
        { id: 'h1', category: 'HUG', mood: 'لم الدور', text: 'كمّل وانهي الموضوع بإنهم طنبوا كشري' },
        { id: 'h2', category: 'HUG', mood: 'لم الدور', text: 'كمّل واقفل القصة بمهرجان شعبي اشتغل فجأة' },
        { id: 'h3', category: 'HUG', mood: 'لم الدور', text: 'كمّل وكأنهم اكتشفوا إنها كانت كاميرا خفية' },
        { id: 'h4', category: 'HUG', mood: 'لم الدور', text: 'كمّل وخلي النهاية مفتوحة زي أفلام يوسف شاهين' },
        { id: 'h5', category: 'HUG', mood: 'لم الدور', text: 'كمّل بجملة "واللي يعوزه البيت.. يحرم ع الجامع"' },
    ]
};

// HELPER: Get prompts based on curve
export const getCurvedPrompt = (round: number, totalRounds: number): StoryPrompt => {
    // Logic: 
    // Start -> WarmUp
    // Middle -> Connector / Escalator
    // Penultimate -> Chaos
    // Last -> Hug

    let pool: StoryPrompt[] = [];

    if (round === 1) {
        pool = CATEGORIZED_PROMPTS.WARMUP;
    } else if (round === totalRounds) {
        pool = CATEGORIZED_PROMPTS.HUG;
    } else if (round === totalRounds - 1) {
        pool = Math.random() > 0.5 ? CATEGORIZED_PROMPTS.CHAOS : CATEGORIZED_PROMPTS.ESCALATOR;
    } else {
        // Mid game
        if (round < totalRounds / 2) {
            pool = CATEGORIZED_PROMPTS.CONNECTOR;
        } else {
            pool = CATEGORIZED_PROMPTS.ESCALATOR;
        }
    }

    // Fallback
    if (!pool || pool.length === 0) pool = CATEGORIZED_PROMPTS.WARMUP;

    return pool[Math.floor(Math.random() * pool.length)];
};
