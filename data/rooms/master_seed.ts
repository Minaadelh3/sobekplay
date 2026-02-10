import { Room } from './types';

export const MASTER_ROOMS_DATA: Room[] = [
    // --- Floor 1 (R1-X) ---
    {
        id: "F1_R1-7",
        floor: 1,
        roomCode: "R1-7",
        roomNumber: 7,
        capacity: 4,
        bedType: "normal",
        occupants: [
            { order: 1, fullName: "تيا ناجى" },
            { order: 2, fullName: "ايمى ناجى" },
            { order: 3, fullName: "سارة ماجد" },
            { order: 4, fullName: "كارين ايمن" }
        ]
    },
    {
        id: "F1_R1-6",
        floor: 1,
        roomCode: "R1-6",
        roomNumber: 6,
        capacity: 3,
        bedType: "normal",
        occupants: [
            { order: 1, fullName: "مارى نبيل" },
            { order: 2, fullName: "مارى ماهر" }
            // 3rd empty
        ]
    },
    {
        id: "F1_R1-5",
        floor: 1,
        roomCode: "R1-5",
        roomNumber: 5,
        capacity: 3,
        bedType: "king",
        occupants: [
            { order: 1, fullName: "نادين نادر" },
            { order: 2, fullName: "ناردين نادر" },
            { order: 3, fullName: "فيرينا مجدي" }
        ]
    },
    {
        id: "F1_R1-4",
        floor: 1,
        roomCode: "R1-4",
        roomNumber: 4,
        capacity: 3,
        bedType: "normal",
        occupants: [
            { order: 1, fullName: "ساندرا ماهر صبرى" },
            { order: 2, fullName: "جوسى فؤاد" },
            { order: 3, fullName: "ليديا ايمن" }
        ]
    },
    {
        id: "F1_R1-3",
        floor: 1,
        roomCode: "R1-3",
        roomNumber: 3,
        capacity: 4,
        bedType: "king",
        occupants: [] // EMPTY
    },
    {
        id: "F1_R1-2",
        floor: 1,
        roomCode: "R1-2",
        roomNumber: 2,
        capacity: 3,
        bedType: "normal",
        occupants: [
            { order: 1, fullName: "مايكل جورج" },
            { order: 2, fullName: "فبرونيا" }
            // 3rd empty
        ]
    },
    {
        id: "F1_R1-1",
        floor: 1,
        roomCode: "R1-1",
        roomNumber: 1,
        capacity: 4,
        bedType: "normal",
        occupants: [
            { order: 1, fullName: "اندرو اميل" },
            { order: 2, fullName: "فيلوباتير عاطف" },
            { order: 3, fullName: "بيير سامح" },
            { order: 4, fullName: "مينا منير" }
        ]
    },
    {
        id: "F1_R1-8",
        floor: 1,
        roomCode: "R1-8",
        roomNumber: 8,
        capacity: 3,
        bedType: "normal",
        occupants: [
            { order: 1, fullName: "استاذ ميخائيل يسرى" },
            { order: 2, fullName: "اندرو أسامة" },
            { order: 3, fullName: "مينا فايز شكرى" }
        ]
    },
    {
        id: "F1_R1-9",
        floor: 1,
        roomCode: "R1-9",
        roomNumber: 9,
        capacity: 2,
        bedType: "normal",
        occupants: [
            { order: 1, fullName: "بولا مرعى" },
            { order: 2, fullName: "مونيكا سامى" }
        ]
    },
    {
        id: "F1_R1-10",
        floor: 1,
        roomCode: "R1-10",
        roomNumber: 10,
        capacity: 3,
        bedType: "normal",
        occupants: [
            { order: 1, fullName: "مينا عادل (دولا)" },
            { order: 2, fullName: "ماريو عادل (لبانيتا)" },
            { order: 3, fullName: "يوسف أيمن" }
        ]
    },


    // --- Floor 2 (R1-X labels, but Floor=2) ---
    {
        id: "F2_R1-7",
        floor: 2,
        roomCode: "R1-7",
        roomNumber: 7,
        capacity: 4,
        bedType: "normal",
        occupants: [
            { order: 1, fullName: "جورج مجدي" },
            { order: 2, fullName: "مارينا ناجي" },
            { order: 3, fullName: "ناجي جرجس" },
            { order: 4, fullName: "سامية عطية" }
        ]
    },
    {
        id: "F2_R1-6",
        floor: 2,
        roomCode: "R1-6",
        roomNumber: 6,
        capacity: 3,
        bedType: "normal",
        occupants: [
            { order: 1, fullName: "مرثا يسري + سليم" },
            { order: 2, fullName: "ليديا منير" },
            { order: 3, fullName: "يوسف ميشيل مجدي" }
        ]
    },
    {
        id: "F2_R1-5",
        floor: 2,
        roomCode: "R1-5",
        roomNumber: 5,
        capacity: 3,
        bedType: "king",
        occupants: [
            { order: 1, fullName: "هالي رأفت" },
            { order: 2, fullName: "بولينا وجيه" },
            { order: 3, fullName: "مارثا + دانيال" }
        ]
    },
    {
        id: "F2_R1-4",
        floor: 2,
        roomCode: "R1-4",
        roomNumber: 4,
        capacity: 3,
        bedType: "normal",
        occupants: [
            { order: 1, fullName: "فيلين ميخائيل" },
            { order: 2, fullName: "كوريين عماد" }
            // 3rd empty
        ]
    },
    {
        id: "F2_R1-3",
        floor: 2,
        roomCode: "R1-3",
        roomNumber: 3,
        capacity: 4,
        bedType: "king",
        occupants: [
            { order: 1, fullName: "بيشوى يوحنا" },
            { order: 2, fullName: "ميريت نشأت" },
            { order: 3, fullName: "انطوني بيشوى" },
            { order: 4, fullName: "ديفيد بيشوى" }
        ]
    },
    {
        id: "F2_R1-2",
        floor: 2,
        roomCode: "R1-2",
        roomNumber: 2,
        capacity: 2,
        bedType: "normal",
        occupants: [
            { order: 1, fullName: "سارة سامح" },
            { order: 2, fullName: "كيرلس عاطف (بلبل)" }
        ]
    },
    {
        id: "F2_R1-1",
        floor: 2,
        roomCode: "R1-1",
        roomNumber: 1,
        capacity: 4,
        bedType: "normal",
        occupants: [
            { order: 1, fullName: "يوسف جورج عادل" },
            { order: 2, fullName: "وسيم ماجد" },
            { order: 3, fullName: "فادى جورج" },
            { order: 4, fullName: "جورج سامح صليب" }
        ]
    },
    {
        id: "F2_R1-8",
        floor: 2,
        roomCode: "R1-8",
        roomNumber: 8,
        capacity: 3,
        bedType: "normal",
        occupants: [
            { order: 1, fullName: "استاذ طانيوس" },
            { order: 2, fullName: "استاذ امجد" },
            { order: 3, fullName: "ابرام رأفت" }
        ]
    },
    {
        id: "F2_R1-9",
        floor: 2,
        roomCode: "R1-9",
        roomNumber: 9,
        capacity: 2,
        bedType: "normal",
        occupants: [
            { order: 1, fullName: "ماجد سمير" },
            { order: 2, fullName: "ميس ايلين يوسف" }
        ]
    },
    {
        id: "F2_R1-10",
        floor: 2,
        roomCode: "R1-10",
        roomNumber: 10,
        capacity: 3,
        bedType: "normal",
        occupants: [
            { order: 1, fullName: "فادى سمير" },
            { order: 2, fullName: "ديانا بقطر" }
            // 3rd empty
        ]
    },


    // --- Floor 3 (R1-X labels, but Floor=3) ---
    {
        id: "F3_R1-7",
        floor: 3,
        roomCode: "R1-7",
        roomNumber: 7,
        capacity: 4,
        bedType: "normal",
        occupants: [
            { order: 1, fullName: "مينا فايق" },
            { order: 2, fullName: "يوستينا عبد الملاك" },
            { order: 3, fullName: "جوناثان مينا" },
            { order: 4, fullName: "ديفيد مينا" }
        ]
    },
    {
        id: "F3_R1-6",
        floor: 3,
        roomCode: "R1-6",
        roomNumber: 6,
        capacity: 3,
        bedType: "normal",
        occupants: [
            { order: 1, fullName: "تالين نبيل" },
            { order: 2, fullName: "منيرفا جورج" },
            { order: 3, fullName: "ساندرا ماهر جرجس" }
        ]
    },
    {
        id: "F3_R1-5",
        floor: 3,
        roomCode: "R1-5",
        roomNumber: 5,
        capacity: 3,
        bedType: "king",
        occupants: [
            { order: 1, fullName: "ايرينى وهيب" },
            { order: 2, fullName: "مارينا هانى" },
            { order: 3, fullName: "مونيكا هانى" }
        ]
    },
    {
        id: "F3_R1-4",
        floor: 3,
        roomCode: "R1-4",
        roomNumber: 4,
        capacity: 3,
        bedType: "normal",
        occupants: [
            { order: 1, fullName: "جون جورج" },
            { order: 2, fullName: "كريستين صلاح" },
            { order: 3, fullName: "دانيال جون" }
        ]
    },
    {
        id: "F3_R1-3",
        floor: 3,
        roomCode: "R1-3",
        roomNumber: 3,
        capacity: 4,
        bedType: "king",
        occupants: [
            { order: 1, fullName: "مينا هانى" },
            { order: 2, fullName: "ايمان طلعت" },
            { order: 3, fullName: "ناتالى مينا" },
            { order: 4, fullName: "نيكول مينا" }
        ]
    },
    {
        id: "F3_R1-2",
        floor: 3,
        roomCode: "R1-2",
        roomNumber: 2,
        capacity: 3,
        bedType: "normal",
        occupants: [
            { order: 1, fullName: "مارى اميل" },
            { order: 2, fullName: "فيولا سليم" }
            // 3rd empty
        ]
    },
    {
        id: "F3_R1-1",
        floor: 3,
        roomCode: "R1-1",
        roomNumber: 1,
        capacity: 4,
        bedType: "normal",
        occupants: [
            { order: 1, fullName: "مينا عادل (هلاك)" },
            { order: 2, fullName: "اندرو رشدى" },
            { order: 3, fullName: "يوسف ماجد" },
            { order: 4, fullName: "جون جمال" }
        ]
    },
    {
        id: "F3_R1-8",
        floor: 3,
        roomCode: "R1-8",
        roomNumber: 8,
        capacity: 3,
        bedType: "normal",
        occupants: [
            { order: 1, fullName: "ايرينى فيليب" },
            { order: 2, fullName: "كارين ماجد" },
            { order: 3, fullName: "شهيرة بطرس" }
        ]
    },
    {
        id: "F3_R1-9",
        floor: 3,
        roomCode: "R1-9",
        roomNumber: 9,
        capacity: 2,
        bedType: "normal",
        occupants: [
            { order: 1, fullName: "كريستين عادل" },
            { order: 2, fullName: "بنيامين شكرى" }
        ]
    },
    {
        id: "F3_R1-10",
        floor: 3,
        roomCode: "R1-10",
        roomNumber: 10,
        capacity: 2,
        bedType: "normal",
        occupants: [
            { order: 1, fullName: "جورج عادل رمزى" },
            { order: 2, fullName: "نيللى فتحى" }
        ]
    },


    // --- Floor 4 ---
    {
        id: "F4_R4-8",
        floor: 4,
        roomCode: "R4-8",
        roomNumber: 8,
        capacity: 3,
        bedType: "normal",
        occupants: [
            { order: 1, fullName: "توماس بهاء" },
            { order: 2, fullName: "فادى هانى" },
            { order: 3, fullName: "كريم عادل" }
        ]
    },
    {
        id: "F4_R4-9",
        floor: 4,
        roomCode: "R4-9",
        roomNumber: 9,
        capacity: 0, // "0 or capacity inferred... occupants=[]" - let's set 0 or default since empty
        bedType: "normal",
        occupants: [] // EMPTY
    },
    {
        id: "F4_R4-10",
        floor: 4,
        roomCode: "R4-10",
        roomNumber: 10,
        capacity: 2,
        bedType: "normal",
        occupants: [
            { order: 1, fullName: "مينا ماهر جرجس" },
            { order: 2, fullName: "مارك ماجد" }
        ]
    }
];
