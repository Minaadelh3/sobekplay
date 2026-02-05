export type Difficulty = 'easy' | 'medium' | 'hard';
export type GameCategory = 'proverb' | 'verse' | 'logic' | 'who';

export interface Question {
    id: string;
    text: string;
    options: string[];
    correctAnswer: string;
    difficulty: Difficulty;
    category: GameCategory;
}

export const DIFFICULTY_RULES = {
    easy: { label: "سهل", time: 15, points: 10 },
    medium: { label: "متوسط", time: 12, points: 20 },
    hard: { label: "صعب", time: 10, points: 30 }
};

// --- A) PROVERBS (20) ---
export const PROVERBS: Question[] = [
    { id: "p001", category: "proverb", text: "اللي اختشوا …؟", options: ["ماتوا", "راحوا", "سابوا", "اختفوا"], correctAnswer: "ماتوا", difficulty: "easy" },
    { id: "p002", category: "proverb", text: "يدّي العيش …؟", options: ["لخبازه", "للي ياكله", "لللي يعجنه", "للصنايعي"], correctAnswer: "لخبازه", difficulty: "easy" },
    { id: "p003", category: "proverb", text: "اللي ما يعرفش يقول …؟", options: ["عدس", "فول", "حمص", "ملوخية"], correctAnswer: "عدس", difficulty: "easy" },
    { id: "p004", category: "proverb", text: "إبعد عن الشر …؟", options: ["وغنّي له", "وتغنّى", "واهرب", "وتفرّج"], correctAnswer: "وغنّي له", difficulty: "easy" },
    { id: "p005", category: "proverb", text: "الصبر مفتاح …؟", options: ["الفرج", "الخير", "النجاح", "البركة"], correctAnswer: "الفرج", difficulty: "easy" },
    { id: "p006", category: "proverb", text: "الجار قبل …؟", options: ["الدار", "الطريق", "الصحاب", "الأكل"], correctAnswer: "الدار", difficulty: "easy" },
    { id: "p007", category: "proverb", text: "ربنا يدّي …؟", options: ["اللي يدّي", "اللي ياخد", "اللي يصبر", "اللي يتعب"], correctAnswer: "اللي يدّي", difficulty: "easy" },
    { id: "p008", category: "proverb", text: "زي القطة …؟", options: ["بسبع أرواح", "بتتشقلب", "بتزوغ", "بتنام"], correctAnswer: "بسبع أرواح", difficulty: "easy" },
    { id: "p009", category: "proverb", text: "اللي على راسه بطحة …؟", options: ["يحسّس عليها", "يداريها", "يخبيها", "يضحك"], correctAnswer: "يحسّس عليها", difficulty: "easy" },
    { id: "p010", category: "proverb", text: "اتغدى بيه قبل ما …؟", options: ["يتعشّى بيك", "يبات عندك", "يسيبك", "يمشي"], correctAnswer: "يتعشّى بيك", difficulty: "medium" },
    { id: "p011", category: "proverb", text: "الوقت كالسيف إن لم تقطعه …؟", options: ["قطعك", "جرحك", "سابك", "كسبك"], correctAnswer: "قطعك", difficulty: "medium" },
    { id: "p012", category: "proverb", text: "خير الأمور …؟", options: ["أوسطها", "أولها", "آخرها", "أسهلها"], correctAnswer: "أوسطها", difficulty: "easy" },
    { id: "p013", category: "proverb", text: "اللي يحسبها صح …؟", options: ["يعملها صح", "يكسب", "يرتاح", "ميعكّش"], correctAnswer: "يرتاح", difficulty: "medium" },
    { id: "p014", category: "proverb", text: "حاميها …؟", options: ["حراميها", "قاضيها", "راعيها", "حارسها"], correctAnswer: "حراميها", difficulty: "easy" },
    { id: "p015", category: "proverb", text: "على قد لحافك …؟", options: ["مد رجليك", "شد رجليك", "اتغطى", "اتمدد"], correctAnswer: "مد رجليك", difficulty: "easy" },
    { id: "p016", category: "proverb", text: "أعمل خير وارميه …؟", options: ["في البحر", "في النيل", "في الطريق", "في الهوا"], correctAnswer: "في البحر", difficulty: "easy" },
    { id: "p017", category: "proverb", text: "إوعى وشك …؟", options: ["يبان", "يتكسر", "يحمر", "يضحك"], correctAnswer: "يبان", difficulty: "hard" },
    { id: "p018", category: "proverb", text: "اللي إيده في الميه مش زي …؟", options: ["اللي إيده في النار", "اللي إيده في الهوا", "اللي إيده في التراب", "اللي إيده في الزيت"], correctAnswer: "اللي إيده في النار", difficulty: "easy" },
    { id: "p019", category: "proverb", text: "من برّه هالله هالله ومن جوّه يعلم …؟", options: ["الله", "اللي خلقك", "ربنا", "اللي جواك"], correctAnswer: "الله", difficulty: "hard" },
    { id: "p020", category: "proverb", text: "الكتاب يُبان من …؟", options: ["عنوانه", "غلافه", "سطره", "كلمته"], correctAnswer: "عنوانه", difficulty: "medium" },
];

