// data/curatedDecks.ts
import { Deck, GameModeId } from '../types/partyEngine';

export const MASTER_DECKS: Record<GameModeId, Deck[]> = {
    // --- PASS & BOOM (Timed Bomb) ---
    'pass_boom': [
        {
            id: 'pb_starter',
            name: 'تسخين',
            description: 'أسئلة سهلة وسريعة عشان نبدأ',
            baseIntensity: 1,
            cards: [
                { id: 'pb_001', text: '٣ حيوانات بحرف الف', intensity: 1, socialRisk: 1, tags: ['general'], packId: 'pb_starter' },
                { id: 'pb_002', text: '٣ حاجات موجودة في شنطتك', intensity: 1, socialRisk: 1, tags: ['general'], packId: 'pb_starter' },
                { id: 'pb_003', text: '٣ أكلات مصرية مشهورة', intensity: 1, socialRisk: 1, tags: ['food'], packId: 'pb_starter' },
                { id: 'pb_004', text: '٣ دول عربية غير مصر', intensity: 1, socialRisk: 1, tags: ['geo'], packId: 'pb_starter' },
                { id: 'pb_005', text: '٣ صفات في صاحبك اللي جنبك', intensity: 2, socialRisk: 2, tags: ['social'], packId: 'pb_starter' },
            ]
        },
        {
            id: 'pb_chaos',
            name: 'فرهدة',
            description: 'أسئلة عايزة تفكير وسرعة بديهة',
            baseIntensity: 4,
            cards: [
                { id: 'pb_101', text: 'قول ٥ أمثال فيها كلمة "عين"', intensity: 4, socialRisk: 1, tags: ['proverbs'], packId: 'pb_chaos' },
                { id: 'pb_102', text: 'قول اسم ٤ ممثلين مثلوا دور "ضابط"', intensity: 3, socialRisk: 1, tags: ['movies'], packId: 'pb_chaos' },
                { id: 'pb_103', text: 'غنّي مقطع من أغنية لعمرو دياب', intensity: 3, socialRisk: 2, tags: ['music', 'acting'], packId: 'pb_chaos', minTime: 15 },
                { id: 'pb_104', text: 'قول نكتة بايخة تضحكنا كلنا', intensity: 4, socialRisk: 3, tags: ['social'], packId: 'pb_chaos', minTime: 20 },
            ]
        }
    ],

    // --- TRUTH OR DARE ---
    'truth_dare': [
        {
            id: 'td_chill',
            name: 'قعدة صحاب',
            description: 'أسئلة خفيفة عشان نتعرف ع بعض',
            baseIntensity: 2,
            cards: [
                { id: 'td_001', text: 'إيه أكتر أكلة مبتحبش حد يعزمك عليها؟', intensity: 1, socialRisk: 1, tags: ['truth', 'food'], packId: 'td_chill' },
                { id: 'td_002', text: 'مين أكتر حد في القعدة دي ممكن يتسجن؟', intensity: 2, socialRisk: 2, tags: ['truth', 'social'], packId: 'td_chill' },
                { id: 'td_003', text: 'افتح آخر صورة عندك في الجاليري ووريها للكل', intensity: 3, socialRisk: 3, tags: ['dare', 'mobile'], packId: 'td_chill' },
                { id: 'td_004', text: 'كلم حد عشوائي من جهات الاتصال وقوله "بحبك"', intensity: 4, socialRisk: 3, tags: ['dare', 'mobile'], packId: 'td_chill' },
            ]
        },
        {
            id: 'td_spicy',
            name: 'كلام كبار',
            description: 'أسئلة جريئة ومواقف تحرج',
            baseIntensity: 5,
            cards: [
                { id: 'td_101', text: 'إيه أسوأ كدبة كدبتها على أهلك وعدت؟', intensity: 4, socialRisk: 2, tags: ['truth'], packId: 'td_spicy' },
                { id: 'td_102', text: 'لو معاك مسدس وفيه طلقة واحدة، تضرب مين في حياتك (مش موجود هنا)؟', intensity: 5, socialRisk: 3, tags: ['truth', 'dark'], packId: 'td_spicy' },
            ]
        }
    ],

    // --- EMOJI MOVIES ---
    'movies_emoji': [
        {
            id: 'em_classics',
            name: 'كلاسيكيات',
            description: 'أفلام كلنا عارفينها',
            baseIntensity: 2,
            cards: [
                { id: 'em_001', text: '🕷️ 👨', emoji: '🕷️ 👨', answer: 'Spider-Man', intensity: 1, socialRisk: 1, tags: ['foreign'], packId: 'em_classics' },
                { id: 'em_002', text: '🦁 👑', emoji: '🦁 👑', answer: 'The Lion King', intensity: 1, socialRisk: 1, tags: ['cartoon'], packId: 'em_classics' },
                { id: 'em_003', text: '🚢 🧊 💔', emoji: '🚢 🧊 💔', answer: 'Titanic', intensity: 2, socialRisk: 1, tags: ['foreign'], packId: 'em_classics' },
                { id: 'em_004', text: '🏃‍♂️ 🌲 🏃‍♂️', emoji: '🏃‍♂️ 🌲 🏃‍♂️', answer: 'Forrest Gump', intensity: 2, socialRisk: 1, tags: ['foreign'], packId: 'em_classics' },
            ]
        },
        {
            id: 'em_masry',
            name: 'مصري أصلي',
            description: 'أفلامنا الجميلة',
            baseIntensity: 3,
            cards: [
                { id: 'em_101', text: '🏝️ 😈', emoji: '🏝️ 😈', answer: 'جزيرة الشيطان', intensity: 3, socialRisk: 1, tags: ['masry'], packId: 'em_masry' },
                { id: 'em_102', text: '🍊 💼', emoji: '🍊 💼', answer: 'مرجان أحمد مرجان', intensity: 2, socialRisk: 1, tags: ['masry'], packId: 'em_masry' },
                { id: 'em_103', text: '🧊 🍧', emoji: '🧊 🍧', answer: 'إيس كريم في جليم', intensity: 3, socialRisk: 1, tags: ['masry'], packId: 'em_masry' },
            ]
        }
    ],

    // Placeholders for other modes to strict types
    'proverbs': [],
    'story_chain': []
};
