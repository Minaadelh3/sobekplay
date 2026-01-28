
// --- ملاهي سوبِك (SOBEK PARK) GAMES DATA ---
// A digital amusement park of conversation and reflection.
// Tone: Modern Egyptian (Masry), Smart, Fun, Premium.

export type QuestionType = 'speak' | 'act' | 'vote' | 'choose';

export interface Question {
    id: string;
    text: string;
    subtext?: string;
    type: QuestionType;
}

export interface GameLevel {
    id: string;
    title: string;
    description: string;
    questions: Question[];
    color: string; // Tailwind format e.g. 'text-yellow-400'
}

export interface Game {
    id: string;
    title: string;
    description: string;
    icon: string;
    gradient: string; // Tailwind bg-gradient
    levels: GameLevel[];
}

export const SOBEK_GAMES: Game[] = [
    // 1. LIFE & DECISIONS
    {
        id: 'crossroads',
        title: 'مفترق طرق',
        description: 'عن القرارات اللي بتشكل حياتنا.. صغيرها وكبيرها.',
        icon: '🛤️',
        gradient: 'from-slate-900 via-gray-800 to-black',
        levels: [
            {
                id: 'l1',
                title: 'Level 1: قرارات يومية',
                description: 'اختيارات بسيطة بس بتفرق.',
                color: 'text-emerald-400',
                questions: [
                    { id: 'q1', text: 'إيه العادة الصغيرة اللي غيرت شكل يومك للأحسن؟', type: 'speak' },
                    { id: 'q2', text: 'لو معاك ساعة زيادة في اليوم، هتعمل فيها إيه؟', type: 'speak' },
                    { id: 'q3', text: 'إيه الحاجة اللي بطلت تشتريها ووفرت عليك كتير؟', type: 'speak' },
                ]
            },
            {
                id: 'l2',
                title: 'Level 2: نقطة تحول',
                description: 'اللحظات الكبيرة.',
                color: 'text-teal-400',
                questions: [
                    { id: 'q4', text: 'إيه "الخطة ب" اللي طلعت أحسن من "الخطة أ" في حياتك؟', type: 'speak' },
                    { id: 'q5', text: 'قرار خدته وأنت خايف، بس طلع صح؟', type: 'speak' },
                    { id: 'q6', text: 'لو رجع بيك الزمن ٥ سنين، إيه النصيحة اللي هتقولها لنفسك؟', type: 'speak' },
                ]
            }
        ]
    },

    // 2. WORK & AMBITION
    {
        id: 'career_ladder',
        title: 'السلم الوظيفي',
        description: 'شغل، طموح، وأحلام اليقظة.',
        icon: '💼',
        gradient: 'from-blue-950 via-indigo-950 to-black',
        levels: [
            {
                id: 'l1',
                title: 'Level 1: الموظف المثالي',
                description: 'دردشة عن الشغل.',
                color: 'text-blue-400',
                questions: [
                    { id: 'w1', text: 'إيه أكتر شغلة الناس فاكرة إنها سهلة وهي تعب جداً؟', type: 'speak' },
                    { id: 'w2', text: 'لو هتعمل كارير شيفت بكرة الصبح، هتشتغل إيه؟', type: 'speak' },
                    { id: 'w3', text: 'أول مرتب خدته في حياتك عملت بيه إيه؟', type: 'speak' },
                ]
            },
            {
                id: 'l2',
                title: 'Level 2: المدير الفني',
                description: 'رؤية وأحلام.',
                color: 'text-indigo-400',
                questions: [
                    { id: 'w4', text: 'لو بقيت مدير شركتك لمدة يوم، إيه أول قرار هتاخده؟', type: 'speak' },
                    { id: 'w5', text: 'إيه المهارة اللي نفسك تتعلمها بس مكسل؟', type: 'speak' },
                    { id: 'w6', text: 'النجاح بالنسبالك: فلوس كتير ولا راحة بال؟', subtext: 'اختار واحدة بس!', type: 'choose' },
                ]
            }
        ]
    },

    // 3. RELATIONSHIPS
    {
        id: 'the_circle',
        title: 'الدايرة القريبة',
        description: 'عن الصحاب، العيلة، والناس اللي بنحبهم.',
        icon: '🤝',
        gradient: 'from-purple-950 via-fuchsia-950 to-black',
        levels: [
            {
                id: 'l1',
                title: 'Level 1: قعدة صحاب',
                description: 'ذكريات ومواقف.',
                color: 'text-purple-400',
                questions: [
                    { id: 'r1', text: 'مين الصاحب اللي وجوده بيخلي أي خروجة تحلو؟', type: 'speak' },
                    { id: 'r2', text: 'موقف جدعنة عمرك ما هتنساه من حد؟', type: 'speak' },
                    { id: 'r3', text: 'إيه أكتر صفة بتلفت نظرك في الناس الجديدة؟', type: 'speak' },
                ]
            },
            {
                id: 'l2',
                title: 'Level 2: كلام كبار',
                description: 'عمق العلاقات.',
                color: 'text-fuchsia-400',
                questions: [
                    { id: 'r4', text: 'إيه الحاجة اللي لو حصلت، تنهي أي صداقة فوراً؟', type: 'speak' },
                    { id: 'r5', text: 'مين الشخص اللي كان قريب وبعدتوا، ونفسك تكلمه تاني؟', type: 'speak' },
                    { id: 'r6', text: 'الاهتمام مبيطلبش: جملة حقيقية ولا كليشيه؟', type: 'speak' },
                ]
            }
        ]
    },

    // 4. PSYCHOLOGY
    {
        id: 'mirrors',
        title: 'مرايا',
        description: 'شوية أسئلة عنك أنت.. من غير تجميل.',
        icon: '🎭',
        gradient: 'from-rose-950 via-red-950 to-black',
        levels: [
            {
                id: 'l1',
                title: 'Level 1: الصورة الخارجية',
                description: 'الناس شيفاك ازاي.',
                color: 'text-rose-400',
                questions: [
                    { id: 'p1', text: 'إيه الانطباع الأول اللي الناس بتاخده عنك وغالباً بيطلع غلط؟', type: 'speak' },
                    { id: 'p2', text: 'مين الشخصية المشهورة اللي حاسس إنها شبهك؟', type: 'speak' },
                    { id: 'p3', text: 'لو حياتك كتاب، هتسميه إيه؟', type: 'speak' },
                ]
            },
            {
                id: 'l2',
                title: 'Level 2: الحقيقة',
                description: 'أنت شايف نفسك ازاي.',
                color: 'text-red-500',
                questions: [
                    { id: 'p4', text: 'إيه أكتر عيب فيك ونفسك تصلحه؟', type: 'speak' },
                    { id: 'p5', text: 'متى آخر مرة حسيت إنك فخور بنفسك بجد؟', type: 'speak' },
                    { id: 'p6', text: 'إيه الحاجة اللي بتخوفك في المستقبل؟', type: 'speak' },
                ]
            }
        ]
    },

    // 5. FUNNY
    {
        id: 'laughter',
        title: 'فصلان',
        description: 'مواقف محرجة وضحك للركب.',
        icon: '🤣',
        gradient: 'from-orange-900 via-yellow-900 to-black',
        levels: [
            {
                id: 'l1',
                title: 'Level 1: إحراج خفيف',
                description: 'مواقف كلنا مرينا بيها.',
                color: 'text-yellow-400',
                questions: [
                    { id: 'f1', text: 'إيه أكتر موقف محرج حصلك في مواصلات عامة؟', type: 'speak' },
                    { id: 'f2', text: 'أكلة كلتها وكانت مقلب كبير؟', type: 'speak' },
                    { id: 'f3', text: 'لبس لبسته زمان ولما بتشوف صوره بتستخبى؟', type: 'speak' },
                ]
            },
            {
                id: 'l2',
                title: 'Level 2: كوارث مضحكة',
                description: 'لما الدنيا بتمشي عكس.',
                color: 'text-orange-400',
                questions: [
                    { id: 'f4', text: 'احكي عن مرة عملت فيها ناصح ولبست في الحيط؟', type: 'speak' },
                    { id: 'f5', text: 'رسالة بعتها للشخص الغلط في الوقت الغلط؟', type: 'speak' },
                    { id: 'f6', text: 'كذبة بيضا قولتها والموضوع كبر منك؟', type: 'speak' },
                ]
            }
        ]
    },

    // 6. QUICK CHOICES
    {
        id: 'this_that',
        title: 'يمين ولا شمال',
        description: 'أبيض ولا إسود.. مفيش حياد هنا.',
        icon: '⚖️',
        gradient: 'from-gray-900 via-slate-800 to-black',
        levels: [
            {
                id: 'l1',
                title: 'Level 1: خفيف',
                description: 'اختيارات رفاهية.',
                color: 'text-cyan-400',
                questions: [
                    { id: 'c1', text: 'تاكل كل يوم كشري ولا تاكل كل يوم سوشي؟', type: 'choose' },
                    { id: 'c2', text: 'شتاء ولحاف ولا صيف وبحر؟', type: 'choose' },
                    { id: 'c3', text: 'تكون أذكى شخص في العالم ولا أغنى شخص؟', type: 'choose' },
                ]
            },
            {
                id: 'l2',
                title: 'Level 2: صعب',
                description: 'اختيارات وجودية.',
                color: 'text-cyan-600',
                questions: [
                    { id: 'c4', text: 'تعرف ميعاد وفاتك ولا تعرف طريقة وفاتك؟', type: 'choose' },
                    { id: 'c5', text: 'تعيش في الماضي وتصلح غلطاتك ولا تروح المستقبل وتشوف نتايجها؟', type: 'choose' },
                    { id: 'c6', text: 'تخسر ذاكرتك القديمة ولا متقدرش تعمل ذكريات جديدة؟', type: 'choose' },
                ]
            }
        ]
    },
    // 7. CULTURE (BONUS)
    {
        id: 'culture',
        title: 'فزلكة',
        description: 'ثقافة عامة من غير جو امتحانات.',
        icon: '💡',
        gradient: 'from-green-900 via-teal-900 to-black',
        levels: [
            {
                id: 'l1',
                title: 'Level 1: معلومات ع الماشي',
                description: 'حاجات غريبة.',
                color: 'text-green-400',
                questions: [
                    { id: 'k1', text: 'إيه المعلومة اللي عرفتها متأخر أوي واتصدمت؟', type: 'speak' },
                    { id: 'k2', text: 'لو هتعيش في عصر تاني غير ده، تختار إيه؟', type: 'speak' },
                ]
            },
            {
                id: 'l2',
                title: 'Level 2: أساطير',
                description: 'حكمة ولا هبد؟',
                color: 'text-emerald-400',
                questions: [
                    { id: 'k3', text: 'إيه النصيحة "الموروثة" اللي اكتشفت إنها بلح؟', type: 'speak' },
                    { id: 'k4', text: 'لو هتألف مثل شعبي جديد يعبر عن حالنا، هتقول إيه؟', type: 'speak' },
                ]
            }
        ]
    }
];
