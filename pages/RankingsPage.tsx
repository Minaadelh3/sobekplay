import React from 'react';
import { motion } from 'framer-motion';
import MyPoints from '../components/gamification/MyPoints';
import MyTeam from '../components/gamification/MyTeam';
import Leaderboard from '../components/gamification/Leaderboard';
import MobileBackHeader from '../components/MobileBackHeader';

const RankingsPage: React.FC = () => {
    return (
        <div className="min-h-screen bg-[#070A0F] pb-24 md:pb-12" dir="rtl">
            <MobileBackHeader title="الترتيب" />

            {/* Desktop Header spacer */}
            <div className="hidden md:block h-24" />
            <div className="md:hidden h-16" />

            <div className="max-w-7xl mx-auto px-4">
                {/* Header Section */}
                <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mb-8 text-center md:text-right"
                >
                    <h1 className="text-3xl font-black text-white mb-2 hidden md:block">
                        الترتيب <span className="text-accent-gold">والمكافآت</span>
                    </h1>
                    <p className="text-gray-400 max-w-2xl hidden md:block">
                        اتنافس مع صحابك، اجمع نقاط، وخلي فريقك يوصل للقمة!
                        <br />
                        <span className="text-accent-gold/80 text-sm">فاكر دايمًا: التحفيز أهم من المنافسة</span>
                    </p>
                </motion.div>

                {/* Top Section: Personal & Team Stats */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
                    <MyPoints />
                    <MyTeam />
                </div>

                {/* Leaderboard Section */}
                <div className="mb-12">
                    <Leaderboard />
                </div>
            </div>
        </div>
    );
};

export default RankingsPage;
