
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { UNCLE_JOY_AVATAR } from '../lib/avatars';

export default function AdminLogsPage() {
    const navigate = useNavigate();

    return (
        <div className="min-h-screen bg-[#070A0F] text-white p-6 pb-24 pt-24 font-sans" dir="rtl">
            <div className="flex items-center gap-3 mb-8">
                <button
                    onClick={() => navigate('/admin')}
                    className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center hover:bg-white/10"
                >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
                </button>
                <h1 className="text-xl font-bold">سجل العمليات</h1>
                <img src={UNCLE_JOY_AVATAR} className="w-8 h-8 rounded-full ml-auto" />
            </div>

            <div className="text-center py-20 bg-[#141414] rounded-2xl border border-white/5">
                <p className="text-4xl mb-4">🚧</p>
                <p className="text-gray-400">قريباً: سجل الحركات</p>
            </div>
        </div>
    );
}
