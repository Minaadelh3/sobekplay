import { WhoCharacter } from './types';
import { BIBLE_CHARACTERS } from '../bibleCharactersData';

// Convert existing Bible characters to new format
const BIBLE_CONVERTED: WhoCharacter[] = BIBLE_CHARACTERS.map(c => ({
    id: `bible_${c.id}`,
    name: c.name,
    clues: c.clues,
    category: 'RELIGIOUS',
    subcategory: 'Bible'
}));

export const RELIGIOUS_CHARACTERS: WhoCharacter[] = [
    ...BIBLE_CONVERTED,
    // Add Islamic / Other Religious figures here
    {
        id: 'rel1', name: 'صلاح الدين الأيوبي',
        clues: ['حرر القدس من الصليبيين', 'بطل معركة حطين', 'اشتهر بتسامحه مع الأسرى', 'وحد مصر والشام'],
        category: 'RELIGIOUS', subcategory: 'History'
    },
    {
        id: 'rel2', name: 'محمد الفاتح',
        clues: ['فتح القسطنطينية', 'حقق نبوءة الفتح وهو شاب صغير (٢١ سنة)', 'نقل السفن عبر البر', 'سابع سلاطين الدولة العثمانية'],
        category: 'RELIGIOUS', subcategory: 'History'
    },
    {
        id: 'rel3', name: 'عمر المختار',
        clues: ['أسد الصحراء', 'قاد المقاومة الليبية ضد الطليان', 'أعدم شنقاً وهو شيخ طاعن', 'قال: نحن لن نستسلم، ننتصر أو نموت'],
        category: 'RELIGIOUS', subcategory: 'History'
    },
    {
        id: 'rel4', name: 'البابا كيرلس السادس',
        clues: ['البابا رقم ١١٦', 'اشتهر بالقداسات اليومية', 'صديق القديس مارمينا', 'في عهده ظهرت العذراء في الزيتون'],
        category: 'RELIGIOUS', subcategory: 'Coptic'
    },
    {
        id: 'rel5', name: 'البابا شنودة الثالث',
        clues: ['معلم الأجيال', 'كان شاعرً وكاتباً', 'نفي إلى الدير في عهد السادات', 'قال: مصر وطن يعيش فينا'],
        category: 'RELIGIOUS', subcategory: 'Coptic'
    },
    {
        id: 'rel6', name: 'الأم تريزا',
        clues: ['راهبة خدمت الفقراء في الهند', 'حصلت على جائزة نوبل للسلام', 'أسست جمعية "الإرساليات الخيرية"', 'ملابسها كانت ساري أبيض بخطوط زرقاء'],
        category: 'RELIGIOUS', subcategory: 'Christian'
    },
    {
        id: 'rel7', name: 'خالد بن الوليد',
        clues: ['سيف الله المسلول', 'لم يهزم في معركة قط', 'قاد جيوش المسلمين في اليرموك', 'مات على فراشه وهو يبكي'],
        category: 'RELIGIOUS', subcategory: 'Islamic'
    },
    {
        id: 'rel8', name: 'طارق بن زياد',
        clues: ['فاتح الأندلس', 'عبر المضيق الذي سمي باسمه', 'أحرق السفن (في الرواية الشهيرة)', 'قال: البحر من ورائكم والعدو أمامكم'],
        category: 'RELIGIOUS', subcategory: 'Islamic'
    },
    {
        id: 'rel9', name: 'هارون الرشيد',
        clues: ['أشهر خلفاء بني العباس', 'كان يحج عاماً ويغزو عاماً', 'عصره كان العصر الذهبي للعلوم', 'ارتبط اسمه بقصص ألف ليلة وليلة'],
        category: 'RELIGIOUS', subcategory: 'Islamic'
    },
    {
        id: 'rel10', name: 'القديس أنطونيوس',
        clues: ['أبو الرهبان', 'باع كل ما يملك ووزعه على الفقراء', 'عاش في برية مصر الشرقية', 'مؤسس الرهبنة في العالم'],
        category: 'RELIGIOUS', subcategory: 'Coptic'
    }
];
