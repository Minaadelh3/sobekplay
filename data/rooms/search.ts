export interface SearchablePerson {
    original: string;
    normalized: string;
    aliases: string[]; // Arabic tokens derived from Latin map
}

// 1) Normalize Arabic (Strict)
export const normalizeArabic = (text: string): string => {
    return text
        .toLowerCase()
        .replace(/[أإآ]/g, 'ا')
        .replace(/ة/g, 'ه')
        .replace(/ى/g, 'ي')
        .replace(/ؤ/g, 'و')
        .replace(/ئ/g, 'ي')
        .replace(/[^\w\u0600-\u06FF]/g, '') // Remove punct
        .trim();
};

// 2) Normalize Latin
export const latinNormalize = (text: string): string => {
    return text
        .toLowerCase()
        .normalize("NFD").replace(/[\u0300-\u036f]/g, "")
        .replace(/[^a-z0-9]/g, '')
        .trim();
};

// 3) Transliteration Map (Expanding with Surnames)
const NAME_MAP: Record<string, string[]> = {
    // A
    'amgad': ['امجد', 'أمجد'],
    'amy': ['ايمى', 'إيمي', 'ايمي'],
    'andrew': ['اندرو', 'أندرو'], 'andre': ['اندرو'],
    'angela': ['انجيلا', 'أنجيلا'],
    'anthony': ['انتونى', 'أنتونى', 'انطونيوس'], 'tony': ['انتونى'],
    'abraam': ['ابرام', 'إبرام'], 'ebram': ['ابرام'],
    'adel': ['عادل'],
    'adly': ['عدلي', 'عدلى'],
    'anwar': ['انور', 'أنور'],
    'ashraf': ['اشرف', 'أشرف'],
    'atef': ['عاطف'],
    'ayman': ['ايمن', 'أيمن'],

    // B
    'bahaa': ['بهاء'],
    'benjamin': ['بنيامين'],
    'bishoy': ['بيشوي', 'بيشوى'],
    'boulos': ['بولس'], 'bolos': ['بولس'],
    'botros': ['بطرس'],
    'peter': ['بيتر'], 'pierre': ['بيير'], 'bola': ['بولا'], 'pola': ['بولا'],

    // C
    'caren': ['كارين'], 'karen': ['كارين'],
    'christine': ['كريستين'],
    'corinne': ['كورين'],
    'cyril': ['كيرلس'], 'kyrillos': ['كيرلس'], 'kerlos': ['كيرلس'], 'kirollos': ['كيرلس'],

    // D
    'daniel': ['دانيال'],
    'david': ['ديفيد'],
    'diana': ['ديانا'],
    'dina': ['دينا'],

    // E
    'eileen': ['ايلين', 'إيلين'],
    'emad': ['عماد'],
    'emil': ['اميل', 'إميل'],
    'ereny': ['ايريني', 'ايرينى', 'إيريني'], 'irene': ['ايرينى'],
    'ehab': ['ايهاب', 'إيهاب'],

    // F
    'fady': ['فادى', 'فادي'],
    'faiz': ['فايز'], 'fayez': ['فايز'],
    'fathy': ['فتحى', 'فتحي'],
    'febronia': ['فبرونيا'], 'febra': ['فبرونيا'],
    'philopateer': ['فيلوباتير'], 'philo': ['فيلوباتير'],
    'fayek': ['فايق'],
    'fouad': ['فؤاد'],
    'fawzy': ['فوزى', 'فوزي'],

    // G
    'gabrial': ['غبريال'],
    'gamal': ['جمال'],
    'george': ['جورج'],
    'gerges': ['جرجس'],

    // H
    'hany': ['هانى', 'هاني'],
    'helen': ['هيلين'],
    'haitham': ['هيثم'],
    'habib': ['حبيب'],

    // I
    'ibrahim': ['ابراهيم', 'إبراهيم'],
    'iman': ['ايمان', 'إيمان'],
    'isaac': ['اسحق', 'إسحق'],

    // J
    'jessie': ['جيسى', 'جيسي'],
    'jessica': ['جيسيكا'],
    'john': ['جون', 'يوحنا'],
    'jonathan': ['جوناثان'],
    'joseph': ['يوسف'], 'jo': ['يوسف'], 'yousef': ['يوسف'],
    'josie': ['جوسى', 'جوسي'],
    'joy': ['جوى'],
    'judy': ['جودى'],
    'juliana': ['يوليانة', 'يوليانا'],
    'justina': ['يوستينا'],

    // K
    'karim': ['كريم'], 'kareem': ['كريم'],
    'kiry': ['كيرى'],

    // L
    'louis': ['لويس'],
    'lydia': ['ليديا'],

    // M
    'maged': ['ماجد'],
    'magdy': ['مجدى', 'مجدي'],
    'maher': ['ماهر'],
    'malek': ['ملاك', 'عبد الملاك'], 'abdelmalek': ['عبد الملاك'],
    'marc': ['مارك'], 'mark': ['مارك'],
    'maria': ['ماريا'],
    'mariam': ['مريم'],
    'mario': ['ماريو'],
    'martha': ['مرثا'],
    'martina': ['مارتينا'],
    'marvi': ['مارفى', 'مارفي'],
    'mary': ['مارى', 'ماري'],
    'matthew': ['متى'],
    'merit': ['ميريت'],
    'michael': ['مايكل', 'ميخائيل'], 'mikhail': ['ميخائيل'],
    'michel': ['ميشيل'],
    'mina': ['مينا'],
    'minerva': ['منيرفا'],
    'mirna': ['ميرنا'],
    'miss': ['ميس'],
    'moheb': ['محب'],
    'monica': ['مونيكا'], 'monika': ['مونيكا'],
    'mounir': ['منير'],

    // N
    'nabil': ['نبيل'],
    'nadine': ['نادين'],
    'nady': ['نادى'],
    'nageh': ['ناجح'],
    'nagy': ['ناجى', 'ناجي'],
    'nancy': ['نانسى', 'نانسي'],
    'nardin': ['ناردين'],
    'nariman': ['ناريمان'],
    'nashat': ['نشأت'],
    'natalie': ['ناتالى', 'ناتالي'],
    'nelly': ['نيللى', 'نيللي'],
    'nermine': ['نيرمين'],
    'nicole': ['نيكول'],

    // O
    'olivia': ['اوليفيا'],
    'osama': ['اسامة', 'أسامة'],

    // P
    'parthenia': ['بارثينا'],
    'paul': ['بولس'],
    'paula': ['بولا'],

    // R
    'raafat': ['رأفت'],
    'ramy': ['رامى', 'رامي'],
    'ramzy': ['رمزى'],
    'rita': ['ريتا'],
    'robert': ['روبرت'],
    'rushdy': ['رشدى', 'رشدي'],

    // S
    'safaa': ['صفاء'],
    'salah': ['صلاح'],
    'sameh': ['سامح'],
    'samia': ['سامية'],
    'samir': ['سمير'],
    'samy': ['سامى', 'سامي'],
    'sandra': ['ساندرا'],
    'sara': ['سارة'], 'sarah': ['سارة'],
    'selim': ['سليم'],
    'shady': ['شادى', 'شادي'],
    'shahira': ['شهيرة'],
    'shaker': ['شاكر'],
    'shawky': ['شوقى'],
    'sherine': ['شيرين'],
    'shokry': ['شكرى', 'شكري'],
    'sobhy': ['صبحى', 'صبحي'],
    'steven': ['ستيفن'], 'stefan': ['ستيفن'],

    // T
    'tadros': ['تادرس'],
    'taleen': ['تالين'],
    'tamer': ['تامر'],
    'tanios': ['طانيوس'],
    'tarek': ['طارق'],
    'teresa': ['تريزا', 'تريزة'],
    'thomas': ['توماس'],
    'tia': ['تيا'],

    // V
    'verina': ['فيرينا', 'فرينا'], 'verena': ['فرينا'],
    'veronica': ['فيرونيكا'],
    'viola': ['فيولا'],

    // W
    'wael': ['وائل'],
    'wagih': ['وجيه'],
    'wahib': ['وهيب'],

    // Y
    'yohanna': ['يوحنا'],
    'yosry': ['يسرى', 'يسري'],
    'youstina': ['يوستينا'],
    'youssef': ['يوسف'],
};

