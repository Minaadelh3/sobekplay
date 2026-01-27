
// data/partyGames.ts
import { GameCard } from '../services/gameAI';

// --- ROBUST FALLBACK DATA ---

const QUESTIONS_FALLBACK: GameCard[] = [
    { mode: 'TRUTH_DARE', type: 'QUESTION', text: 'أكتر حاجة بتخليك تضحك غصب عنك؟', safe: true },
    { mode: 'TRUTH_DARE', type: 'QUESTION', text: 'موقف حصل وخلاك تغيّر رأيك في حد؟', safe: true },
    { mode: 'TRUTH_DARE', type: 'QUESTION', text: 'إيه أكتر أكلة مبتعرفش تقولها؟', safe: true },
    { mode: 'TRUTH_DARE', type: 'QUESTION', text: 'حاجة نفسك تعترف بيها بس دايمًا بتأجل؟', safe: true },
    { mode: 'TRUTH_DARE', type: 'QUESTION', text: 'إيه أكتر عادة بتضايقك في الناس؟', safe: true },
    { mode: 'TRUTH_DARE', type: 'QUESTION', text: 'مكان بتحبه حتى لو بسيط؟', safe: true },
    { mode: 'PASS_BOOM', type: 'QUESTION', text: 'اسم حيوان بحرف الميم بسرعة!', minTimeRequired: 2, safe: true },
    { mode: 'PASS_BOOM', type: 'QUESTION', text: 'بلد أفريقية غير مصر؟', minTimeRequired: 2, safe: true },
    { mode: 'PASS_BOOM', type: 'QUESTION', text: 'أكلة مصرية مشهورة؟', minTimeRequired: 2, safe: true },
];

const CHALLENGES_FALLBACK: GameCard[] = [
    { mode: 'TRUTH_DARE', type: 'CHALLENGE', text: 'قلد ضحكة حد في القعدة', minTimeRequired: 5, safe: true },
    { mode: 'TRUTH_DARE', type: 'CHALLENGE', text: 'اختر حد يحكيلنا نكتة', minTimeRequired: 10, safe: true },
    { mode: 'TRUTH_DARE', type: 'CHALLENGE', text: 'اعمل Pose تصوير 5 ثواني', minTimeRequired: 5, safe: true },
    { mode: 'TRUTH_DARE', type: 'CHALLENGE', text: 'غيّر مكانك مع حد', minTimeRequired: 5, safe: true },
    { mode: 'TRUTH_DARE', type: 'CHALLENGE', text: 'قول اسمك كأنك مذيع راديو', minTimeRequired: 5, safe: true },
];

const EMOJI_MOVIES_FALLBACK: GameCard[] = [
    { mode: 'EMOJI_MOVIES', type: 'EMOJI', emoji: '🚕⚫', movieTitle: 'عسل إسود', text: 'خمن اسم الفيلم', safe: true },
    { mode: 'EMOJI_MOVIES', type: 'EMOJI', emoji: '🧠🎭', movieTitle: 'فيلم ثقافي', text: 'خمن اسم الفيلم', safe: true },
    { mode: 'EMOJI_MOVIES', type: 'EMOJI', emoji: '👮‍♂️🌯', movieTitle: 'الإرهاب والكباب', text: 'خمن اسم الفيلم', safe: true },
    { mode: 'EMOJI_MOVIES', type: 'EMOJI', emoji: '🧊🚢', movieTitle: 'Titanic', text: 'خمن اسم الفيلم', safe: true },
    { mode: 'EMOJI_MOVIES', type: 'EMOJI', emoji: '🦁👑', movieTitle: 'The Lion King', text: 'خمن اسم الفيلم', safe: true },
    { mode: 'EMOJI_MOVIES', type: 'EMOJI', emoji: '👻🔫', movieTitle: 'Ghostbusters', text: 'خمن اسم الفيلم', safe: true },
];

const PROVERBS_FALLBACK: GameCard[] = [
    { mode: 'PROVERBS', type: 'PROVERB', text: 'اللي اختشوا ...', answers: ['ماتوا'], safe: true },
    { mode: 'PROVERBS', type: 'PROVERB', text: 'القرش الأبيض ...', answers: ['ينفع في اليوم الأسود'], safe: true },
    { mode: 'PROVERBS', type: 'PROVERB', text: 'اللي فات ...', answers: ['مات'], safe: true },
    { mode: 'PROVERBS', type: 'PROVERB', text: 'اسأل مجرب ...', answers: ['ولا تسأل حكيم'], safe: true },
    { mode: 'PROVERBS', type: 'PROVERB', text: 'زي ما تيجي ...', answers: ['تيجي'], safe: true },
];

const STORY_STARTERS_FALLBACK: GameCard[] = [
    { mode: 'STORY_CHAIN', type: 'STARTER', text: 'فجأة والكل ساكت...', safe: true },
    { mode: 'STORY_CHAIN', type: 'STARTER', text: 'وفي نفس اللحظة الباب خبط...', safe: true },
    { mode: 'STORY_CHAIN', type: 'STARTER', text: 'بس الغريب إن النور كان لسه شغال...', safe: true },
    { mode: 'STORY_CHAIN', type: 'STARTER', text: 'من غير سابق إنذار السماء أمطرت فلوس...', safe: true },
];

export const DATA_FALLBACK: Record<string, GameCard[]> = {
    'PASS_BOOM': [...QUESTIONS_FALLBACK.filter(q => q.mode === 'PASS_BOOM'), ...QUESTIONS_FALLBACK], // Mix specific + general
    'TRUTH_DARE': [...QUESTIONS_FALLBACK, ...CHALLENGES_FALLBACK],
    'EMOJI_MOVIES': EMOJI_MOVIES_FALLBACK,
    'PROVERBS': PROVERBS_FALLBACK,
    'STORY_CHAIN': STORY_STARTERS_FALLBACK
};

// Legacy exports for other components if needed (Optional, can be removed if unused)
export const QUESTIONS = QUESTIONS_FALLBACK.map(c => c.text);
export const CHALLENGES = CHALLENGES_FALLBACK.map(c => c.text);
export const SAFE_PENALTIES = ['اشرب مية', 'غيّر مكانك', 'اختار حد يبدأ', 'قول كلمة حلوة عن حد'];
export const VOTING_PROMPTS = ['مين أكتر واحد بيتأخر؟', 'مين أكتر واحد منظم؟'];
export const EMOJI_CHARADES = EMOJI_MOVIES_FALLBACK;
export const PROVERBS = PROVERBS_FALLBACK.map(c => c.text);
export const FANTASY_STARTERS = STORY_STARTERS_FALLBACK.map(c => c.text);
