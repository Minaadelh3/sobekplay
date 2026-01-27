// data/curatedDecks.ts
import { Deck, GameModeId } from '../types/partyEngine';

export const MASTER_DECKS: Record<GameModeId, Deck[]> = {
    // -------------------------------------------------------------------------
    // MODE: PASS & BOOM (High Energy / Panic)
    // -------------------------------------------------------------------------
    'pass_boom': [
        {
            id: 'pb_starter',
            name: 'تسخين',
            description: 'بداية هادية للقعدة',
            baseIntensity: 2,
            cards: [
                { id: 'pb_001', text: '٣ حيوانات بحرف الف', intensity: 2, socialDanger: 1, replayFatigue: 20, tone: 'playful', mood: 'relieving', tags: ['general'], packId: 'pb_starter' },
                { id: 'pb_002', text: '٣ حاجات موجودة في شنطتك', intensity: 2, socialDanger: 1, replayFatigue: 30, tone: 'neutral', mood: 'relieving', tags: ['general'], packId: 'pb_starter' },
                { id: 'pb_003', text: '٣ أكلات مصرية مشهورة', intensity: 1, socialDanger: 1, replayFatigue: 10, tone: 'playful', mood: 'relieving', tags: ['food'], packId: 'pb_starter' },
                { id: 'pb_004', text: '٣ دول عربية غير مصر', intensity: 1, socialDanger: 1, replayFatigue: 10, tone: 'neutral', mood: 'relieving', tags: ['geo'], packId: 'pb_starter' },
                { id: 'pb_005', text: '٣ حاجات بتعملها أول ما تصحى', intensity: 2, socialDanger: 1, replayFatigue: 20, tone: 'neutral', mood: 'relieving', tags: ['personal'], packId: 'pb_starter' },
                { id: 'pb_006', text: '٣ أسماء بنات بحرف السين', intensity: 1, socialDanger: 1, replayFatigue: 10, tone: 'neutral', mood: 'relieving', tags: ['names'], packId: 'pb_starter' },
            ]
        },
        {
            id: 'pb_chaos',
            name: 'فرهدة',
            description: 'ضغط عالي وسرعة',
            baseIntensity: 7,
            cards: [
                { id: 'pb_101', text: 'قول ٥ أمثال فيها كلمة "عين"', intensity: 5, socialDanger: 2, replayFatigue: 40, tone: 'playful', mood: 'tense', tags: ['proverbs'], packId: 'pb_chaos' },
                { id: 'pb_102', text: 'قول اسم ٤ ممثلين مثلوا دور "ضابط"', intensity: 4, socialDanger: 1, replayFatigue: 30, tone: 'neutral', mood: 'tense', tags: ['movies'], packId: 'pb_chaos' },
                { id: 'pb_103', text: 'غنّي مقطع من أغنية لعمرو دياب', intensity: 6, socialDanger: 3, replayFatigue: 50, tone: 'playful', mood: 'provocative', tags: ['music', 'acting'], minTime: 15, packId: 'pb_chaos' },
                { id: 'pb_104', text: 'قول نكتة بايخة تضحكنا كلنا', intensity: 8, socialDanger: 7, replayFatigue: 80, tone: 'heavy', mood: 'tense', tags: ['social', 'performance'], minTime: 20, packId: 'pb_chaos' },
                { id: 'pb_105', text: 'اعمل صوت ٣ حيوانات وصحبك يخمنهم', intensity: 7, socialDanger: 4, replayFatigue: 60, tone: 'playful', mood: 'provocative', tags: ['acting'], minTime: 15, packId: 'pb_chaos' },
                { id: 'pb_106', text: 'قول ٣ استخدامات للشبشب غير اللبس', intensity: 5, socialDanger: 2, replayFatigue: 30, tone: 'playful', mood: 'relieving', tags: ['funny', 'logic'], packId: 'pb_chaos' },
                { id: 'pb_107', text: 'ارقص بلدي لمدة ١٠ ثواني', intensity: 9, socialDanger: 8, replayFatigue: 90, tone: 'playful', mood: 'provocative', tags: ['acting', 'physical'], minTime: 10, packId: 'pb_chaos' },
                { id: 'pb_108', text: 'اشتم صاحبك بشتيمة "شيك" (من غير ألفاظ)', intensity: 8, socialDanger: 6, replayFatigue: 70, tone: 'playful', mood: 'tense', tags: ['roast', 'social'], packId: 'pb_chaos' },
            ]
        }
    ],

    // -------------------------------------------------------------------------
    // MODE: TRUTH OR DARE (Deep / Exposure)
    // -------------------------------------------------------------------------
    'truth_dare': [
        {
            id: 'td_chill',
            name: 'قعدة صحاب',
            description: 'تعارف وهزار خفيف',
            baseIntensity: 3,
            cards: [
                // CLUSTER: FIRST IMPRESSIONS
                { id: 'td_001', text: 'إيه انطباعك الأول عن الشخص اللي على يمينك؟', intensity: 3, socialDanger: 2, replayFatigue: 30, tone: 'neutral', mood: 'relieving', tags: ['truth', 'social'], packId: 'td_chill' },
                { id: 'td_002', text: 'مين أكتر حد في القعدة دي تحسه "بيفهم في الأكل"؟', intensity: 2, socialDanger: 1, replayFatigue: 20, tone: 'playful', mood: 'relieving', tags: ['truth', 'food'], packId: 'td_chill' },

                // CLUSTER: MOBILE & PRIVACY (Low Risk)
                { id: 'td_003', text: 'افتح آخر صورة صورتها (مش سكرين شوت) ووريها للكل', intensity: 5, socialDanger: 4, replayFatigue: 50, tone: 'playful', mood: 'provocative', tags: ['dare', 'mobile'], packId: 'td_chill' },
                { id: 'td_004', text: 'إيه أكتر تطبيق بتستخدمه ومكسوف تقول؟', intensity: 4, socialDanger: 3, replayFatigue: 40, tone: 'playful', mood: 'provocative', tags: ['truth', 'mobile'], packId: 'td_chill' },

                // CLUSTER: MONEY (Low Risk)
                { id: 'td_005', text: 'إيه أكتر حاجة اشتريتها وندمت إنك دفعت فيها فلوس؟', intensity: 2, socialDanger: 1, replayFatigue: 20, tone: 'neutral', mood: 'relieving', tags: ['truth', 'money'], packId: 'td_chill' },
            ]
        },
        {
            id: 'td_spicy',
            name: 'كلام كبار',
            description: 'ممنوع للأطفال وممنوع للكذابين',
            baseIntensity: 9,
            cards: [
                // CLUSTER: LOYALTY & MONEY (Heavy)
                { id: 'td_104', text: 'لو اتعرض عليك ١٠٠ ألف جنيه مقابل إنك تقطع علاقتك بأقرب صاحب ليك في القعدة دي.. توافق؟', intensity: 8, socialDanger: 7, replayFatigue: 60, tone: 'serious', mood: 'provocative', tags: ['truth', 'money', 'loyalty'], packId: 'td_spicy' },
                { id: 'td_105', text: 'إمتى حسيت إنك "قليل" مادياً وسط صحابك ومقولتش؟', intensity: 10, socialDanger: 5, replayFatigue: 80, tone: 'heavy', mood: 'reflective', tags: ['truth', 'money', 'vulnerable'], packId: 'td_spicy' },
                { id: 'td_106', text: 'مين فينا أكتر واحد "إيديه ماسكة" ومبيحبش يصرف؟', intensity: 6, socialDanger: 6, replayFatigue: 40, tone: 'playful', mood: 'tense', tags: ['truth', 'money', 'roast'], packId: 'td_spicy' },

                // CLUSTER: RELATIONSHIPS & EXES
                { id: 'td_201', text: 'لسه بتدخل على بروفايل حد من الاكسات؟ مين وليه؟', intensity: 9, socialDanger: 8, replayFatigue: 80, tone: 'serious', mood: 'provocative', tags: ['truth', 'relationships'], packId: 'td_spicy' },
                { id: 'td_202', text: 'لو الاكس رجع/ت النهاردة قال "أنا آسف وعايز نرجع".. رد فعلك هيكون إيه؟', intensity: 8, socialDanger: 6, replayFatigue: 70, tone: 'serious', mood: 'reflective', tags: ['truth', 'relationships'], packId: 'td_spicy' },
                { id: 'td_203', text: 'مين الشخص اللي ندمان إنك دخلته حياتك؟', intensity: 10, socialDanger: 9, replayFatigue: 90, tone: 'heavy', mood: 'tense', tags: ['truth', 'deep'], packId: 'td_spicy' },

                // CLUSTER: TRUST & FAKENESS
                { id: 'td_301', text: 'مين أكتر شخص في القعدة دي "بوشين" (بيقول كلام ومن وراه كلام)؟', intensity: 10, socialDanger: 10, replayFatigue: 95, tone: 'heavy', mood: 'provocative', tags: ['truth', 'social', 'roast'], packId: 'td_spicy' },
                { id: 'td_302', text: 'إمتى ضحكت في وش حد وأنت مبتحبوش عشان المصلحة؟', intensity: 7, socialDanger: 5, replayFatigue: 60, tone: 'serious', mood: 'reflective', tags: ['truth', 'social'], packId: 'td_spicy' },
                { id: 'td_303', text: 'سر مخبيه عن أهلك ولو عرفوه هتبقى مصيبة؟', intensity: 9, socialDanger: 7, replayFatigue: 80, tone: 'heavy', mood: 'tense', tags: ['truth', 'family'], packId: 'td_spicy' },

                // CLUSTER: DARK HYPOTHETICALS
                { id: 'td_401', text: 'لو معاك مسدس وفيه طلقة واحدة، تضرب مين في حياتك (مش موجود هنا)؟', intensity: 10, socialDanger: 9, replayFatigue: 90, tone: 'heavy', mood: 'tense', tags: ['truth', 'dark'], packId: 'td_spicy' },
                { id: 'td_402', text: 'لو قالولك تضحي بشخص واحد في القعدة دي عشان تنقذ الباقيين.. تختار مين؟', intensity: 10, socialDanger: 10, replayFatigue: 95, tone: 'heavy', mood: 'provocative', tags: ['truth', 'dark', 'roast'], packId: 'td_spicy' },
            ]
        }
    ],

    // -------------------------------------------------------------------------
    // MODE: EMOJI MOVIES (Visual / Pop Culture)
    // -------------------------------------------------------------------------
    'movies_emoji': [
        {
            id: 'em_classics',
            name: 'كلاسيكيات',
            description: 'أفلام معروفة',
            baseIntensity: 3,
            cards: [
                { id: 'em_001', text: '🕷️ 👨', emoji: '🕷️ 👨', answer: 'Spider-Man', intensity: 2, socialDanger: 1, replayFatigue: 10, tone: 'playful', mood: 'relieving', tags: ['foreign'], packId: 'em_classics' },
                { id: 'em_003', text: '🚢 🧊 💔', emoji: '🚢 🧊 💔', answer: 'Titanic', intensity: 3, socialDanger: 1, replayFatigue: 15, tone: 'neutral', mood: 'relieving', tags: ['foreign'], packId: 'em_classics' },
                { id: 'em_005', text: '🤡 🎈', emoji: '🤡 🎈', answer: 'IT', intensity: 4, socialDanger: 1, replayFatigue: 20, tone: 'serious', mood: 'tense', tags: ['horror'], packId: 'em_classics' },
            ]
        },
        {
            id: 'em_masry',
            name: 'مصري',
            description: 'أفلامنا',
            baseIntensity: 4,
            cards: [
                { id: 'em_101', text: '🏝️ 😈', emoji: '🏝️ 😈', answer: 'جزيرة الشيطان', intensity: 4, socialDanger: 1, replayFatigue: 30, tone: 'playful', mood: 'relieving', tags: ['masry'], packId: 'em_masry' },
                { id: 'em_102', text: '🍊 💼', emoji: '🍊 💼', answer: 'مرجان أحمد مرجان', intensity: 3, socialDanger: 1, replayFatigue: 25, tone: 'playful', mood: 'relieving', tags: ['masry'], packId: 'em_masry' },
                { id: 'em_103', text: '🧊 🍧', emoji: '🧊 🍧', answer: 'إيس كريم في جليم', intensity: 3, socialDanger: 1, replayFatigue: 20, tone: 'playful', mood: 'relieving', tags: ['masry'], packId: 'em_masry' },
                { id: 'em_104', text: '🔥 🥚', emoji: '🔥 🥚', answer: 'همام في أمستردام', intensity: 3, socialDanger: 1, replayFatigue: 20, tone: 'playful', mood: 'relieving', tags: ['masry'], packId: 'em_masry' },
                { id: 'em_105', text: '🦁 🦁 🦁 🦁', emoji: '🦁 🦁 🦁 🦁', answer: 'أربع كحرات وشبل', intensity: 4, socialDanger: 1, replayFatigue: 30, tone: 'playful', mood: 'relieving', tags: ['masry'], packId: 'em_masry' },
                { id: 'em_106', text: '💉 💊 🦕', emoji: '💉 💊 🦕', answer: 'الفيل الأزرق', intensity: 5, socialDanger: 1, replayFatigue: 40, tone: 'serious', mood: 'tense', tags: ['masry', 'horror'], packId: 'em_masry' },
            ]
        }
    ],

    // -------------------------------------------------------------------------
    // MODE: PROVERBS (Cultural)
    // -------------------------------------------------------------------------
    'proverbs': [
        {
            id: 'prov_main',
            name: 'أمثال',
            description: 'حكمة',
            baseIntensity: 3,
            cards: [
                { id: 'pr_001', text: 'على قد لحافك...', answer: '...مد رجليك', intensity: 2, socialDanger: 1, replayFatigue: 10, tone: 'neutral', mood: 'relieving', tags: ['classic'], packId: 'prov_main' },
                { id: 'pr_002', text: 'اللي ميعرفش يقول...', answer: '...عدس', intensity: 2, socialDanger: 1, replayFatigue: 10, tone: 'neutral', mood: 'relieving', tags: ['classic'], packId: 'prov_main' },
                { id: 'pr_003', text: 'إمشي في جنازة ولا تمشيش في...', answer: '...جوازة', intensity: 3, socialDanger: 2, replayFatigue: 15, tone: 'playful', mood: 'provocative', tags: ['funny'], packId: 'prov_main' },
                { id: 'pr_004', text: 'اقلب القدرة على فمها...', answer: '...تطلع البت لأمها', intensity: 3, socialDanger: 2, replayFatigue: 20, tone: 'playful', mood: 'relieving', tags: ['women'], packId: 'prov_main' },
                { id: 'pr_005', text: 'القرعة تتباهى...', answer: '...بشعر بنت اختها', intensity: 3, socialDanger: 2, replayFatigue: 20, tone: 'playful', mood: 'relieving', tags: ['funny'], packId: 'prov_main' },
                { id: 'pr_006', text: 'يا واخد القرد على ماله...', answer: '...يروح المال ويفضل القرد على حاله', intensity: 4, socialDanger: 1, replayFatigue: 30, tone: 'serious', mood: 'reflective', tags: ['money'], packId: 'prov_main' },
            ]
        }
    ],

    // -------------------------------------------------------------------------
    // MODE: STORY CHAIN (Creative)
    // -------------------------------------------------------------------------
    'story_chain': [
        {
            id: 'sc_fantasy',
            name: 'خيال',
            description: 'تأليف',
            baseIntensity: 4,
            cards: [
                { id: 'sc_001', text: 'صحيت من النوم لقيت نفسي في المريخ ومعايا...', intensity: 3, socialDanger: 1, replayFatigue: 40, tone: 'playful', mood: 'provocative', tags: ['sci-fi'], packId: 'sc_fantasy' },
                { id: 'sc_002', text: 'دخلت المطبخ لقيت التلاجة بتتكلم وبتقول...', intensity: 3, socialDanger: 1, replayFatigue: 40, tone: 'playful', mood: 'provocative', tags: ['funny'], packId: 'sc_fantasy' },
                { id: 'sc_003', text: 'ركبت ميكروباص والسواق طلع...', intensity: 4, socialDanger: 2, replayFatigue: 50, tone: 'serious', mood: 'tense', tags: ['horror'], packId: 'sc_fantasy' },
            ]
        }
    ]
};
