import { SmartLevel } from '../types/SmartGameTypes';

export const SMART_GAMES_DATA: SmartLevel[] = [
    {
        id: 1,
        type: 'detective',
        title: 'التاجر الطماع',
        difficulty: 'Easy',
        description: 'في السوق القديم، تاجر ادعى إن كيس الذهب بتاعه اتسرق. الحرامي اتشاف بيجري ناحية القصر.',
        xpReward: 100,
        content: {
            question: 'من الكاذب؟',
            suspects: [
                { id: 'hassan', name: 'حسن (صبي التاجر)', statement: 'أنا كنت بجري عشان ألحق صلاة الجمعة في الجامع الكبير!' },
                { id: 'mina', name: 'مينا (الشيال)', statement: 'أنا كنت شايل سجاد تقيل جداً وبودي طلبية للقصر، مقدرش أجري أصلاً.' }
            ],
            correctAnswer: 'hassan',
            explanation: 'السرقة حصلت العصر (والسوق شغال). صلاة الجمعة بتكون وقت الضهر. حسن بيكدب عشان يبرر جريه.',
            hint: 'ركز في توقيت الصلاة.'
        }
    },
    {
        id: 2,
        type: 'logic',
        title: 'الرقم الناقص',
        difficulty: 'Easy',
        description: 'كمل التسلسل المنطقي للأرقام دي.',
        xpReward: 50,
        content: {
            question: '2, 5, 10, 17, ... ؟',
            options: ['24', '25', '26', '27'],
            correctAnswer: 2, // Index of '26'
            explanation: 'النمط هو زيادة أرقام فردية متتالية: (+3)، (+5)، (+7). الخطوة الجاية (+9). 17 + 9 = 26.',
            hint: 'شوف الفرق بين كل رقم واللي بعده.'
        }
    },
    {
        id: 3,
        type: 'trivia',
        title: 'فضيلة مارجرجس',
        difficulty: 'Easy',
        description: 'مارجرجس أمير الشهداء، مشهور بفضيلة معينة غير الشجاعة.',
        xpReward: 75,
        content: {
            question: 'إيه أكتر فضيلة بتميّز مارجرجس في سيرته؟',
            options: ['إخفاء الإيمان', 'الشجاعة والاعتراف', 'تأليف الكتب', 'بناء الأديرة'],
            correctAnswer: 1,
            explanation: 'مارجرجس مشهور بلقب "أمير الشهداء" لشجاعته الفائقة في الاعتراف بإيمانه أمام الملوك وعدم إنكاره رغم العذابات.',
            hint: 'لقبه "أمير الشهداء".'
        }
    },
    {
        id: 4,
        type: 'detective',
        title: 'الشارع المبلول',
        difficulty: 'Easy',
        description: 'واحد بيقول إنه ركن عربيته هنا من 5 دقايق بس. الدنيا كانت بتمطر بقالها ساعتين.',
        xpReward: 100,
        content: {
            question: 'هل هو صادق؟',
            image: '/assets/games/wet_street_car.png', // Placeholder logic
            options: ['صادق', 'كاذب'],
            correctAnswer: 1, // Kazzeb
            explanation: 'لو كان ركن من 5 دقايق بس، كانت الأرض تحت العربية هتكون مبلولة زى باقي الشارع. لكن لو الأرض ناشفة تحته، يبقى هو راكن من قبل المطر ما يبدأ.',
            hint: 'بص على الأرض تحت العربية.'
        }
    },
    {
        id: 5,
        type: 'observation',
        title: 'عين الصقر',
        difficulty: 'Medium',
        description: 'عد المثلثات في الشكل ده.',
        xpReward: 150,
        content: {
            question: 'كام مثلث في الشكل؟',
            image: 'triangle_puzzle', // Can use code to render SVG
            options: ['10', '12', '13', '15'],
            correctAnswer: 2, // 13
            explanation: 'فيه 9 مثلثات صغيرة، 3 متوسطين، و 1 كبير شامل. المجموع 13.',
            hint: 'متنساش المثلث الكبير خالص والمثلثات المقلوبة.'
        }
    },
    {
        id: 6,
        type: 'puzzle',
        title: 'أب الرهبان',
        difficulty: 'Easy',
        description: 'رتب الحروف عشان تكون اسم قديس عظيم.',
        xpReward: 100,
        content: {
            question: 'كون الاسم: (ن - ط - أ - و - ن - ي - و - س)',
            correctAnswer: 'انطونيوس',
            explanation: 'القديس العظيم الأنبا أنطونيوس، أب الرهبان.',
            hint: 'أول راهب في البرية.'
        }
    },
    {
        id: 7,
        type: 'detective',
        title: 'زائر منتصف الليل',
        difficulty: 'Medium',
        description: 'حارس ليلي بيقول: "أنا شفت الحرامي الساعة 12 بليل، ضوء القمر كان قوي جداً وشفت الكوفية الحمرا بتاعته."',
        xpReward: 125,
        content: {
            question: 'هل نصدقه؟',
            options: ['نصدقه', 'كاذب'],
            correctAnswer: 1,
            explanation: 'الليلة دي كانت ليلة "المحاق" (New Moon) يعني مفيش قمر أصلاً. الحارس بيكدب.',
            hint: 'راجع نتيجة الشهر القمري.'
        }
    },
    {
        id: 8,
        type: 'puzzle',
        title: 'سودوكو دليفري',
        difficulty: 'Medium',
        description: 'أكمل الرقم الناقص في المربع عشان الصف والعمود ميكونش فيهم تكرار.',
        xpReward: 150,
        content: {
            question: 'الشبكة: [1,2,?,4] .. الرقم الناقص؟',
            correctAnswer: '3',
            explanation: 'الأرقام من 1 لـ 4 لازم تظهر مرة واحدة في كل صف وعمود.',
            hint: 'كل الأرقام موجودة إلا ده.'
        }
    },
    {
        id: 9,
        type: 'logic',
        title: 'سباق الجري',
        difficulty: 'Easy',
        description: 'مسابقة جري.',
        xpReward: 100,
        content: {
            question: 'لو أنت بتجري وسبقت الشخص اللي في المركز التاني.. يبقى أنت مركزك كام دلوقتي؟',
            options: ['الأول', 'التاني', 'التالت'],
            correctAnswer: 1, // 2nd
            explanation: 'لما تسبق التاني، أنت بتاخد مكانه، فبتبقى أنت التاني (مش الأول).',
            hint: 'تخيلها.. هو كان التاني، وأنت عديته.'
        }
    },
    {
        id: 10,
        type: 'logic',
        title: 'ترتيب الأحداث',
        difficulty: 'Medium',
        description: 'رتب الأحداث الكتابية دي تاريخياً من الأقدم للأحدث.',
        xpReward: 150,
        content: {
            question: 'الطوفان - القيامة - الخروج - الخلق',
            options: [
                'الخلق - الطوفان - الخروج - القيامة',
                'الطوفان - الخلق - الخروج - القيامة',
                'الخلق - الخروج - الطوفان - القيامة'
            ],
            correctAnswer: 0,
            explanation: '1. الخلق (آدم) -> 2. الطوفان (نوح) -> 3. الخروج (موسى) -> 4. القيامة (المسيح).',
            hint: 'البداية خالص مع آدم.'
        }
    },
    {
        id: 11,
        type: 'detective',
        title: 'العشب النادر',
        difficulty: 'Medium',
        description: 'دكتور في قرية نائية بيقول إنه عالج مريض باستخدام "عشب نادر جداً" لقى منه ورقة واحدة بس امبارح.',
        xpReward: 150,
        content: {
            question: 'ليه دي كذبة؟',
            image: '/assets/games/plastic_plant.jpg',
            correctAnswer: 'العشب بلاستيك',
            explanation: 'لو بصيت كويس في الصورة، العشب ده بلاستيك (صناعي) وعليه "Bar code" صغير في الفرع.',
            hint: 'بص كويس على ساق النبات.'
        }
    },
    {
        id: 12,
        type: 'logic',
        title: 'الانعكاس',
        difficulty: 'Hard',
        description: 'أي شكل من دول هو انعكاس كلمة SOBEK في المرايا؟',
        xpReward: 200,
        content: {
            question: 'اختر الانعكاس الصحيح',
            options: ['SOBEK', 'KEBOS', 'ꓘƎꓭOꓢ'],
            correctAnswer: 2,
            explanation: 'المرايا بتعكس الصور أفقياً (Lateral Inversion).',
            hint: 'الحروف لازم تكون مقلوبة يمين وشمال.'
        }
    },
    {
        id: 13,
        type: 'trivia',
        title: 'صوم يونان',
        difficulty: 'Easy',
        description: 'يونان النبي قعد في بطن الحوت فترة.',
        xpReward: 75,
        content: {
            question: 'كام يوم قضاهم يونان في بطن الحوت؟',
            options: ['3 أيام', '7 أيام', '40 يوم', 'يوم واحد'],
            correctAnswer: 0,
            explanation: 'يونان قعد 3 أيام و 3 ليالي في جوف الحوت، رمزاً لصلب وقيامة المسيح.',
            hint: 'رمز القيامة.'
        }
    },
    {
        id: 14,
        type: 'logic',
        title: 'ظل الظهيرة',
        difficulty: 'Hard',
        description: 'الساعة 12 الظهر بالضبط في مصر (الصيف).',
        xpReward: 150,
        content: {
            question: 'لو عود خشب واقف عمودي.. ظله هيكون فين؟',
            options: ['طويل جداً للغرب', 'طويل جداً للشرق', 'قصير جداً تحته'],
            correctAnswer: 2,
            explanation: 'في الظهيرة (تعامد الشمس)، الظل بيكون أقصر ما يمكن وبيكون تحت الجسم مباشرة.',
            hint: 'الشمس فوق دماغك بالظبط.'
        }
    },
    {
        id: 15,
        type: 'puzzle',
        title: 'الكود الأخير',
        difficulty: 'Hard',
        description: 'فك الشفرة دي: A=1, B=2, C=3...',
        xpReward: 300,
        content: {
            question: '19 - 15 - 2 - 5 - 11',
            correctAnswer: 'SOBEK',
            explanation: 'S=19, O=15, B=2, E=5, K=11.',
            hint: 'حروف اسم اللعبة.'
        }
    }
];