// --- B) VERSES (15) ---
export const VERSES: Question[] = [
    { id: "a001", category: "verse", text: "(وَقُل رَّبِّ زِدْنِي …)", options: ["عِلْمًا", "رِزْقًا", "نُورًا"], correctAnswer: "عِلْمًا", difficulty: "easy" },
    { id: "a002", category: "verse", text: "(إِنَّ مَعَ الْعُسْرِ …)", options: ["يُسْرًا", "فَرَجًا", "خَيْرًا"], correctAnswer: "يُسْرًا", difficulty: "easy" },
    { id: "a003", category: "verse", text: "(وَاذْكُر رَّبَّكَ كَثِيرًا وَسَبِّحْ …)", options: ["بِالْعَشِيِّ وَالإِبْكَارِ", "بِاللَّيْلِ وَالنَّهَارِ", "فِي كُلِّ حِين"], correctAnswer: "بِالْعَشِيِّ وَالإِبْكَارِ", difficulty: "hard" },
    { id: "a004", category: "verse", text: "(وَبِالْوَالِدَيْنِ …)", options: ["إِحْسَانًا", "رَحْمَةً", "مَعْرُوفًا"], correctAnswer: "إِحْسَانًا", difficulty: "easy" },
    { id: "a005", category: "verse", text: "(فَاذْكُرُونِي …)", options: ["أَذْكُرْكُمْ", "أُحِبَّكُمْ", "أَرْحَمْكُمْ"], correctAnswer: "أَذْكُرْكُمْ", difficulty: "medium" },
    { id: "a006", category: "verse", text: "(إِنَّ اللَّهَ مَعَ …)", options: ["الصَّابِرِينَ", "المُحْسِنِينَ", "المُؤْمِنِينَ"], correctAnswer: "الصَّابِرِينَ", difficulty: "easy" },
    { id: "a007", category: "verse", text: "(وَاسْتَعِينُوا بِالصَّبْرِ وَ …)", options: ["الصَّلَاةِ", "الدُّعَاءِ", "الذِّكْرِ"], correctAnswer: "الصَّلَاةِ", difficulty: "easy" },
    { id: "a008", category: "verse", text: "(اللَّهُ نُورُ السَّمَاوَاتِ وَ …)", options: ["الأرْضِ", "البِحَارِ", "الجِبَالِ"], correctAnswer: "الأرْضِ", difficulty: "easy" },
    { id: "a009", category: "verse", text: "(إِنَّ اللَّهَ غَفُورٌ …)", options: ["رَحِيمٌ", "كَرِيمٌ", "حَلِيمٌ"], correctAnswer: "رَحِيمٌ", difficulty: "easy" },
    { id: "a010", category: "verse", text: "(وَتَوَكَّلْ عَلَى اللَّهِ …)", options: ["وَكَفَى بِاللَّهِ وَكِيلًا", "وَكَفَى بِاللَّهِ حَسِيبًا", "وَكَفَى بِاللَّهِ شَهِيدًا"], correctAnswer: "وَكَفَى بِاللَّهِ وَكِيلًا", difficulty: "hard" },
    { id: "a011", category: "verse", text: "(رَبَّنَا آتِنَا فِي الدُّنْيَا …)", options: ["حَسَنَةً", "عِلْمًا", "رِزْقًا"], correctAnswer: "حَسَنَةً", difficulty: "easy" },
    { id: "a012", category: "verse", text: "(وَقُل لِّعِبَادِي يَقُولُوا …)", options: ["الَّتِي هِيَ أَحْسَنُ", "الصِّدْقَ", "الخَيْرَ"], correctAnswer: "الَّتِي هِيَ أَحْسَنُ", difficulty: "medium" },
    { id: "a013", category: "verse", text: "(وَلَا تَيْأَسُوا مِن …)", options: ["رَّوْحِ اللَّهِ", "رَحْمَةِ النَّاسِ", "خَيْرِ الدُّنْيَا"], correctAnswer: "رَّوْحِ اللَّهِ", difficulty: "hard" },
    { id: "a014", category: "verse", text: "(وَمَا تَوْفِيقِي إِلَّا …)", options: ["بِاللَّهِ", "بِنَفْسِي", "بِعِلْمِي"], correctAnswer: "بِاللَّهِ", difficulty: "medium" },
    { id: "a015", category: "verse", text: "(إِنَّ اللَّهَ يُحِبُّ …)", options: ["الْمُحْسِنِينَ", "الْمُتَكَبِّرِينَ", "الْغَافِلِينَ"], correctAnswer: "الْمُحْسِنِينَ", difficulty: "easy" },
];

