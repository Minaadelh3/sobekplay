import React, { useState, useEffect } from 'react';
import { useOneSignal } from '../../hooks/useOneSignal';
import { useAuth } from '../../context/AuthContext';
import { Bell, BellOff, RefreshCw, Smartphone, Shield, User } from 'lucide-react';

const PushDebug: React.FC = () => {
    const { isInitialized, enableNotifications, subscriptionId, permission, isSupported, logs, addLog } = useOneSignal();
    const { user } = useAuth();
    const [swRegistration, setSwRegistration] = useState<ServiceWorkerRegistration | null>(null);

    useEffect(() => {
        if ('serviceWorker' in navigator) {
            navigator.serviceWorker.getRegistration().then(reg => {
                setSwRegistration(reg || null);
                if (reg) addLog(`SW Found at: ${reg.scope} (${reg.active ? 'Active' : 'Inactive'})`);
                else addLog("No default SW found yet.");
            });
        }
    }, [addLog]);

    const checkSw = async () => {
        if ('serviceWorker' in navigator) {
            const regs = await navigator.serviceWorker.getRegistrations();
            addLog(`Found ${regs.length} Service Workers:`);
            regs.forEach(r => addLog(` - ${r.scope} -> ${r.active?.scriptURL}`));
        } else {
            addLog("Service Workers not supported in this browser.");
        }
    };

    return (
        <div className="p-6 max-w-4xl mx-auto space-y-6 text-slate-100">
            <h1 className="text-3xl font-bold bg-gradient-to-r from-emerald-400 to-cyan-500 bg-clip-text text-transparent mb-8">
                Push Notification Debugger
            </h1>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

                {/* Status Card */}
                <div className="bg-slate-900 border border-slate-800 rounded-lg overflow-hidden">
                    <div className="p-4 border-b border-slate-800 flex items-center gap-2">
                        <Smartphone className="w-5 h-5 text-purple-400" />
                        <h2 className="font-semibold text-lg">System Status</h2>
                    </div>
                    <div className="p-4 space-y-4">
                        <div className="flex justify-between items-center bg-slate-800/50 p-3 rounded">
                            <span>Push Support</span>
                            <span className={`px-2 py-1 rounded text-xs font-bold ${isSupported ? 'bg-emerald-500/20 text-emerald-400' : 'bg-red-500/20 text-red-400'}`}>
                                {isSupported ? "Supported" : "Not Supported"}
                            </span>
                        </div>
                        <div className="flex justify-between items-center bg-slate-800/50 p-3 rounded">
                            <span>SDK Initialized</span>
                            <span className={`px-2 py-1 rounded text-xs font-bold ${isInitialized ? 'bg-blue-500/20 text-blue-400' : 'bg-slate-700 text-slate-400'}`}>
                                {isInitialized ? "Yes" : "No"}
                            </span>
                        </div>
                        <div className="flex justify-between items-center bg-slate-800/50 p-3 rounded">
                            <span>Permission</span>
                            <span className={`px-2 py-1 rounded text-xs font-bold ${permission === 'granted' ? 'bg-green-500 text-white' :
                                permission === 'denied' ? 'bg-red-500 text-white' : 'bg-yellow-500 text-black'
                                }`}>
                                {permission.toUpperCase()}
                            </span>
                        </div>
                        <div className="flex justify-between items-center bg-slate-800/50 p-3 rounded">
                            <span>Service Worker</span>
                            <span className="text-xs font-mono text-slate-400">
                                {swRegistration ? "Registered" : "Missing"}
                            </span>
                        </div>
                    </div>
                </div>

                {/* Identity Card */}
                <div className="bg-slate-900 border border-slate-800 rounded-lg overflow-hidden">
                    <div className="p-4 border-b border-slate-800 flex items-center gap-2">
                        <User className="w-5 h-5 text-blue-400" />
                        <h2 className="font-semibold text-lg">Identity</h2>
                    </div>
                    <div className="p-4 space-y-4">
                        <div className="space-y-1">
                            <div className="text-xs text-slate-500 uppercase font-bold">App User ID (Firebase)</div>
                            <div className="font-mono text-sm break-all text-slate-300">{user?.id || 'Not Logged In'}</div>
                        </div>
                        <div className="space-y-1">
                            <div className="text-xs text-slate-500 uppercase font-bold">OneSignal Player ID</div>
                            <div className="font-mono text-sm break-all text-emerald-400">
                                {subscriptionId || 'Not Subscribed'}
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Actions */}
            <div className="bg-slate-900 border border-slate-800 rounded-lg overflow-hidden">
                <div className="p-4 border-b border-slate-800">
                    <h2 className="font-semibold text-lg">Actions</h2>
                </div>
                <div className="p-4 flex flex-wrap gap-4">
                    <button
                        onClick={enableNotifications}
                        disabled={permission === 'granted' && !!subscriptionId}
                        className={`inline-flex items-center px-4 py-2 rounded-md text-sm font-medium transition-colors
                            ${permission === 'granted' && !!subscriptionId
                                ? 'bg-slate-700 text-slate-400 cursor-not-allowed'
                                : 'bg-emerald-600 hover:bg-emerald-700 text-white'}`}
                    >
                        <Bell className="w-4 h-4 mr-2" />
                        {permission === 'granted' && !subscriptionId ? "Resubscribe / Sync" : "Enable Notifications"}
                    </button>

                    <button
                        onClick={checkSw}
                        className="inline-flex items-center px-4 py-2 rounded-md text-sm font-medium bg-slate-800 hover:bg-slate-700 text-white transition-colors"
                    >
                        <Shield className="w-4 h-4 mr-2" />
                        Check Service Workers
                    </button>

                    <button
                        onClick={() => window.location.reload()}
                        className="inline-flex items-center px-4 py-2 rounded-md text-sm font-medium border border-slate-700 hover:bg-slate-800 text-white transition-colors"
                    >
                        <RefreshCw className="w-4 h-4 mr-2" />
                        Reload Page
                    </button>
                </div>
            </div>

            {/* Permission Warning */}
            {permission === 'denied' && (
                <div className="bg-red-500/10 border border-red-500/50 rounded-lg p-4 flex gap-3 text-red-200">
                    <BellOff className="h-5 w-5 shrink-0" />
                    <div>
                        <h4 className="font-bold mb-1">Notifications Blocked</h4>
                        <p className="text-sm">
                            You have blocked notifications for this site. You must manually enable them in your browser settings (click the lock icon in the address bar).
                        </p>
                    </div>
                </div>
            )}

            {/* Logs Console */}
            <div className="bg-slate-950 border border-slate-800 rounded-lg overflow-hidden">
                <div className="p-3 border-b border-slate-800 bg-slate-900/50">
                    <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500">
                        Live Debug Logs
                    </h3>
                </div>
                <div className="h-[200px] overflow-y-auto w-full bg-black p-4 font-mono text-xs text-green-400">
                    {logs.length === 0 ? (
                        <div className="text-slate-600 italic">No logs yet...</div>
                    ) : (
                        logs.map((log, i) => (
                            <div key={i} className="mb-1 border-b border-white/5 pb-1 last:border-0">
                                {log}
                            </div>
                        ))
                    )}
                </div>
            </div>
        </div>
    );
};

export default PushDebug;