// 4) Build Index (Run once)
export const buildIndex = (names: string[]): SearchablePerson[] => {
    return names.map(name => ({
        original: name,
        normalized: normalizeArabic(name),
        aliases: [] // We rely on query expansion instead of pre-calculating aliases here, effectively same result
    }));
};

// 5) Matching Rule
export const searchIndexedPeople = (query: string, index: SearchablePerson[]): string[] => {
    if (!query || query.length < 2) return [];

    const normQueryArabic = normalizeArabic(query);
    const normQueryLatin = latinNormalize(query);

    // Expand tokens: input "mina fayek" -> tokens ["mina", "fayek"] -> arabic tokens ["مينا", "فايق"]
    const expandedParts: string[] = [];

    // Parse query into tokens (handling spaces)
    const queryTokens = query.toLowerCase().split(/\s+/).filter(x => x);

    queryTokens.forEach(t => {
        const cleanT = latinNormalize(t);
        // Direct map lookup
        if (NAME_MAP[cleanT]) {
            expandedParts.push(...NAME_MAP[cleanT]);
        }
    });

    return index.filter(p => {
        // Match 1: Arabic Substring
        if (p.normalized.includes(normQueryArabic)) return true;

        // Match 2: Expanded tokens (Franco check)
        // If ALL query tokens match parts of the name (And-Search) or ANY (Or-Search)?
        // Requirement 5 Says: "a person matches if... any expanded Arabic token is substring..."
        // This implies OR. But "Mina Fayek" should match "Mina Fayek".
        // If I type "Mina", expanded "مينا". matches "مينا فايق".
        // If I type "Fayek", expanded "فايق", matches "مينا فايق".

        if (expandedParts.length > 0) {
            // Check if ANY expanded token is present
            return expandedParts.some(token => {
                const normToken = normalizeArabic(token);
                return p.normalized.includes(normToken);
            });
        }

        return false;
    }).map(p => p.original);
};
