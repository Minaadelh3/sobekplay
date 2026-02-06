import React, { Component, ErrorInfo } from 'react';
import { addDoc, collection, serverTimestamp } from 'firebase/firestore';
import { db } from '../../lib/firebase';
// Assuming you have an AuthContext to get current user ID, but class components need a wrapper or context consumer.
// For simplicity in this architectural fix, we will pass userId as a prop or try to get it if possible, 
// or simpler: just use a functional wrapper around this if we strictly needed hooks. 
// standard ErrorBoundary is a Class Component.

interface Props {
    children: React.ReactNode;
    userId?: string;
    gameId?: string;
}

interface State {
    hasError: boolean;
    error: Error | null;
}

export class GamesErrorBoundary extends Component<Props, State> {
    constructor(props: Props) {
        super(props);
        this.state = { hasError: false, error: null };
    }

    static getDerivedStateFromError(error: Error): State {
        return { hasError: true, error };
    }

    componentDidCatch(error: Error, errorInfo: ErrorInfo) {
        // Log to Firestore
        this.logErrorToFirestore(error, errorInfo);
        console.error("Games System Caught Error:", error, errorInfo);
    }

    logErrorToFirestore = async (error: Error, errorInfo: ErrorInfo) => {
        try {
            await addDoc(collection(db, 'game_errors'), {
                userId: this.props.userId || 'anonymous',
                gameId: this.props.gameId || 'unknown',
                errorMessage: error.message,
                stack: error.stack,
                componentStack: errorInfo.componentStack,
                timestamp: serverTimestamp(),
                url: window.location.href
            });

            // Lightweight admin log
            await addDoc(collection(db, 'admin_logs'), {
                type: 'GAME_ERROR',
                message: `Game Crash: ${error.message}`,
                timestamp: serverTimestamp()
            });
        } catch (logErr) {
            console.error("Failed to log game error:", logErr);
        }
    };

    handleRetry = () => {
        this.setState({ hasError: false, error: null });
        window.location.reload(); // Simple retry for now, or could just reset state if logic allows
    };

    handleBack = () => {
        window.location.href = '/games'; // Force hard nav to clear potentially bad state
    };

    render() {
        if (this.state.hasError) {
            return (
                <div className="flex flex-col items-center justify-center min-h-[50vh] p-6 text-center bg-[#0B0F14] text-white rounded-3xl border border-red-900/30">
                    <div className="text-6xl mb-4">🐊⚠️</div>
                    <h2 className="text-2xl font-bold text-red-500 mb-2">اللعبة وقفت فجأة</h2>
                    <p className="text-gray-400 mb-6 max-w-md">
                        متخافش، دي مشكلة تقنية بسيطة واحنا عرفنا بيها.
                        <br />
                        جرب تعمل إعادة تحميل أو ارجع لصفحة الألعاب.
                    </p>

                    <div className="flex gap-4">
                        <button
                            onClick={this.handleRetry}
                            className="bg-accent-gold text-black px-6 py-2 rounded-xl font-bold hover:scale-105 transition-transform"
                        >
                            🔁 إعادة المحاولة
                        </button>
                        <button
                            onClick={this.handleBack}
                            className="bg-white/10 text-white px-6 py-2 rounded-xl font-bold hover:bg-white/20 transition-colors"
                        >
                            ⬅️ رجوع للألعاب
                        </button>
                    </div>

                    {/* Developer Details (Hidden in Prod usually, but useful now) */}
                    {process.env.NODE_ENV === 'development' && (
                        <div className="mt-8 p-4 bg-black/50 rounded text-left text-xs text-red-300 font-mono w-full overflow-auto max-h-32">
                            {this.state.error?.toString()}
                        </div>
                    )}
                </div>
            );
        }

        return this.props.children;
    }
}
