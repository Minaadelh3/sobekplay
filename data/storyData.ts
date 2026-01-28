
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
    "قاعدين في القهوة عادي، فجأة دخل واحد غريب وقال...",
    "صحيت من النوم لقيت موبايلي مش في مكانه، ومكانه ورقة مكتوب فيها...",
    "يوم الفرح، العريس اختفى قبل الزفة بـ ٥ دقايق عشان...",
    "وإحنا في الطريق للساحل، العربية عطلت في حتة مقطوعة و...",
    "قررت أعمل دايت، بس أول ما فتحت التلاجة لقيت...",
    "دخلت الامتحان مش مذاكر غير كلمة واحدة، والمراقب بصلي وقال...",
    "كنت بتمشى ع البحر بالليل، لقيت إزازة رسائل فيها...",
];

export const CATEGORIZED_PROMPTS: Record<PromptCategory, StoryPrompt[]> = {
    WARMUP: [
        { id: 'w1', category: 'WARMUP', mood: 'تسخين', text: 'كمّل وكأن البطل بيحاول يبرر موقف محرج حصله' },
        { id: 'w2', category: 'WARMUP', mood: 'تسخين', text: 'كمّل واوصف الجو العام من غير ما تقول ولا اسم' },
        { id: 'w3', category: 'WARMUP', mood: 'تسخين', text: 'كمّل وكأن البطل لسه واكل أكلة تقيلة ومش قادر يتكلم' },
        { id: 'w4', category: 'WARMUP', mood: 'تسخين', text: 'كمّل وخلي البطل يلاحظ تفصيلة صغيرة محدش خد باله منها' },
        { id: 'w5', category: 'WARMUP', mood: 'تسخين', text: 'كمّل بجملة تبين إن البطل مستعجل على حاجة' },
        { id: 'w6', category: 'WARMUP', mood: 'تسخين', text: 'كمّل وكأن البطل بيحاول يفتكر اسم حد ومش عارف' },
    ],
    CONNECTOR: [
        { id: 'c1', category: 'CONNECTOR', mood: 'تواصل', text: 'كمّل وخلي حوار يدور بين شخصين فجأة' },
        { id: 'c2', category: 'CONNECTOR', mood: 'تواصل', text: 'كمّل واكشف إن الشخصيتين دول يعرفوا بعض من زمان' },
        { id: 'c3', category: 'CONNECTOR', mood: 'تواصل', text: 'كمّل وكأن في سر مشترك بينهم محدش يعرفه' },
        { id: 'c4', category: 'CONNECTOR', mood: 'تواصل', text: 'كمّل وخلي حد فيهم يفكر التاني بموقف قديم' },
        { id: 'c5', category: 'CONNECTOR', mood: 'تواصل', text: 'كمّل وكأنهم بيتكلموا بلغة هم بس اللي فاهمينها' },
        { id: 'c6', category: 'CONNECTOR', mood: 'تواصل', text: 'كمّل وخلي واحد فيهم يطلب طلب غريب من التاني' },
    ],
    ESCALATOR: [
        { id: 'e1', category: 'ESCALATOR', mood: 'توليعة', text: 'كمّل وكأن في مصيبة حصلت فجأة' },
        { id: 'e2', category: 'ESCALATOR', mood: 'توليعة', text: 'كمّل وخلي الجملة دي تستفز حد موجود معانا في القصة' },
        { id: 'e3', category: 'ESCALATOR', mood: 'توليعة', text: 'كمّل وكأن الشرطة (أو حد مهم) طب فجأة في المكان' },
        { id: 'e4', category: 'ESCALATOR', mood: 'توليعة', text: 'كمّل واكشف كدبة كبيرة كان حد عايش فيها' },
        { id: 'e5', category: 'ESCALATOR', mood: 'توليعة', text: 'كمّل وخلي البطل يكتشف إنه اتسرق' },
        { id: 'e6', category: 'ESCALATOR', mood: 'توليعة', text: 'كمّل ودخل شخصية شريرة أو مكروهة في الأحداث' },
        { id: 'e7', category: 'ESCALATOR', mood: 'توليعة', text: 'كمّل وخلي البطل يفقد أعصابه ويقول كلام يندم عليه' },
    ],
    CHAOS: [
        { id: 'x1', category: 'CHAOS', mood: 'فوضى', text: 'كمّل واقلب القصة لفيلم رعب فجأة' },
        { id: 'x2', category: 'CHAOS', mood: 'فوضى', text: 'كمّل وخلي حيوان (أو جماد) يبدأ يتكلم' },
        { id: 'x3', category: 'CHAOS', mood: 'فوضى', text: 'كمّل وغير انتباهنا لحاجة تافهة جداً وسط المصيبة' },
        { id: 'x4', category: 'CHAOS', mood: 'فوضى', text: 'كمّل وكأن النور قطع والناس بدأت تصرخ' },
        { id: 'x5', category: 'CHAOS', mood: 'فوضى', text: 'كمّل ودخل شخصية مشهورة (حقيقية) في الموضوع' },
        { id: 'x6', category: 'CHAOS', mood: 'فوضى', text: 'كمّل وخلي البطل يكتشف إنه كان فاهم كل حاجة غلط' },
    ],
    HUG: [
        { id: 'h1', category: 'HUG', mood: 'لم الشمل', text: 'كمّل وانهي الموضوع بضحكة جماعية' },
        { id: 'h2', category: 'HUG', mood: 'لم الشمل', text: 'كمّل واقفل القصة بحكمة سواقين ميكروباص' },
        { id: 'h3', category: 'HUG', mood: 'لم الشمل', text: 'كمّل وكأنهم اكتشفوا إن الموضوع أبسط مما تخيلوا' },
        { id: 'h4', category: 'HUG', mood: 'لم الشمل', text: 'كمّل وخلي النهاية مفتوحة تشغل الخيال' },
        { id: 'h5', category: 'HUG', mood: 'لم الشمل', text: 'كمّل بجملة تخلي القارئ يقول "ياااه" ويرتاح' },
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
