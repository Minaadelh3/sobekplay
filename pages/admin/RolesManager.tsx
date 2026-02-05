import React from 'react';
import { motion } from 'framer-motion';

// Mock Permissions Data (In a real app, this might come from the Permission Service)
const ROLES = ['USER', 'MODERATOR', 'ADMIN', 'SUPER_ADMIN'];
const PERMISSIONS = [
    { id: 'view_dashboard', label: 'View Dashboard', roles: ['MODERATOR', 'ADMIN', 'SUPER_ADMIN'] },
    { id: 'manage_users', label: 'Manage Users', roles: ['ADMIN', 'SUPER_ADMIN'] },
    { id: 'manage_teams', label: 'Manage Teams', roles: ['ADMIN', 'SUPER_ADMIN'] },
    { id: 'adjust_points', label: 'Adjust Points (Limited)', roles: ['MODERATOR', 'ADMIN', 'SUPER_ADMIN'] },
    { id: 'adjust_points_limitless', label: 'Adjust Points (Unlimited)', roles: ['SUPER_ADMIN'] },
    { id: 'view_logs', label: 'View Audit Logs', roles: ['ADMIN', 'SUPER_ADMIN'] },
    { id: 'system_config', label: 'System Configuration', roles: ['SUPER_ADMIN'] },
    { id: 'ban_users', label: 'Ban/Unban Users', roles: ['ADMIN', 'SUPER_ADMIN'] },
];

export default function RolesManager() {
    return (
        <div className="space-y-6">
            <div className="bg-[#141414] border border-white/5 rounded-2xl p-6 shadow-lg">
                <div className="flex justify-between items-center mb-6">
                    <div>
                        <h2 className="text-2xl font-bold text-white flex items-center gap-2">
                            <span>🛡️</span> Roles & Permissions Matrix
                        </h2>
                        <p className="text-gray-500 text-sm mt-1">
                            Visualize system-wide Role-Based Access Control (RBAC).
                            <span className="text-orange-400 text-xs ml-2 bg-orange-500/10 px-2 py-0.5 rounded border border-orange-500/20">Read Only</span>
                        </p>
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead>
                            <tr className="border-b border-white/10">
                                <th className="py-4 px-6 text-xs uppercase text-gray-500 font-bold bg-[#0F1218] sticky left-0 z-10 w-1/3">Permission</th>
                                {ROLES.map(role => (
                                    <th key={role} className="py-4 px-6 text-center text-xs uppercase text-gray-500 font-bold bg-[#0F1218]">
                                        <div className="flex flex-col items-center gap-1">
                                            <span>{role.replace('_', ' ')}</span>
                                            {role === 'SUPER_ADMIN' && <span className="text-[9px] text-accent-gold">GOD MODE</span>}
                                        </div>
                                    </th>
                                ))}
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5">
                            {PERMISSIONS.map((perm) => (
                                <tr key={perm.id} className="hover:bg-white/[0.02] transition-colors">
                                    <td className="py-4 px-6 font-medium text-gray-300 bg-[#141414] sticky left-0 border-r border-white/5">
                                        {perm.label}
                                        <div className="text-[10px] text-gray-600 font-mono mt-0.5">{perm.id}</div>
                                    </td>
                                    {ROLES.map(role => {
                                        const hasPerm = perm.roles.includes(role);
                                        return (
                                            <td key={role} className="py-4 px-6 text-center">
                                                {hasPerm ? (
                                                    <motion.div
                                                        initial={{ scale: 0 }} animate={{ scale: 1 }}
                                                        className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-green-500/10 text-green-500 border border-green-500/20"
                                                    >
                                                        ✓
                                                    </motion.div>
                                                ) : (
                                                    <div className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-gray-800/50 text-gray-700">
                                                        -
                                                    </div>
                                                )}
                                            </td>
                                        );
                                    })}
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                <div className="mt-8 p-4 bg-blue-900/10 border border-blue-500/10 rounded-xl flex gap-4 items-start">
                    <span className="text-xl">ℹ️</span>
                    <div>
                        <h4 className="font-bold text-blue-400 text-sm mb-1">About Permissions</h4>
                        <p className="text-gray-400 text-xs leading-relaxed">
                            Permissions are currently defined in the application code (`lib/permissions.ts`) for security.
                            If you need to create a custom role or modify specific access rights, please contact the development team to deploy a rule update.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
