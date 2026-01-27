// data/curatedDecks.ts
import { Deck, GameModeId } from '../types/partyEngine';

export const MASTER_DECKS: Record<GameModeId, Deck[]> = {
    // --- PASS & BOOM (Pressure Escalation) ---
    'pass_boom': [
        {
            id: 'pb_starter',
            name: 'تسخين',
            description: 'بداية هادية للقعدة',
            baseIntensity: 2,
            cards: [
                {
                    id: 'pb_001', text: '٣ حيوانات بحرف الف',
                    intensity: 2, socialDanger: 1, replayFatigue: 20,
                    tone: 'playful', mood: 'relieving', tags: ['general'], packId: 'pb_starter'
                },
                {
                    id: 'pb_002', text: '٣ حاجات موجودة في شنطتك',
                    intensity: 2, socialDanger: 1, replayFatigue: 30,
                    tone: 'neutral', mood: 'relieving', tags: ['general'], packId: 'pb_starter'
                },
                {
                    id: 'pb_003', text: '٣ أكلات مصرية مشهورة',
                    intensity: 1, socialDanger: 1, replayFatigue: 10,
                    tone: 'playful', mood: 'relieving', tags: ['food'], packId: 'pb_starter'
                },
                {
                    id: 'pb_005', text: '٣ صفات في صاحبك اللي جنبك',
                    intensity: 4, socialDanger: 4, replayFatigue: 60,
                    tone: 'playful', mood: 'tense', tags: ['social'], packId: 'pb_starter'
                },
            ]
        },
        {
            id: 'pb_chaos',
            name: 'فرهدة',
            description: 'ضغط عالي وسرعة',
            baseIntensity: 7,
            cards: [
                {
                    id: 'pb_103', text: 'غنّي مقطع من أغنية لعمرو دياب',
                    intensity: 6, socialDanger: 3, replayFatigue: 50,
                    tone: 'playful', mood: 'provocative', tags: ['music', 'acting'], minTime: 15, packId: 'pb_chaos'
                },
                {
                    id: 'pb_104', text: 'قول نكتة بايخة تضحكنا كلنا',
                    intensity: 8, socialDanger: 7, replayFatigue: 80,
                    tone: 'heavy', mood: 'tense', tags: ['social'], minTime: 20, packId: 'pb_chaos'
                },
                {
                    id: 'pb_105', text: 'اعمل صوت ٣ حيوانات وصحبك يخمنهم',
                    intensity: 7, socialDanger: 4, replayFatigue: 60,
                    tone: 'playful', mood: 'provocative', tags: ['acting'], minTime: 15, packId: 'pb_chaos'
                },
            ]
        }
    ],

    // --- TRUTH OR DARE (Exposure) ---
    'truth_dare': [
        {
            id: 'td_chill',
            name: 'قعدة صحاب',
            description: 'تعارف وهزار',
            baseIntensity: 3,
            cards: [
                {
                    id: 'td_001', text: 'إيه أكتر أكلة مبتحبش حد يعزمك عليها؟',
                    intensity: 2, socialDanger: 1, replayFatigue: 20,
                    tone: 'neutral', mood: 'relieving', tags: ['truth', 'food'], packId: 'td_chill'
                },
                {
                    id: 'td_002', text: 'مين أكتر حد في القعدة دي ممكن يتسجن؟',
                    intensity: 4, socialDanger: 4, replayFatigue: 40,
                    tone: 'playful', mood: 'provocative', tags: ['truth', 'social'], packId: 'td_chill'
                },
                {
                    id: 'td_003', text: 'افتح آخر صورة عندك في الجاليري ووريها للكل',
                    intensity: 6, socialDanger: 7, replayFatigue: 70,
                    tone: 'heavy', mood: 'tense', tags: ['dare', 'mobile'], packId: 'td_chill'
                },
            ]
        },
        {
            id: 'td_spicy',
            name: 'كلام كبار',
            description: 'ممنوع للأطفال',
            baseIntensity: 9,
            cards: [
                {
                    id: 'td_102', text: 'لو معاك مسدس وفيه طلقة واحدة، تضرب مين في حياتك (مش موجود هنا)؟',
                    intensity: 10, socialDanger: 9, replayFatigue: 90,
                    tone: 'heavy', mood: 'tense', tags: ['truth', 'dark'], packId: 'td_spicy'
                },
                {
                    id: 'td_103', text: 'مين الشخص اللي ندمان إنك عرفته؟',
                    intensity: 9, socialDanger: 8, replayFatigue: 80,
                    tone: 'serious', mood: 'reflective', tags: ['truth', 'deep'], packId: 'td_spicy'
                },
            ]
        }
    ],

    // --- EMOJI MOVIES (Conflict/Reaction) ---
    'movies_emoji': [
        {
            id: 'em_classics',
            name: 'كلاسيكيات',
            description: 'أفلام معروفة',
            baseIntensity: 3,
            cards: [
                {
                    id: 'em_001', text: '🕷️ 👨', emoji: '🕷️ 👨', answer: 'Spider-Man',
                    intensity: 2, socialDanger: 1, replayFatigue: 10,
                    tone: 'playful', mood: 'relieving', tags: ['foreign'], packId: 'em_classics'
                },
                {
                    id: 'em_003', text: '🚢 🧊 💔', emoji: '🚢 🧊 💔', answer: 'Titanic',
                    intensity: 3, socialDanger: 1, replayFatigue: 15,
                    tone: 'neutral', mood: 'relieving', tags: ['foreign'], packId: 'em_classics'
                },
            ]
        },
        {
            id: 'em_masry',
            name: 'مصري',
            description: 'أفلامنا',
            baseIntensity: 4,
            cards: [
                {
                    id: 'em_101', text: '🏝️ 😈', emoji: '🏝️ 😈', answer: 'جزيرة الشيطان',
                    intensity: 4, socialDanger: 1, replayFatigue: 30,
                    tone: 'playful', mood: 'relieving', tags: ['masry'], packId: 'em_masry'
                },
                {
                    id: 'em_102', text: '🍊 💼', emoji: '🍊 💼', answer: 'مرجان أحمد مرجان',
                    intensity: 3, socialDanger: 1, replayFatigue: 25,
                    tone: 'playful', mood: 'relieving', tags: ['masry'], packId: 'em_masry'
                },
            ]
        }
    ],

    // --- PROVERBS ---
    'proverbs': [
        {
            id: 'prov_main',
            name: 'أمثال',
            description: 'حكمة',
            baseIntensity: 3,
            cards: [
                {
                    id: 'pr_004', text: 'اقلب القدرة على فمها...', answer: '...تطلع البت لأمها',
                    intensity: 3, socialDanger: 2, replayFatigue: 20,
                    tone: 'playful', mood: 'relieving', tags: ['women'], packId: 'prov_main'
                },
            ]
        }
    ],

    // --- STORY CHAIN ---
    'story_chain': [
        {
            id: 'sc_fantasy',
            name: 'خيال',
            description: 'تأليف',
            baseIntensity: 4,
            cards: [
                {
                    id: 'sc_001', text: 'صحيت من النوم لقيت نفسي في المريخ ومعايا...',
                    intensity: 3, socialDanger: 1, replayFatigue: 40,
                    tone: 'playful', mood: 'provocative', tags: ['sci-fi'], packId: 'sc_fantasy'
                },
            ]
        }
    ]
};
