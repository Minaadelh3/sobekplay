import React from 'react';
import { motion } from 'framer-motion';

const PatronReading: React.FC = () => {
    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="max-w-4xl mx-auto p-4 md:p-8 text-right"
            style={{ direction: 'rtl' }}
        >
            <header className="mb-8 border-b border-white/10 pb-8">
                <h1 className="text-4xl font-black text-white mb-2">تأملات روحية</h1>
                <p className="text-xl text-accent-gold">سفر يشوع بن سيراخ</p>
            </header>

            <div className="prose prose-invert prose-lg max-w-none text-gray-200 leading-loose">
                <p className="mb-4">
                    "يا بني، إن أقبلت لخدمة الرب الإله، فأعدد نفسك للتجربة. وجه قلبك واحتمل، ولا تستعجل في وقت النوازل."
                </p>
                <p>
                    (سيراخ 2: 1-2)
                </p>
            </div>
        </motion.div>
    );
};

export default PatronReading;