// --- C) SOBEK INTELLIGENCE (Logic) (15) ---
export const LOGIC: Question[] = [
    { id: "s001", category: "logic", text: "لو A أكبر من B و B أكبر من C… مين أكبر واحد؟", options: ["A", "B", "C"], correctAnswer: "A", difficulty: "easy" },
    { id: "s002", category: "logic", text: "اختار الترتيب الصحيح للأرقام تصاعدي: 7, 2, 9", options: ["2-7-9", "7-2-9", "9-7-2"], correctAnswer: "2-7-9", difficulty: "easy" },
    { id: "s003", category: "logic", text: "أنا رقم زوجي بين 10 و 14… أنا مين؟", options: ["11", "12", "13", "15"], correctAnswer: "12", difficulty: "easy" },
    { id: "s004", category: "logic", text: "لو الساعة 3:00، بعد 2 ساعة تبقى؟", options: ["4:00", "5:00", "6:00"], correctAnswer: "5:00", difficulty: "easy" },
    { id: "s005", category: "logic", text: "اختار الشكل المختلف: 🔺 🔺 🔺 ⬛", options: ["الأول", "التاني", "التالت", "الرابع"], correctAnswer: "الرابع", difficulty: "easy" },
    { id: "s006", category: "logic", text: "لو عندك 3 تفاحات وخدت 1… فاضل كام؟", options: ["1", "2", "3", "4"], correctAnswer: "2", difficulty: "easy" },
    { id: "s007", category: "logic", text: "كلمة 'سوبك' عدد حروفها؟", options: ["2", "3", "4", "5"], correctAnswer: "4", difficulty: "easy" },
    { id: "s008", category: "logic", text: "أيهم بيكمّل السلسلة؟ 2, 4, 6, __", options: ["7", "8", "9"], correctAnswer: "8", difficulty: "easy" },
    { id: "s009", category: "logic", text: "لو كل مرة +3: 5 → 8 → 11 → __", options: ["12", "13", "14"], correctAnswer: "14", difficulty: "easy" },
    { id: "s010", category: "logic", text: "لو عندك 10 نقط وخسرت 4، فاضل؟", options: ["5", "6", "7"], correctAnswer: "6", difficulty: "easy" },
    { id: "s011", category: "logic", text: "أيهم أسرع ترتيبًا؟ (أ-ب-ج) ولا (ج-ب-أ)؟ الصحيح = الأبجدية", options: ["أ-ب-ج", "ج-ب-أ", "مفيش فرق"], correctAnswer: "أ-ب-ج", difficulty: "medium" },
    { id: "s012", category: "logic", text: "اختار الكلمة اللي مالهاش علاقة: نيل / بحر / شجرة / موج", options: ["نيل", "بحر", "شجرة", "موج"], correctAnswer: "شجرة", difficulty: "medium" },
    { id: "s013", category: "logic", text: "لو 4+4=8، يبقى 8+4=؟", options: ["10", "11", "12"], correctAnswer: "12", difficulty: "easy" },
    { id: "s014", category: "logic", text: "اختار الإجابة الصحيحة: يوم قبل الثلاثاء؟", options: ["الأحد", "الاثنين", "الأربعاء"], correctAnswer: "الاثنين", difficulty: "easy" },
    { id: "s015", category: "logic", text: "لو كلمة 'مصر' بالعكس؟", options: ["ر-ص-م", "م-ص-ر", "ر-م-ص"], correctAnswer: "ر-ص-م", difficulty: "medium" },
];

// Placeholder for 'Who is this' until provided
export const WHO: Question[] = [
    { id: 'w1', category: 'who', difficulty: 'easy', text: "مين هو مخترع المصباح الكهربائي؟", options: ["تيسلا", "إديسون", "أينشتاين", "جراهام بيل"], correctAnswer: "إديسون" },
    { id: 'w2', category: 'who', difficulty: 'easy', text: "أول من صعد للقمر هو؟", options: ["نيل أرمسترونج", "باز ألدرين", "يوري جاجارين", "مايكل كولينز"], correctAnswer: "نيل أرمسترونج" },
    { id: 'w3', category: 'who', difficulty: 'medium', text: "صاحب لقب 'عميد الأدب العربي'؟", options: ["نجيب محفوظ", "توفيق الحكيم", "طه حسين", "عباس العقاد"], correctAnswer: "طه حسين" }
];
