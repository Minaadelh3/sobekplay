import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';

const ElKhelwaView: React.FC = () => {
    const [reflection1, setReflection1] = useState('');
    const [reflection2, setReflection2] = useState('');
    const [reflection3, setReflection3] = useState('');

    useEffect(() => {
        const savedReflection1 = localStorage.getItem('elkhelwa_reflection1');
        const savedReflection2 = localStorage.getItem('elkhelwa_reflection2');
        const savedReflection3 = localStorage.getItem('elkhelwa_reflection3');

        if (savedReflection1) setReflection1(savedReflection1);
        if (savedReflection2) setReflection2(savedReflection2);
        if (savedReflection3) setReflection3(savedReflection3);
    }, []);

    const handleSave = (key: string, value: string) => {
        if (key === 'elkhelwa_reflection1') setReflection1(value);
        if (key === 'elkhelwa_reflection2') setReflection2(value);
        if (key === 'elkhelwa_reflection3') setReflection3(value);
        localStorage.setItem(key, value);
    };

    return (
        <div className="max-w-3xl mx-auto p-4 md:p-8 text-right font-serif" style={{ direction: 'rtl' }}>

            {/* Disclaimer */}
            <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white/5 border border-white/10 rounded-xl p-4 mb-8 text-center"
            >
                <p className="text-gray-400 text-sm">
                    🔒 <span className="font-bold text-accent-gold">تنويه هام:</span>
                    كل ما تكتبه هنا هو خاص بك تماماً ومحفوظ على جهازك الشخصي فقط. لا أحد يمكنه الاطلاع عليه. اكتب بحرية وراحة.
                </p>
            </motion.div>

            {/* Title Section */}
            <motion.header
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="text-center mb-12"
            >
                <h1 className="text-4xl md:text-5xl font-black text-white mb-4 leading-tight">
                    الخلوة الفردية
                </h1>
                <p className="text-xl text-gray-300">
                    "انظروا .. إلى طيور السماء"
                </p>
            </motion.header>

            {/* Story Section */}
            <motion.section
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.2 }}
                className="mb-12 bg-[#0F1218] rounded-2xl p-6 md:p-8 border border-white/5 shadow-lg"
            >
                <div className="prose prose-invert prose-lg max-w-none text-gray-200 leading-loose">
                    <p className="mb-6 text-lg">
                        يحكي أبينا الحبيب المتنيح <span className="text-accent-gold font-bold">قداسة البابا شنودة الثالث</span> قصة حدثت معه وهو راهب ويقول:
                    </p>
                    <p className="mb-4">
                        "كنت جالساً أمام قلايتي في حديقة الدير، وكانت على الأرض بعض الحبوب، لعلها سقطت من أحد عمال المزرعة. وأتت عصفورة لتلتقط الحب وظننت أنها ستأكل حتى تشبع من هذه المؤنة .. ولكنها التقطت حبة واحدة أو حبتين وطارت تاركة كل هذا الخير ورأها غير حافلة به وغير آسفة عليه .."
                    </p>
                    <p className="mb-4">
                        "وأخذت منها درساً في القناعة وفي التجرد وتذكرت قول الرب أنها <span className="text-accent-gold font-bold">"لا تزرع ولا تحصد .. وأبوكم السماوى يقوتها"</span> فنظرت لنفسي وقلت: هذه العصفورة أكثر إيماناً مني .. فهي لم تقبع إلى جوار الخير المادي ولم تتخلي عن حريتها وتحليقها في السماء."
                    </p>
                </div>
            </motion.section>

            {/* Hymn Section */}
            <motion.section
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.3 }}
                className="mb-12 text-center"
            >
                <p className="text-gray-400 mb-6 italic">
                    دور على مكان هادي اقعد فيه لوحدك .. وتعال نرنم بهدوء الترنيمة دي
                </p>
                <div className="bg-gradient-to-br from-indigo-900/20 to-purple-900/20 p-8 rounded-3xl border border-white/10 relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-accent-gold/5 rounded-full blur-3xl"></div>
                    <div className="absolute bottom-0 left-0 w-32 h-32 bg-blue-500/5 rounded-full blur-3xl"></div>

                    <div className="relative z-10 space-y-6 text-xl md:text-2xl font-medium text-white leading-relaxed">
                        <p>هارمي كل اتكالي عليك وعلي كلامك هارمي الشبكة</p>
                        <p>كل حياتي ملك ايديك ايد مين غيرك تدي البركة</p>
                        <div className="h-4"></div>
                        <p>انا سلمتك كل حياتي وبقول دايما تبقي مشيئتك</p>
                        <p>اصل انا حتي بقلبي الخاطي جربت حنانك وعرفتك</p>
                        <div className="h-4"></div>
                        <p>كلي يقين ان انت معايا واثق فـ اللي بتختاره ليا</p>
                        <p>مانت في ضعفي بتبقي حماية وطريق الخير ترسمه ليا</p>
                        <div className="h-4"></div>
                        <p>قلبي بيصرخلك وينادي انك تقبل تدخل بيتي</p>
                        <p>وان كنت انا بعتك في الماضي بارك انت العمر الاتي</p>
                    </div>
                </div>
            </motion.section>

            {/* Reading Section */}
            <motion.section
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.4 }}
                className="mb-12"
            >
                <div className="flex items-center gap-4 mb-6">
                    <div className="h-[1px] bg-white/10 flex-1"></div>
                    <h2 className="text-2xl font-bold text-accent-gold">📖 إنجيل متى ٦ : ٢٦ – ٣٤</h2>
                    <div className="h-[1px] bg-white/10 flex-1"></div>
                </div>

                <div className="bg-[#1A1D24] p-6 rounded-xl border-l-4 border-accent-gold mb-8">
                    <p className="text-gray-300 text-lg leading-relaxed mb-4">
                        "انْظُرُوا إِلَى طُيُورِ السَّمَاءِ: إِنَّهَا لاَ تَزْرَعُ وَلاَ تَحْصُدُ وَلاَ تَجْمَعُ إِلَى مَخَازِنَ، وَأَبُوكُمُ السَّمَاوِيُّ يَقُوتُهَا. أَلَسْتُمْ أَنْتُمْ بِالْحَرِيِّ أَفْضَلَ مِنْهَا؟
                        وَمَنْ مِنْكُمْ إِذَا اهْتَمَّ يَقْدِرُ أَنْ يَزِيدَ عَلَى قَامَتِهِ ذِرَاعًا وَاحِدَةً؟...
                        فَلاَ تَهْتَمُّوا قَائِلِينَ: مَاذَا نَأْكُلُ؟ أَوْ مَاذَا نَشْرَبُ؟ أَوْ مَاذَا نَلْبَسُ؟...
                        لأَنَّ أَبَاكُمُ السَّمَاوِيَّ يَعْلَمُ أَنَّكُمْ تَحْتَاجُونَ إِلَى هذِهِ كُلِّهَا.
                        لكِنِ اطْلُبُوا أَوَّلاً مَلَكُوتَ اللهِ وَبِرَّهُ، وَهذِهِ كُلُّهَا تُزَادُ لَكُمْ."
                    </p>
                    <p className="text-sm text-gray-500 text-left w-full block mt-2">
                        (اقرأ النص الكامل في كتابك المقدس)
                    </p>
                </div>

                <div className="space-y-4">
                    <label className="block text-lg font-medium text-white mb-2">
                        ✍️ سجل هنا الآيات اللي لفتت نظرك واتكلمت لقلبك:
                    </label>
                    <textarea
                        value={reflection1}
                        onChange={(e) => handleSave('elkhelwa_reflection1', e.target.value)}
                        placeholder="اكتب هنا..."
                        className="w-full bg-[#0F1218] border border-white/10 rounded-xl p-4 text-white text-lg min-h-[120px] focus:ring-2 focus:ring-accent-gold outline-none transition-all placeholder-gray-600"
                    />
                </div>
            </motion.section>

            {/* Reflection 2 */}
            <motion.section
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5 }}
                className="mb-12"
            >
                <div className="prose prose-invert max-w-none mb-6">
                    <p className="text-xl leading-loose text-gray-200">
                        فكرت مرة إيه اللي بيخلي طيور السما تطير فوق .. ارفع عينك للسما واتأمل بتعمل ايه .. تفضل تحرك جناحها علي اد ما تقدر وفجأة تلاقيها فردته بمنتهي الثقة .. ونزلت تاكل اللي ربنا بعته وترجع تطير.
                        <br /><br />
                        مانت لو مش بتحرك جناحك بصلاتك وجهادك ف مخدعك عمرك ما هتقدر تاخد النعمة اللي تخليك تفرد جناحك بثقة ..
                        <br />
                        سلم حياتك وافرد جناحك بثقة هتلاقي ربنا يساعدك علي الطيران وها تلاقي إن أي حاجة علي الأرض زي الانشغالات؛ والمشاكل والضغوطات .. بقت صغيرة خالص وانت مش شايفها..
                    </p>
                </div>

                <div className="bg-indigo-900/10 p-6 rounded-xl border border-indigo-500/20 mb-6">
                    <p className="text-indigo-200 italic text-center text-lg">
                        ارفع قلبك بصلاة قصيرة واطلب من ربنا معونة تسندك وتساعدك انك تسلم له كل حياتك بثقة وإيمان
                    </p>
                </div>

                <div className="space-y-4 pt-6 border-t border-white/5">
                    <p className="text-lg text-gray-300">
                        اعتقد لو قعدت مع نفسك دقيقة واحدة و فكرت كام مرة ضيعت وقت وحسبتها بمخك والحسبة باظت بس لما سلمتها لربنا الموضوع اختلف .. فكر كام موقف عدي عليك بالشكل ده ..
                    </p>
                    <label className="block text-lg font-medium text-white mb-2">
                        اكتب هنا علشان تفكر نفسك بأمانة ربنا معاك في كل وقت ..
                    </label>
                    <textarea
                        value={reflection2}
                        onChange={(e) => handleSave('elkhelwa_reflection2', e.target.value)}
                        placeholder="مواقف وتأملات..."
                        className="w-full bg-[#0F1218] border border-white/10 rounded-xl p-4 text-white text-lg min-h-[120px] focus:ring-2 focus:ring-accent-gold outline-none transition-all placeholder-gray-600"
                    />
                </div>
            </motion.section>

            {/* Application Section */}
            <motion.section
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.6 }}
                className="mb-16"
            >
                <div className="prose prose-invert max-w-none mb-8">
                    <p className="text-lg leading-loose">
                        خدت بالك مرة ف أواشي القداس وأبونا بيقول <span className="text-accent-gold font-bold">"ودبر حياتنا كما يليق"</span> كام مرة لما سمعتها رفعت عينك علي الصليب وقلتله بايمان دبر حياتي يارب كما يليق .. صدقني مش هتلاقي احلي من اللي ربنا مدبرهولك.
                        <br />
                        بص علي المية جمبك كدة وافتكر بطرس لما كان ماشي علي المية وشك فبدل مايبص لربنا بص تحته .. فاكر حصله ايه .. اوعي تحول عينك عنه وعمرك ما هتغرق.
                    </p>
                </div>

                <div className="bg-white/5 p-8 rounded-2xl text-center mb-8 border border-white/10">
                    <p className="text-gray-400 mb-4">من فضلك غمض عينيك وردد في سرك لمدة دقيقة :</p>
                    <h3 className="text-2xl md:text-3xl font-bold text-white">
                        "ياربي يسوع المسيح .. دبر حياتي كما يليق"
                    </h3>
                </div>

                <div className="bg-green-900/10 p-6 rounded-xl border border-green-500/20 text-center">
                    <p className="text-green-200 text-lg leading-relaxed">
                        النهاردة .. ربنا بيكرر الدعوة ليك إنك تخلي عينك وهدفك علي السما ... هتلاقيك كدة كدة بتعمل كل حاجة انت بتحبها (خروجات وأصحاب ولعب ومذاكرة و ... ) بس كل ده باصصله من فوووووق وشايفه صغير جنب اللي ربنا مجهزه لك ..
                    </p>
                </div>

                <div className="mt-8">
                    <label className="block text-lg font-medium text-white mb-2">
                        صلاة ختامية أو قرار:
                    </label>
                    <textarea
                        value={reflection3}
                        onChange={(e) => handleSave('elkhelwa_reflection3', e.target.value)}
                        placeholder="يارب..."
                        className="w-full bg-[#0F1218] border border-white/10 rounded-xl p-4 text-white text-lg min-h-[100px] focus:ring-2 focus:ring-accent-gold outline-none transition-all placeholder-gray-600"
                    />
                </div>
            </motion.section>

        </div>
    );
};

export default ElKhelwaView;
