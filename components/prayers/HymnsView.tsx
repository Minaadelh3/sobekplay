import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowRight, Music, ChevronRight } from 'lucide-react';

const HymnsView: React.FC = () => {
    const [selectedHymn, setSelectedHymn] = useState<string | null>(null);

    const hymns = [
        {
            id: 'fi-kol-khaliqa',
            title: "في كل خليقة رأيتك",
            lyrics: `
1. في كل خليقة لمستك في حياتي كلها.
وفي كل جميل رأيتك أعمالك.
لمستك رأيتك عرفتك.
شكرًا لك.

2. سألتك كثيرًا فأجبتني رفعت إليك يدي.
طلبتك كثيرًا فجئتني أمسكتني.

3. سمعت صوتك يهمس في أذني تنفستك نسيمًا.
أحسست نبضك في عروق يدي في رئتي.

4. عرفتك في اقترابي وابتعادي.
            `
        },
        {
            id: 'lam-tara-ein',
            title: "لم تر عين إله غيرك",
            lyrics: `
القرار:
لم ترَ عينٌ إلهًا غيرَكَ (2)

1. لم ترَ عينٌ إلهًا غيرَكَ، يفتح السجن وينزع القيود.
ويشق الغمر فإذا طريق، لا تعوقه جبال أو سدود.

2. مَن سواك يتراءى في الأتون، أو ينجي النفس من جب الأسود.
مَن ينير القفر إن حل الظلام، بلهيب حب في صورة عامود.

3. كم تألمت على عود الصليب، كي تعد لي مكانًا في الخلود.
ووعدتني ستأتي عن قريب، وتهبني ثقل مجد بالصعود.
            `
        },
        {
            id: 'sabehoho-magedoho',
            title: "سبحوه مجدوه",
            lyrics: `
القرار:
سبّحوه مجّدوه زيدوه علواً إلى الأبد رحمته.
فهو المسبّح والممجّد والمتعالي على الأدهار وإلى الأبد رحمته.

1. قام المسيح والنور في قبره شهادة حية على قيامته طول العصور.
قام المسيح وبه هنقوم وهنحيا معاه في الأبدية لآخر الدهور.
قام المسيح وانتصر ع الموت والألم.
قام المسيح من الأموات، افرحوا يا كل الأمم.

2. قام المسيح ولو ما كان قام من الموت كانت الكرازة باطلة.
لكن الآن قام المسيح وصار باكورة الراقدين من أجلنا.
قام المسيح وقهر قوات الظلام.
قام المسيح من الأموات، سبحوه يا كل الأمم.
            `
        },
        {
            id: 'rafaato-aynai',
            title: "رفعت عيني الى الجبال",
            lyrics: `
رفعتُ عينيَّ إلى الجبالِ من حيثُ يأتي عوني.
معونتي من عندِ الربّ صانعِ السماءِ والأرضِ.

لا يدعُ رِجلكَ تزلّ، لا ينعسُ لا ينامُ.
الربُّ يحفظكَ، الربُّ سترٌ لكَ.

لا تؤذيكَ الشمسُ في النهارِ ولا القمرُ في الليلِ.
يحفظكَ الربُّ من كلِّ سوءٍ، يحفظُ الربُّ نفسكَ.

يحفظُ الربُّ ذهابكَ وإيابكَ من الآنَ وإلى الأبدِ.
            `
        },
        {
            id: 'khadana-ala-gabal',
            title: "خدنا على جبل عالي",
            lyrics: `
القرار:
خدنا على جبل عالي هنينا بجلسة معاك
كل النفوس حتفرح وتهلل برؤياك
عايزينك أنت بيدك توزع الهبات
ده أنت في العطاء سخي ولا عندك تعييرات
عزينا يارب بصوتك ده كلك مشتهيات

1. خدنا على جبل عالي وهنينا بجلسة معاك
كل القلوب هتفرح وتهلل برؤياك
ده كلامك هو المحي المشبع باللذات
            `
        },
        {
            id: 'hoos-4',
            title: "الهوس الرابع",
            lyrics: `
سبحوا الرب من السموات، سبحوه في الأعالي.
سبحوه يا جميع ملائكته، سبحوه يا جميع جنوده.
سبحوه يا أيتها الشمس والقمر، سبحوه يا جميع كواكب النور.
سبحوه يا سماء السموات، ويا أيتها المياه التي فوق السموات.
لتسبح اسم الرب، لأنه هو قال فكانت، هو أمر فخلقت.

(المزمور 150)
سبحوا الله في جميع قديسيه. هلليلويا.
سبحوه في جلد قوته. هلليلويا.
سبحوه على مقدرته. هلليلويا.
سبحوه كثرة عظمة جلاله. هلليلويا.
سبحوه بصوت البوق. هلليلويا.
سبحوه بمزمار وقيثارة. هلليلويا.
سبحوه بدفوف وصفوف. هلليلويا.
سبحوه بأوتار وأرغن. هلليلويا.
سبحوه بصنوج حسنة الصوت. هلليلويا.
سبحوه بصنوج التهليل. هلليلويا.
كل نسمة فلتسبح اسم الرب إلهنا. هلليلويا.
            `
        },
        {
            id: 'wa-feema-azonoho',
            title: "وفيما اظنه لا يستجيب",
            lyrics: `
1. وفيما أظنه لا يستجيب .. أراه يمد يديه العجيب
ليلمس عيني .. ويفتح عيني .. وشخص الحبيب
أمامي يمحو كل هم .. ودمع سكيب .. يبدل نوحي بأغنيتي
ويشعل في .. لهيب السجود .. لربي المجيب

2. وفيما أظنه لا يستجيب .. أراه قريبا وليس بعيد
يمد يديه .. يشق البحور .. يهد السدود .. ويطلق سبي
ويكسر قيدا .. وفك الأسود .. يحرر نفسي
ويشفي السقيم .. ويحيي العظام .. رميما تعود .. لشخص قدير
وملك مجيد .. إله الوجود

3. وفيما أظنه لا يستجيب .. يجيئ إلهي بقلب رحيم
يحب الأثيم .. ويكره إثمي .. وذنبي العظيم
فمات بدالي .. وكان بريئا .. وحملي أليم
ومات وقام .. وصار شفيعي .. وربي الكريم
يسوع المسيح .. نصير الضعيف .. وركن الأليم
            `
        },
        {
            id: 'al-rab-qhareeb',
            title: "الرب قريب",
            lyrics: `
القرار:
الرب قريب لمن يدعوهُ
ليس بعيدًا كما زعموا
ليس غريبًا عن كل ما قاسوه
فهو الذي دعا جميع المتعبين
ليريحهم من حملٍ ثقيل
ليمسح دمعةً عن كل قلبٍ حزين

1. أوَ لَمْ يَعِيشَ هَارِبَاً؟ أمَا تَأَلَّمَ مُجَرَّبَاً؟
أوَ لَمْ يَقُومَ وَاهِبَاً لَنَا الحَيَاةْ
كَانَ مُحِبَّ العَشَّارِينْ، مُلَازِمَاً لِصَيَّادِينْ
سَاتِرَاً لِخَاطِئِينْ .. مِثْلِيْ أَنَا

2. كَانَ يُجَاوِبُ سَائِلَاً والخَيْرَ يَصْنَعُ جَائِلَاً
وَذَاقَ المَوْتَ حَامِلَاً خِزْيَ الخُطَاهْ
وَأَمَامَ قَبْرٍ بَاكِيَاً، فِيْ لَيْلَةِ مَوْتِهِ جَاثِيَاً
رَأيْتُهُ يَعْرَقُ دَامِيَاً مِنَ الآلَامْ

3. فَكَيْفَ لَا أَثِقُ بِهِ .. ؟؟
أَشُكُّ فِيْ حُبِّهِ ..؟؟
أَبِي الَذِيْ أَحَبَّنِيْ إِلَى المَمَاتْ
            `
        }
    ];

    const activeHymnData = hymns.find(h => h.id === selectedHymn);

    return (
        <div className="w-full max-w-7xl mx-auto px-4 py-8">
            <AnimatePresence mode="wait">
                {!selectedHymn ? (
                    <motion.div
                        key="list"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
                    >
                        <div className="col-span-full text-center mb-8">
                            <h2 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-emerald-200 to-teal-400 mb-4">
                                مكتبة الترانيم
                            </h2>
                            <p className="text-white/60">باقة مختارة من الترانيم الروحية</p>
                        </div>

                        {hymns.map((hymn, index) => (
                            <motion.button
                                key={hymn.id}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: index * 0.05 }}
                                onClick={() => setSelectedHymn(hymn.id)}
                                whileHover={{ scale: 1.02, y: -5 }}
                                whileTap={{ scale: 0.98 }}
                                className="relative overflow-hidden rounded-2xl bg-white/5 border border-white/10 p-6 text-right hover:bg-white/10 transition-all duration-300 group h-full flex flex-col justify-between"
                            >
                                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-emerald-500 to-teal-500 opacity-0 group-hover:opacity-100 transition-opacity" />

                                <div>
                                    <div className="flex justify-between items-start mb-4">
                                        <div className="p-3 rounded-xl bg-emerald-500/20 text-2xl group-hover:scale-110 transition-transform duration-300">
                                            <Music className="w-6 h-6 text-emerald-300" />
                                        </div>
                                        <ChevronRight className="w-5 h-5 text-white/30 group-hover:text-white/70 rotate-180 transition-colors" />
                                    </div>

                                    <h3 className="text-xl font-bold text-white mb-2 leading-relaxed">{hymn.title}</h3>
                                </div>

                                <div className="mt-4 pt-4 border-t border-white/5 flex items-center justify-between text-xs text-white/40 group-hover:text-emerald-300 transition-colors">
                                    <span>كلمات الترنيمة</span>
                                    <ArrowRight className="w-4 h-4 rotate-180 opacity-0 group-hover:opacity-100 transition-opacity" />
                                </div>
                            </motion.button>
                        ))}
                    </motion.div>
                ) : (
                    <motion.div
                        key="content"
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: 20 }}
                        className="max-w-3xl mx-auto"
                    >
                        <button
                            onClick={() => setSelectedHymn(null)}
                            className="flex items-center gap-2 text-white/70 hover:text-white mb-8 group transition-colors"
                        >
                            <ArrowRight className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
                            <span>العودة للمكتبة</span>
                        </button>

                        <div className="bg-white/5 border border-white/10 rounded-3xl p-8 md:p-12 relative overflow-hidden">
                            <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-emerald-500 to-teal-500" />

                            <div className="text-center mb-12">
                                <div className="w-16 h-16 bg-emerald-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
                                    <Music className="w-8 h-8 text-emerald-300" />
                                </div>
                                <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
                                    {activeHymnData?.title}
                                </h2>
                            </div>

                            <div className="prose prose-invert prose-lg max-w-none text-center leading-loose whitespace-pre-line text-white/90 font-medium">
                                {activeHymnData?.lyrics}
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default HymnsView;
