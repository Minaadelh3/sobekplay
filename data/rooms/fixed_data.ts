import { Assignment } from './types';

// Helper to create assignment
const A = (name: string, floor: 1 | 2 | 3, roomNum: number, bedIndex: number, hasKing: boolean = false): Assignment => {
    // Map room num to label directly as "Room X" to match layout.ts
    // If the input says "R1-3", it means Room 3.
    // Bed Label: if hasKing and bedIndex is 1 or 2 (assuming King takes 2 slots or just labeled King?)
    // The prompt says "King bed" is present.
    // I will just label beds "Bed 1", "Bed 2"... 
    // Is "King bed" a person? No, it's a feature.
    return {
        personName: name,
        floor,
        room: `Room ${roomNum}`,
        bedLabel: hasKing && bedIndex === 1 ? "King Bed" : `Bed ${bedIndex}`,
        view: roomNum <= 7 ? 'NILE' : 'SIDE'
    };
};

export const FIXED_ASSIGNMENTS: Assignment[] = [
    // --- FLOOR 1 ---
    // R1-3 (4 beds, King)
    A("تيا ناجى", 1, 3, 1, true),
    A("ايمى ناجى", 1, 3, 2, true),
    A("سارة ماجد", 1, 3, 3, true),
    A("كارين ايمن", 1, 3, 4, true),

    // R1-4 (3 beds)
    A("ساندرا ماهر صبرى", 1, 4, 1),
    A("جوسى فؤاد", 1, 4, 2),
    A("ليديا ايمن", 1, 4, 3),

    // R1-5 (4 beds, King) - List has 3 names
    A("نادين نادر", 1, 5, 1, true),
    A("ناردين نادر", 1, 5, 2, true),
    A("فيرينا مجدي", 1, 5, 3, true),

    // R1-6 (3 beds)
    A("ساندرا ماهر جرجس", 1, 6, 1),
    A("مارى ماهر", 1, 6, 2),
    A("مارى نبيل", 1, 6, 3),

    // R1-7 (3 beds) - List has 4 names? Layout says Room 7 has 3 beds.
    // Let's check layout.ts capacity: [3, 3, 4, 3, 4, 3, 3, 3, 3, 3]
    // Index 6 (Room 7) has 3 beds.
    // Provided list: فادى هانى, توماس بهاء, مارك ماجد, مينا ماهر جرجس (4 names)
    // REQUIRED: "Exact data provided". 
    // I must assign them. If capacity is exceeded, I should force it or update capacity in layout.
    // I will assign them to Room 7 regardless of layout capacity for now.
    A("فادى هانى", 1, 7, 1),
    A("توماس بهاء", 1, 7, 2),
    A("مارك ماجد", 1, 7, 3),
    A("مينا ماهر جرجس", 1, 7, 4), // Over capacity in current layout

    // R1-2 (3 beds)
    A("مايكل جورج", 1, 2, 1),
    A("فبرونيا", 1, 2, 2),

    // R1-8 (3 beds)
    A("استاذ ميخائيل يسرى", 1, 8, 1),
    A("اندرو أسامة", 1, 8, 2),
    A("مينا فايز شكرى", 1, 8, 3),

    // R1-1 (3 beds) - List has 4 names
    A("اندرو اميل", 1, 1, 1),
    A("فيلوباتير عاطف", 1, 1, 2),
    A("بيير سامح", 1, 1, 3),
    A("مينا منير", 1, 1, 4), // Over capacity

    // R1-9 (3 beds)
    A("بولا مرعى", 1, 9, 1),
    A("مونيكا سامى", 1, 9, 2),

    // R1-10 (3 beds)
    A("مينا عادل (دولا)", 1, 10, 1),
    A("ماريو عادل (لبانيتا)", 1, 10, 2),
    A("يوسف أيمن", 1, 10, 3),


    // --- FLOOR 2 ---
    // R1-3 -> Room 3
    A("بيشوى يوحنا", 2, 3, 1, true),
    A("ميريت نشأت", 2, 3, 2, true),
    A("انتونى بيشوى", 2, 3, 3, true),
    A("ديفيد بيشوى", 2, 3, 4, true),

    // R1-4 -> Room 4
    A("هيلين ميخائيل", 2, 4, 1),
    A("كورين عماد", 2, 4, 2),

    // R1-5 -> Room 5 (King) - 3 names + King
    A("هانى رأفت", 2, 5, 1, true),
    A("يوليانة وجيه", 2, 5, 2, true),
    A("بارثينا + دانيال", 2, 5, 3, true),

    // R1-6 -> Room 6
    A("مرثا يسرى + سليم", 2, 6, 1),
    A("ليديا منير", 2, 6, 2),

    // R1-7 -> Room 7 (4 names)
    A("جورج سامح صليب", 2, 7, 1),
    A("يوسف جورج عادل", 2, 7, 2),
    A("يوسف ميشيل مجدى", 2, 7, 3),
    A("فادى جورج", 2, 7, 4),

    // R1-2 -> Room 2
    A("استاذ طانيوس", 2, 2, 1),
    A("استاذ امجد", 2, 2, 2),
    A("ابرام رأفت", 2, 2, 3),

    // R1-8 -> Room 8
    A("سارة سامح", 2, 8, 1),
    A("كيرلس عاطف (بلبل)", 2, 8, 2),

    // R1-1 -> Room 1 (4 names)
    A("جورج مجدى", 2, 1, 1),
    A("مارينا ناجى", 2, 1, 2),
    A("ناجى جرجس", 2, 1, 3),
    A("سامية عطية", 2, 1, 4),

    // R1-9 -> Room 9
    A("ماجد سمير", 2, 9, 1),
    A("ميس ايلين يوسف", 2, 9, 2),

    // R1-10 -> Room 10
    A("فادى سمير", 2, 10, 1),
    A("ديانا بقطر", 2, 10, 2),


    // --- FLOOR 3 ---
    // R1-3 -> Room 3
    A("مينا هانى", 3, 3, 1, true),
    A("إيمان طلعت", 3, 3, 2, true),
    A("ناتالى مينا", 3, 3, 3, true),
    A("نيكول مينا", 3, 3, 4, true),

    // R1-4 -> Room 4
    A("مارى اميل", 3, 4, 1),
    A("فيولا سليم", 3, 4, 2),

    // R1-5 -> Room 5
    A("ايرينى وهيب", 3, 5, 1, true),
    A("مارينا هانى", 3, 5, 2, true),
    A("مونيكا هانى", 3, 5, 3, true),

    // R1-6 -> Room 6
    A("تالين نبيل", 3, 6, 1),
    A("منيرفا جورج", 3, 6, 2),
    A("انجيلا جورج", 3, 6, 3),

    // R1-7 -> Room 7 (4 names)
    A("مينا عادل (هلاك)", 3, 7, 1),
    A("اندرو رشدى", 3, 7, 2),
    A("يوسف ماجد", 3, 7, 3),
    A("جون جمال", 3, 7, 4),

    // R1-2 -> Room 2
    A("جون جورج", 3, 2, 1),
    A("كريستين صلاح", 3, 2, 2),
    A("دانيال جون", 3, 2, 3),

    // R1-8 -> Room 8
    A("ايرينى فيليب", 3, 8, 1),
    A("كارين ماجد", 3, 8, 2),
    A("شهيرة بطرس", 3, 8, 3),

    // R1-1 -> Room 1 (4 names)
    A("مينا فايق", 3, 1, 1),
    A("يوستينا عبد الملاك", 3, 1, 2),
    A("جوناثان مينا", 3, 1, 3),
    A("ديفيد مينا", 3, 1, 4),

    // R1-9 -> Room 9
    A("كريستين عادل", 3, 9, 1),
    A("بنيامين شكرى", 3, 9, 2),

    // R1-10 -> Room 10
    A("جورج عادل رمزى", 3, 10, 1),
    A("نيللى فتحى", 3, 10, 2),
];
