import { Person } from './types';

// ORIGINAL GIRLS (22)
const ORIG_GIRLS: Person[] = [
    { name: "يوستينا عبد الملاك", gender: 'F' },
    { name: "كريستين صبحى", gender: 'F' },
    { name: "مارينا هانى", gender: 'F' },
    { name: "مونيكا هانى", gender: 'F' },
    { name: "مارتينا عدلى", gender: 'F' },
    { name: "ميرنا نبيل", gender: 'F' },
    { name: "فابى سمير", gender: 'F' },
    { name: "ناريمان ناجح", gender: 'F' },
    { name: "أوليفيا أنور", gender: 'F' },
    { name: "ماريا طارق", gender: 'F' },
    { name: "يوستينا سمير", gender: 'F' },
    { name: "كارين ماجد", gender: 'F' },
    { name: "جوسى فؤاد", gender: 'F' },
    { name: "كارين فؤاد", gender: 'F' },
    { name: "مارلين مجدى", gender: 'F' },
    { name: "جيسيان عادل", gender: 'F' },
    { name: "ليديا سامى", gender: 'F' },
    { name: "سارة ماهر", gender: 'F' },
    { name: "فرينا مجدى", gender: 'F' },
    { name: "ناردين نادر", gender: 'F' },
    { name: "هيلين ميخائيل", gender: 'F' },
    { name: "مارفى أشرف", gender: 'F' },
];

// ORIGINAL BOYS (27)
const ORIG_BOYS: Person[] = [
    { name: "مينا فايق", gender: 'M' },
    { name: "جوناثان", gender: 'M' },
    { name: "ديفيد", gender: 'M' },
    { name: "أ/ أمجد نبيه", gender: 'M' },
    { name: "أ/ ميخائيل يسرى", gender: 'M' },
    { name: "أ/ أشرف إبراهيم", gender: 'M' },
    { name: "جورج مجدى", gender: 'M' },
    { name: "مينا فايز", gender: 'M' },
    { name: "مينا رشدى", gender: 'M' },
    { name: "مينا عادل حبيب", gender: 'M' },
    { name: "جون جمال", gender: 'M' },
    { name: "أندرو أسامة", gender: 'M' },
    { name: "د. طانيوس", gender: 'M' },
    { name: "مينا ماهر جرجس", gender: 'M' },
    { name: "يوحنا عماد", gender: 'M' },
    { name: "كريم ماجد", gender: 'M' },
    { name: "توماس بهاء", gender: 'M' },
    { name: "مايكل صفاء", gender: 'M' },
    { name: "جورج صفاء", gender: 'M' },
    { name: "مايكل فوزى", gender: 'M' },
    { name: "مينا بولس", gender: 'M' },
    { name: "إبرام رأفت", gender: 'M' },
    { name: "جورج تادرس", gender: 'M' },
    { name: "ستيفن وائل", gender: 'M' },
    { name: "أنتونى مجدى", gender: 'M' },
    { name: "جورج جوزيف", gender: 'M' },
    { name: "كيرلس مينا", gender: 'M' },
];

// FILLER GIRLS (10 needed to reach 32)
const FILLER_GIRLS: Person[] = [
    { name: "مريم أشرف", gender: 'F', isFiller: true },
    { name: "نادين فؤاد", gender: 'F', isFiller: true },
    { name: "جيسيكا مجدي", gender: 'F', isFiller: true },
    { name: "ريتا شادي", gender: 'F', isFiller: true },
    { name: "نيرمين فادي", gender: 'F', isFiller: true },
    { name: "أنجيلا سامح", gender: 'F', isFiller: true },
    { name: "جودي فوزي", gender: 'F', isFiller: true },
    { name: "نانسي رأفت", gender: 'F', isFiller: true },
    { name: "ميريت عادل", gender: 'F', isFiller: true },
    { name: "دينا رامي", gender: 'F', isFiller: true },
];

// FILLER BOYS (37 needed to reach 64)
const FILLER_BOYS: Person[] = [
    { name: "بيتر عادل", gender: 'M', isFiller: true },
    { name: "رامي فوزي", gender: 'M', isFiller: true },
    { name: "مارك جرجس", gender: 'M', isFiller: true },
    { name: "بولس أشرف", gender: 'M', isFiller: true },
    { name: "شادي سامح", gender: 'M', isFiller: true },
    { name: "يوسف رأفت", gender: 'M', isFiller: true },
    { name: "مينا إيهاب", gender: 'M', isFiller: true },
    { name: "كيرلس فادي", gender: 'M', isFiller: true },
    { name: "فادي عادل", gender: 'M', isFiller: true },
    { name: "هاني نبيل", gender: 'M', isFiller: true },
    { name: "أبانوب شوقي", gender: 'M', isFiller: true },
    { name: "سامح مجدي", gender: 'M', isFiller: true },
    { name: "تامر فوزي", gender: 'M', isFiller: true },
    { name: "كريم رامي", gender: 'M', isFiller: true },
    { name: "مايكل نبيل", gender: 'M', isFiller: true },
    { name: "جورج فادي", gender: 'M', isFiller: true },
    { name: "مينا سامي", gender: 'M', isFiller: true },
    { name: "أندرو فؤاد", gender: 'M', isFiller: true },
    { name: "مينا شوقي", gender: 'M', isFiller: true },
    { name: "يوسف نبيل", gender: 'M', isFiller: true },
    { name: "رامي عادل", gender: 'M', isFiller: true },
    { name: "بولس فادي", gender: 'M', isFiller: true },
    { name: "بيشوي رأفت", gender: 'M', isFiller: true },
    { name: "ستيفن عادل", gender: 'M', isFiller: true },
    { name: "هيثم سامح", gender: 'M', isFiller: true },
    { name: "مينا لويس", gender: 'M', isFiller: true },
    { name: "فادي مجدي", gender: 'M', isFiller: true },
    { name: "مينا غبريال", gender: 'M', isFiller: true },
    { name: "أنطونيوس فؤاد", gender: 'M', isFiller: true },
    { name: "كريم سامي", gender: 'M', isFiller: true },
    // Extra 7
    { name: "ماجد سامي", gender: 'M', isFiller: true },
    { name: "عادل فوزي", gender: 'M', isFiller: true },
    { name: "سامي جرجس", gender: 'M', isFiller: true },
    { name: "ناجي نبيل", gender: 'M', isFiller: true },
    { name: "نبيل شاكر", gender: 'M', isFiller: true },
    { name: "شاكر فادي", gender: 'M', isFiller: true },
    { name: "جمال عادل", gender: 'M', isFiller: true },
];

export const BOYS_LIST = [...ORIG_BOYS, ...FILLER_BOYS];
export const GIRLS_LIST = [...ORIG_GIRLS, ...FILLER_GIRLS];

export const ALL_PEOPLE = [...BOYS_LIST, ...GIRLS_LIST];
