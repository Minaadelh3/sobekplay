import React, { Component, ErrorInfo, ReactNode } from 'react';

interface Props {
    children: ReactNode;
}

interface State {
    hasError: boolean;
    error: Error | null;
    errorInfo: ErrorInfo | null;
}

class GlobalErrorBoundary extends Component<Props, State> {
    public state: State = {
        hasError: false,
        error: null,
        errorInfo: null,
    };

    public static getDerivedStateFromError(error: Error): State {
        return { hasError: true, error, errorInfo: null };
    }

    public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
        console.error("Uncaught error:", error, errorInfo);
        this.setState({ errorInfo });
    }

    public render() {
        if (this.state.hasError) {
            return (
                <div className="fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-black text-white p-6 overflow-auto font-mono">
                    <div className="max-w-2xl w-full border border-red-500/50 rounded-lg bg-red-900/10 p-8 shadow-2xl">
                        <h1 className="text-3xl font-bold text-red-500 mb-4">Application Crashed</h1>
                        <p className="text-gray-300 mb-6">
                            A check-engine light just went off. Please report this to the developer.
                        </p>

                        {this.state.error && (
                            <div className="mb-6">
                                <h2 className="text-sm font-bold text-red-400 uppercase tracking-widest mb-2">Error Message</h2>
                                <div className="bg-black/50 p-4 rounded border border-white/10 text-red-200 break-words">
                                    {this.state.error.toString()}
                                </div>
                            </div>
                        )}

                        {this.state.errorInfo && (
                            <div className="mb-6">
                                <h2 className="text-sm font-bold text-gray-500 uppercase tracking-widest mb-2">Component Stack</h2>
                                <pre className="bg-black/50 p-4 rounded border border-white/10 text-gray-400 text-xs overflow-x-auto">
                                    {this.state.errorInfo.componentStack}
                                </pre>
                            </div>
                        )}

                        <button
                            onClick={() => window.location.reload()}
                            className="px-6 py-3 bg-red-600 hover:bg-red-700 text-white font-bold rounded transition-colors"
                        >
                            Restart Application
                        </button>
                    </div>
                </div>
            );
        }

        return this.props.children;
    }
}

export default GlobalErrorBoundary;
