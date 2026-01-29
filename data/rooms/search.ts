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
    // First Names
    'mina': ['مينا'], 'mena': ['مينا'], 'meena': ['مينا'], 'minaa': ['مينا'],
    'monika': ['مونيكا'], 'monica': ['مونيكا'],
    'marina': ['مارينا'],
    'karen': ['كارين'],
    'youstina': ['يوستينا'], 'justina': ['يوستينا'],
    'david': ['ديفيد'],
    'george': ['جورج'],
    'michael': ['مايكل', 'ميخائيل'], 'mikhail': ['ميخائيل', 'مايكل'], 'mikael': ['مايكل'],
    'john': ['جون', 'يوحنا'], 'jonathan': ['جوناثان'],
    'andre': ['أندرو', 'اندرو'], 'andrew': ['أندرو', 'اندرو'],
    'thomas': ['توماس'], 'tomas': ['توماس'],
    'tony': ['أنتونى'], 'anthony': ['أنتونى'],
    'kyrillos': ['كيرلس'], 'kirillos': ['كيرلس'], 'kerlos': ['كيرلس'],
    'abraam': ['إبرام', 'ابرام'], 'ibraam': ['إبرام', 'ابرام'], 'ebram': ['إبرام', 'ابرام'],
    'peter': ['بيتر'],
    'bishoy': ['بيشوي'],
    'fady': ['فادي'],
    'mark': ['مارك'],
    'joseph': ['يوسف'], 'yousef': ['يوسف'],
    'mary': ['مريم', 'ماريا'], 'maria': ['ماريا', 'مريم'],
    'sara': ['سارة'], 'sarah': ['سارة'],
    'mirna': ['ميرنا'],
    'faby': ['فابي'],
    'martina': ['مارتينا'],
    'steven': ['ستيفن', 'استيفن'],
    'jessie': ['جيسي', 'جيسيان'],
    'lydia': ['ليديا'],
    'verina': ['فرينا'],
    'nardin': ['ناردين'],
    'helen': ['هيلين'],
    'marvi': ['مارفي'],
    'olivia': ['اوليفيا', 'أوليفيا'],
    'nariman': ['ناريمان'],
    'christine': ['كريستين'],
    'nermine': ['نيرمين'],
    'rita': ['ريتا'],
    'jessica': ['جيسيكا'],
    'angela': ['انجيلا', 'أنجيلا'],
    'judy': ['جودي'],
    'nancy': ['نانسي'],
    'merit': ['ميريت'],
    'dina': ['دينا'],
    'heba': ['هبة'],
    'sherine': ['شيرين'],
    'mariam': ['مريم'],
    'veronica': ['فيرونيكا'],
    'teresa': ['تريزا'],

    // Surnames (Derived from list)
    'fayek': ['فايق'],
    'abdelmalek': ['عبد الملاك'], 'malek': ['ملاك'],
    'yosry': ['يسري'], 'yousry': ['يسري'],
    'ashraf': ['اشرف', 'أشرف'],
    'ibrahim': ['ابراهيم', 'إبراهيم'],
    'magdy': ['مجدي', 'مجدى'],
    'faiz': ['فايز'], 'fayez': ['فايز'],
    'sobhy': ['صبحي', 'صبحى'],
    'hany': ['هاني', 'هانى'],
    'adly': ['عدلي', 'عدلى'],
    'nabil': ['نبيل'],
    'samir': ['سمير'],
    'rushdy': ['رشدي', 'رشد ى'],
    'adel': ['عادل'],
    'habib': ['حبيب'],
    'gamal': ['جمال'],
    'osama': ['اسامة', 'أسامة'],
    'tanios': ['طانيوس'],
    'maher': ['ماهر'],
    'gerges': ['جرجس'],
    'emad': ['عماد'],
    'karim': ['كريم'], 'kareem': ['كريم'],
    'maged': ['ماجد'],
    'bahaa': ['بهاء'],
    'safaa': ['صفاء'],
    'fawzy': ['فوزي', 'فوزى'],
    'boulos': ['بولس'], 'bolos': ['بولس'],
    'raafat': ['رأفت'],
    'tadros': ['تادرس'],
    'wael': ['وائل'],
    'nageh': ['ناجح'],
    'anwar': ['أنور', 'انور'],
    'tarek': ['طارق'],
    'fouad': ['فؤاد'],
    'samy': ['سامي', 'سامى'],
    'nader': ['نادر'],
    'shady': ['شادي', 'شادى'],
    'sameh': ['سامح'],
    'ramy': ['رامي', 'رامى'],
    'michel': ['ميشيل'],
    'ehab': ['ايهاب', 'إيهاب'],
    'shawky': ['شوقي', 'شوقى'],
    'tamer': ['تامر'],
    'haitham': ['هيثم'],
    'louis': ['لويس'],
    'gabrial': ['غبريال'],
    'antony': ['أنتونى', 'انطونيوس'], 'antonios': ['انطونيوس', 'أنطونيوس'],
    'shaker': ['شاكر'],
    'nagy': ['ناجي'],
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
